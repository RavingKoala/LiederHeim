function startAPI() {
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


    function getNewToken(refresh_token) {
        $.ajax({
            url: '/refresh_token',
            data: {
                'refresh_token': refresh_token
            }
        }).done(function(data) {
            access_token = data.access_token;
        });
    }

    function getSong(access_token, songId) {
        $.ajax({
            url: 'https://api.spotify.com/v1/tracks/' + songId,
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                var songEmbed = document.getElementById("songEmbed");
                songEmbed.src = "https://open.spotify.com/embed/track/" + response["id"];
            }
        }).fail(function() {
            console.log("FAILLLLLL BITCH");
            getNewToken();
        });
    }

    function endVoting() {
        document.getElementById('hot').style.display = "none";
        document.getElementById('not').style.display = "none";
        document.body.style.backgroundColor = "#0AEB0A";
        document.getElementById('songCard').remove();
        document.getElementById('endCard').style.display = "block";
    }

    function nextSong(access_token) {
        if (songIndex + 1 <= songs.length - 1) {
            songIndex += 1;
            getSong(access_token, songs[songIndex]);
        } else {
            endVoting();
        }
    }

    function fadeOut(isHot) {
        if (isHot == "1") {
            $("#songCard").animate({
                opacity: 0,
                left: "80vw",
                rotation: 90
            }, 350, "linear", function() {
                $(this).css("left", "50vw");
                $(this).css("opacity", "1");
            });
        } else {
            $("#songCard").animate({
                opacity: 0,
                left: "20vw"
            }, 350, "linear", function() {
                $(this).css("left", "50vw");
                $(this).css("opacity", "1");
            });
        }
    }

    function doVote(isHot) {
        $.ajax({
            url: '/insert_vote/?songId=' + songs[songIndex] + '&isHot=' + isHot
        }).done(function(data) {
            if (data == "success") {
                fadeOut(isHot);
                nextSong(access_token);
            }
        }).fail(function() {
            return false;
        });
    }

    if (error) {
        alert('There was an error during the api authentication');
    } else {
        if (access_token) {
            getSong(access_token, songs[songIndex]);
        } else {
            window.location.replace("/login");
        }

        document.getElementById('hot').addEventListener("click", function() {
            doVote("1");
        });
        document.getElementById('not').addEventListener("click", function() {
            doVote("0");
        });
    }
}
