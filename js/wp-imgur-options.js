(function($) {

  $(document).ready(function() {
    $('#syncButton').click(function() {
      $('#progress-bar').progressbar("value", 50);
    });
    $('#progress-bar').progressbar({
      change: function() {
        $('#progress-bar .progress-label').text(
          $('#progress-bar').progressbar("value") + "%"
        );
      }
    });
  });

}(jQuery));
