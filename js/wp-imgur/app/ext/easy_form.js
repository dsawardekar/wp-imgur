/* global require, requirejs */
import Ember from 'ember';

Ember.EasyForm.Config.registerWrapper('wp-input', {
  inputTemplate: 'wp-input',
  errorClass: 'validation-error'
});

Ember.EasyForm.Error.reopen({
  classNameBindings: ['errorText:nohide:hide']
});

Ember.EasyForm.BaseView.reopen({
  templateForName: function(name) {
    if (name) {
      var appName = 'wp-imgur';
      var fullName = '';

      if (name.indexOf('-') !== -1) {
        fullName = appName  + '/templates/components/' + name;
      } else {
        fullName = appName + '/templates/' + name;
      }

      if (requirejs.entries[fullName]) {
        return require(fullName)['default'];
      }
    }

    return this._super('templateForName', name);
  }
});

export default Ember.EasyForm;
