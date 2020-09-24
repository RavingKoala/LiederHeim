(function() {
    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }
    var params = getHashParams();
    access_token = params.access_token;
    refresh_token = params.refresh_token;
    error = params.error;


    function getSong(access_token, songId) {
        $.ajax({
            url: 'https://api.spotify.com/v1/tracks/' + songId,
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                console.log(response);
                var coverArtImage = document.getElementById("coverArtImage"),
                    namefield = document.getElementById("nameField"),
                    artistField = document.getElementById("artistField");
                artistField.innerHTML = "";
                console.log(response["album"]["images"][0]["url"]);
                coverArtImage.src = response["album"]["images"][0]["url"];
                namefield.innerHTML = response["name"];
                for (var i in response["artists"]) {
                    artistField.innerHTML += response["artists"][i]["name"] + " ";
                }
            }
        });
    }

    function getNewToken(refresh_token) {
        $.ajax({
            url: '/refresh_token',
            data: {
                'refresh_token': refresh_token
            }
        }).done(function(data) {
            access_token = data.access_token;
            console.log();
        });
    }

    function prevSong(access_token) {
        songIndex -= 1;
        getSong(access_token, songs[songIndex]);
    }

    function nextSong(access_token) {
        songIndex += 1;
        getSong(access_token, songs[songIndex]);
    }

    if (error) {
        alert('There was an error during the api authentication');
    } else {
        if (access_token) {
            getSong(access_token, songs[songIndex]);
        } else {
            window.location.replace("/login");
        }

        document.getElementById('obtain-new-token').addEventListener("click", function() {
            getNewToken(refresh_token);
        }, false);
        document.getElementById('nextSong').addEventListener("click", function() {
            nextSong(access_token);
        });
        document.getElementById('prevSong').addEventListener("click", function() {
            prevSong(access_token);
        });
    }
})();
