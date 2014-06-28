import Ember from 'ember';

var WpButtonComponent = Ember.Component.extend({
  classNames : ['wp-button-view'],
  type       : 'primary',
  label      : 'Submit',
  action     : null,
  data       : null,
  pending    : false,

  buttonClassList: function() {
    var type = this.get('type');
    var list = 'button button-' + type;

    if (this.get('pending')) {
      list += ' disabled';
    }

    return list;
  }.property('type', 'pending'),

  spinnerClassList: function() {
    var pending = this.get('pending');
    var list = '';

    if (pending) {
      list = 'spinner wp-button-spinner';
    } else {
      list = 'hide';
    }

    return list;
  }.property('pending'),

  waitFor: function(promise) {
    var self = this;
    this.set('pending', true);

    promise.finally(function() {
      self.set('pending', false);
    });
  },

  actions: {
    buttonClick: function(view) {
      this.sendAction('action', this, this.get('data'));
    }
  }

});

export default WpButtonComponent;
