import Ember from 'ember';
import config from 'wp-imgur/config';
import api from 'wp-imgur/ext/arrow_api';

var SettingsModel = Ember.Object.extend({
  updateMediaOptions: function() {
    var params = {
      syncOnMediaUpload: config.get('syncOnMediaUpload') ? 1 : 0,
      syncOnMediaEdit: config.get('syncOnMediaEdit') ? 1 : 0
    };

    return api.patch('config', params);
  }
});

export default SettingsModel.create();
