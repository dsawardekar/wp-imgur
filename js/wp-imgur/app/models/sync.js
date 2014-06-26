import Ember from 'ember';
import api from 'wp-imgur/ext/arrow_api';
import pages from 'wp-imgur/models/pages';

var SyncModel = Ember.Object.extend(Ember.Evented, {
  items: Ember.A(),
  active: false,
  current: -1,
  currentItem: null,

  startSync: function() {
    pages.set('lockEnabled', true);

    var self    = this;
    var current = this.get('current');

    this.set('active', true);
    this.trigger('syncStart');

    if (current === -1) {
      this.set('current', 0);
      this.load().then(function() {
        self.resumeSync();
      })
      .catch(function(error) {
        self.trigger('syncError', error);
      });
    } else {
      this.resumeSync();
    }
  },

  resumeSync: function() {
    if (this.get('current') === -1) {
      this.set('current', 0);
    }

    this.set('total', this.get('items').length);
    this.next();
  },

  queueNext: function() {
    if (!this.get('active')) {
      return;
    }

    var current = this.get('current') + 1;
    var total = this.get('total');

    this.set('current', current);

    if (current < total) {
      this.trigger('syncProgress');
      var self = this;

      Ember.run(function() {
        self.next();
      });
    } else {
      this.set('active', false);
      this.set('current', -1);
      this.trigger('syncComplete');
      pages.set('lockEnabled', false);
    }
  },

  next: function() {
    var self = this;
    var params = {
      id: this.items[this.current]
    };

    return api.post('sync', params)
    .then(function(item) {
      self.set('currentItem', item);
      self.queueNext();
    });
  },

  stopSync: function() {
    this.set('active', false);
    this.trigger('syncStop');
    pages.set('lockEnabled', false);
  },

  thumbnail: function() {
    var currentItem = this.get('currentItem');
    if (currentItem) {
      return currentItem.thumbnail;
    } else {
      return false;
    }
  }.property('currentItem'),

  name: function() {
    var currentItem = this.get('currentItem');
    if (currentItem) {
      return currentItem.name;
    } else {
      return false;
    }
  }.property('currentItem'),

  percentComplete: function() {
    return Math.round(this.get('current') / this.get('total') * 100);
  }.property('current', 'total'),

  load: function() {
    var self = this;

    return api.all('sync')
    .then(function(items) {
      self.set('items', Ember.A(items));
    });
  }
});

export default SyncModel.create();
