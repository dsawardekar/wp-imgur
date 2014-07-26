(function() {

  var envType = wp_imgur.options.debug === '1' ? 'development' : 'production';
  var ENV = {
    "environment"  : envType,
    "baseURL"      : "/",
    "locationType" : "none",
    "EmberENV"     : {
      "FEATURES"   : {

      }
    },
    "APP":  {
    },
  };

  if (envType === 'development') {
    ENV.LOG_MODULE_RESOLVER = false;

    ENV.APP.LOG_RESOLVER             = false;
    ENV.APP.LOG_ACTIVE_GENERATION    = false;
    ENV.APP.LOG_VIEW_LOOKUPS         = true;
    ENV.APP.LOG_TRANSITIONS          = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
  }

  window.WpImgurENV = ENV;
  window.EmberENV   = WpImgurENV.EmberENV;
  window.WpImgur    = require('wp-imgur/app')['default'].create(WpImgurENV.APP);

}());
