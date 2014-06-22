import Ember from 'ember';

var Notice = Ember.Object.extend({
  type: null,
  messages: Ember.A(),

  show: function(type, value) {
    this.set('type', type);
    this.set('messages', this.toMessages(value));
  },

  hide: function() {
    this.set('type', null);
    this.set('messages', Ember.A());
  },

  enabled: function() {
    return this.get('type') !== null;
  },

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
