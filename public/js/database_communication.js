(function() {
  $.ajax({
    url: '/database_connection',
  }).done(function(data) {
    console.log(data.URL);
  });

  $.ajax({
    url: '/insert_vote',
    data: {
      'songID': '1',
      'vote': 1
    }
  }).done(function(data) {
    console.log(data.URL);
  });
})();