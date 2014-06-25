import Ember from 'ember';
import auth from 'wp-imgur/models/auth';

var Pages = Ember.Object.extend({
  labels: ['Sync', 'Settings'],
  _selectedPage: undefined,
  lockEnabled: false,

  selectedPage: function(name, value) {
    if (value !== undefined) {
      this._selectedPage = value;
    } else {
      if (this._selectedPage === undefined) {
        this._selectedPage = auth.get('authorized') ? 0 : 1;
      }

      return this._selectedPage;
    }
  }.property()
});

export default Pages.create();
