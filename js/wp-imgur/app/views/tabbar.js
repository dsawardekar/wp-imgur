import Ember from 'ember';

var TabBarView = Ember.CollectionView.extend({
  classNames: ['nav-tab-wrapper'],
  tagName: 'span',
  content: ['tab.sync', 'tab.settings'],
  _selectedIndex: 0,
  _lockEnabled: false,
  didRenderOnce: false,

  itemViewClass: Ember.View.extend(Ember.I18n.TranslateableProperties, {
    classNames: ['nav-tab'],
    classNameBindings: [
      'selected:nav-tab-active',
      'disabled:nav-tab-disabled'
    ],
    templateName: 'tabbaritem',
    selected: false,
    data: null,
    enabled: true,

    click: function(event) {
      if (this.get('enabled') && !this.get('selected')) {
        this.get('parentView').didTabItemClick(this, this.data);
      }
    },

    disabled: function() {
      return !this.get('enabled');
    }.property('enabled'),

    tabLabel: function() {
      return Ember.I18n.t(this.get('content'));
    }.property('content')
  }),

  didInsertElement: function() {
    var i, view;
    var n = this._childViews.length;
    var selectedIndex = this.get('selectedIndex');
    var lockEnabled = this.get('lockEnabled');

    for (i = 0; i < n; i++) {
      view = this._childViews[i];
      if (i === selectedIndex) {
        view.set('selected', true);
      }

      if (!view.get('data')) {
        view.set('data', i);
      }

      if (lockEnabled && i !== selectedIndex) {
        view.set('enabled', false);
      }
    }

    this.set('didRenderOnce', true);
  },

  selectedItem: function() {
    return this._childViews[this.get('selectedIndex')];
  }.property('selectedIndex'),

  selectedIndex: function(name, selectedIndex) {
    if (selectedIndex !== undefined) {
      if (this.get('didRenderOnce')) {
        var currentIndex = this._selectedIndex;
        var currentItem  = this._childViews[currentIndex];
        var nextItem     = this._childViews[selectedIndex];

        currentItem.set('selected', false);
        nextItem.set('selected', true);
      }

      this._selectedIndex = selectedIndex;
    }

    return this._selectedIndex;
  }.property(),

  didTabItemClick: function(item, index) {
    this.set('selectedIndex', index);
    this.get('controller').send('changeSelectedTab', index);
  },

  lock: function() {
    var selectedIndex = this.get('selectedIndex');
    this._childViews.forEach(function(view) {
      if (view.get('data') === selectedIndex) {
        view.set('enabled', true);
      } else {
        view.set('enabled', false);
      }
    });
  },

  unlock: function() {
    this._childViews.forEach(function(view) {
      view.set('enabled', true);
    });
  },

  lockEnabled: function(name, value) {
    if (value !== undefined) {
      if (value) {
        this.lock();
      } else {
        this.unlock();
      }

      this._lockEnabled = value;
    }
    return this._lockEnabled;
  }.property()
});

Ember.CollectionView.CONTAINER_MAP['span'] = 'a';

export default TabBarView;
