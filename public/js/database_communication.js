(function() {
    $.ajax({
        url: '/database_connection',
    }).done(function() {
        console.log("connected");
        if (!songs.length > 0) {
            $.ajax({
                url: '/get_songIDs',
            }).done(function(data) {
                songs = data;
                startAPI();
            });
        } else {
            startAPI();
        }

    });
})();
