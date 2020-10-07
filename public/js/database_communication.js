(function() {
    $.ajax({
        url: '/database_connection',
    }).done(function(response) {
        console.log(response);
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