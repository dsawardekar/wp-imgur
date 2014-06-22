import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import EasyForm from './ext/easy_form';

var App = Ember.Application.extend({
  modulePrefix: 'wp-imgur',
  Resolver: Resolver,
  rootElement: '#wp-imgur',
  includes: [
    EasyForm,
  ]
});

loadInitializers(App, 'wp-imgur');

export default App;
