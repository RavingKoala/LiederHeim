function startAPI() {

    var allowedVote = true;


    function getSong(songId) {
        $.ajax({
            url: '/getSpotifySong/?songId=' + songId
        }).done(function(data) {
            var songEmbed = document.getElementById("songEmbed");
            songEmbed.src = "https://open.spotify.com/embed/track/" + data["id"];
        }).fail(function() {
            console.log("FAILLLLLL BITCH");
        });
    }
    getSong(songs[songIndex]);

    function endVoting() {
        document.getElementById('hot').style.display = "none";
        document.getElementById('not').style.display = "none";
        document.body.style.backgroundColor = "#0AEB0A";
        document.getElementById('songCard').remove();
        document.getElementById('endCard').style.display = "block";
    }

    function nextSong() {
        if (songIndex + 1 <= songs.length - 1) {
            songIndex += 1;
            getSong(songs[songIndex]);
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
                nextSong();
            }
        }).fail(function() {
            return false;
        });
    }

    document.getElementById('hot').addEventListener("click", function() {
        if (allowedVote) {
            allowedVote = false;
            doVote("1");
            setTimeout(function() {
                allowedVote = true
            }, 1500);
        }
    });
    document.getElementById('not').addEventListener("click", function() {
        if (allowedVote) {
            allowedVote = false;
            doVote("0");
            setTimeout(function() {
                allowedVote = true
            }, 1500);
        }
    });
}
