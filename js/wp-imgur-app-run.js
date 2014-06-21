WpImgurENV = {
  "environment": "development",
  "baseURL": "/",
  "locationType": "none",
  "EmberENV":  {
    "FEATURES":  {

    }
  },
  "APP":  {
    "LOG_RESOLVER": false,
    "LOG_ACTIVE_GENERATION": false,
    "LOG_MODULE_RESOLVER": false,
    "LOG_VIEW_LOOKUPS": false,
    "LOG_TRANSITIONS": true
  },
  "LOG_MODULE_RESOLVER": false
};

EmberENV = WpImgurENV.EmberENV;
WpImgur  = require('wp-imgur/app')['default'].create(WpImgurENV.APP);
