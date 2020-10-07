var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');

var client_id = '1bce4a2558cb436da9a2848ccfefa9fe'; // Your client id
var client_secret = '738fea8d41dd4de7a70605eda1642785'; // Your secret
var redirect_uri = 'http://h2906768.stratoserver.net/callback/'; // Your redirect uri

var stateKey = 'spotify_auth_state';

/**
 * Generates a random string containing numbers and letters
 * @param {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var app = express();

var conn = mysql.createConnection({
    host: "localhost",
    user: "liederheim",
    password: "lf32Qx^8",
    database: "liederheim"
});
							   
app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

app.get('/login', function(req, res) {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {

                access_token = body.access_token;
                refresh_token = body.refresh_token;

                // pass the token to the browser to make requests from there
                res.redirect('/#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            access_token = body.access_token;
            // pass the token to the browser to make requests from there
            res.redirect('/#' +
                querystring.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));
        }
    });
});

app.get('/database_connection', function(req, res) {
    // only try to open connection when no connection is currently open
    if (conn.state == 'disconnected') {
        // open a connection with the database
        conn.connect(function(err) {
            if (err) res.send(err);
		    res.send("success");
        });
    } else {
		res.send("already open");
	}
});

app.get('/get_songIDs', function(req, res) {
    // retrieve all the songs in random order
    conn.query("SELECT SongID FROM songs ORDER BY RAND()", function(err, result, fields) {
        if (err) res.send(err);
        var songIdArray = [];
        for (var id = 0; id < result.length; id++) {
            songIdArray.push(result[id].SongID);
        }
        res.send(songIdArray);
    });
});

app.get('/insert_vote', function(req, res) {
    // insert vote into the database
    var id = req.query.songId;
    var vote = req.query.isHot;
    conn.query("INSERT INTO votes (SongID, VotedHot) VALUES (\"" + id + "\", " + vote + ")", function(err, result, fields) {
        if (err) {
            res.send("");
        };
    });
    res.send("success");
});

app.listen(3000);