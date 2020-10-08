/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var mysql = require('mysql');
var cors = require('cors');
var cookieParser = require('cookie-parser');

var client_id = 'a9bb1162a3fc48239ae5cd4f78e889e7'; // Your client id
var client_secret = 'fc16f87997d64f33817b21485c3c6cda'; // Your secret
var token;
var app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "liederheim"
});

// your application requests authorization
var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
        grant_type: 'client_credentials'
    },
    json: true
};

request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

        // use the access token to access the Spotify Web API
        token = body.access_token;
    }
});

app.get('/getSpotifySong', function(req, res) {
    console.log(client_id);
    // insert vote into the database
    var songId = req.query.songId;
    var options = {
        url: 'https://api.spotify.com/v1/tracks/' + songId,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        json: true
    };
    request.get(options, function(error, response, body) {
        res.send(body);
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

app.listen(8888);
