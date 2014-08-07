/* global require, module, process */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var config = {
  fingerprint: {
    enabled: false
  },
};

if (process.env.WRAP_IN_EVAL) {
  config.wrapInEval = process.env.WRAP_IN_EVAL === '1';
}

if (process.env.REMOVE_TESTS) {
  config.tests = false;
}

var app = new EmberApp(config);

var removeLibrary = function(name) {
  var legacyFilesToAppend = app.legacyFilesToAppend;
  var pattern             = new RegExp(name + ".js$");
  var filtered            = legacyFilesToAppend.filter(function(file) {
    return !pattern.test(file);
  });

  app.legacyFilesToAppend = filtered;
};

if (process.env.REMOVE_JQUERY) {
  removeLibrary('jquery');
}

app.import('vendor/ember-validations/dist/ember-validations.js');
app.import('vendor/ember-easyForm/dist/ember-easyForm.js');
app.import('vendor/ember-i18n/lib/i18n.js');

module.exports = app.toTree();
