import Ember from 'ember';
import auth from 'wp-imgur/models/auth';
import pages from 'wp-imgur/models/pages';
import Notice from 'wp-imgur/models/notice';

var ApplicationController = Ember.ObjectController.extend({
  pages: pages,

  actions: {
    changeSelectedTab: function(index) {
      if (index === 0) {
        this.transitionToRoute('sync');
      } else {
        this.transitionToRoute('auth');
      }
    },
  }
});

export default ApplicationController;
