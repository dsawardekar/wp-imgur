import Ember from 'ember';

var WpNotice = Ember.Object.extend({
  show: function(type, message) {
    var element = Ember.$('.static-notice');
    element.attr('class', type);

    var content = Ember.$('p strong', element);
    content.text(message);
  },

  hide: function() {
    Ember.$('.static-notice').remove();
  }
});

export default WpNotice.create();
