import Ember from 'ember';
import api from 'wp-imgur/ext/arrow_api';

var ImageModel = Ember.Object.create({
  removeAll: function() {
    api.all('image').then(function() {

    });
  }
});
