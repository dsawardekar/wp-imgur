import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: 'wp-imgur', // TODO: loaded via config
  Resolver: Resolver,
  rootElement: '#wp-imgur'
});

loadInitializers(App, 'wp-imgur');

export default App;
