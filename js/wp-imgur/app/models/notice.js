import Ember from 'ember';

var Notice = Ember.Object.extend({
  type: null,
  messages: Ember.A(),
  intervalId: -1,
  autoHideIn: 5000,

  show: function(type, value) {
    this.set('type', type);
    this.set('messages', this.toMessages(value));

    /*
    var self = this;
    clearInterval(this.get('intervalId'));

    var intervalId = setInterval(function() {
      self.hide();
    }, this.get('autoHideIn'));

    this.set('intervalId', intervalId);
    */
  },

  hide: function() {
    this.set('type', null);
    this.set('messages', Ember.A());

    clearInterval(this.get('intervalId'));
  },

  showAfter: function(promise, successMessage, errorMessage) {
    var self = this;

    promise
    .then(function(result) {
      if (Ember.typeOf(successMessage) === 'function') {
        successMessage = successMessage(result);
      }

      self.show('success', successMessage);
    })
    .catch(function(error) {
      var message = error;
      if (Ember.typeOf(successMessage) === 'function') {
        message = errorMessage(error);
      }

      self.show('error', message);
    });
  },

  enabled: function() {
    return this.get('type') !== null;
  }.property('type'),

  toMessages: function(value) {
    var messages  = Ember.A();
    var valueType = Ember.typeOf(value);

    if (valueType === 'string') {
      /* plain text error */
      messages.push(value);
    } else if (valueType === 'object') {
      /* list of errors, field => error */
      messages.push.apply(messages, this.fieldsToMessages(value));
    } else if (valueType === 'array') {
      messages.push.apply(messages, value);
    } else if (value instanceof Error) {
      messages.push(value.toString());
    } else {
      messages.push('Unknown Error: ' + value);
    }

    return messages;
  },

  fieldsToMessages: function(fields) {
    var messages = Ember.A();
    for (var field in fields) {
      if (fields.hasOwnProperty(field)) {
        var errors = fields[field];
        messages.push.apply(messages, errors);
      }
    }

    return messages;
  },
});

export default Notice.create();
