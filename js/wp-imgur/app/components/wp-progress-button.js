import Ember from 'ember';

var WpProgressButtonComponent = Ember.Component.extend({
  classNames : ['wp-progress-button-view'],
  type       : 'primary',
  startLabel : 'Start',
  stopLabel  : 'Stop',
  action     : null,
  data       : null,
  started    : false,
  startAction : 'start',
  stopAction : 'stop',
  progress: 0,

  label: function() {
    if (this.get('started')) {
      return this.get('stopLabel');
    } else {
      return this.get('startLabel');
    }
  }.property('startLabel', 'stopLabel', 'started'),

  progressText: function() {
    var progress = this.get('progress');
    if (isNaN(progress)) {
      progress = 0;
    }

    return progress;
  }.property('progress'),

  buttonClassList: function() {
    var type = this.get('type');
    var list = 'button button-' + type;

    if (this.get('pending')) {
      list += ' disabled';
    }

    return list;
  }.property('type', 'pending'),

  progressClassList: function() {
    if (this.get('started')) {
      return 'wp-progress-button-progress';
    } else {
      return 'hide';
    }
  }.property('started'),

  actions: {
    buttonClick: function(view) {
      var started = this.get('started');

      if (!started) {
        this.sendAction('startAction', this, this.get('data'));
      } else {
        this.sendAction('stopAction', this, this.get('data'));
      }
    }
  }

});

export default WpProgressButtonComponent;
