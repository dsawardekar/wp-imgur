Ember.EasyForm.Config.registerWrapper('wp-input', {
  inputTemplate: 'wp-input',
  errorClass: 'validation-error'
});

Ember.EasyForm.Error.reopen({
  classNameBindings: ['errorText:nohide:hide']
});


WpImgurApplication = Em.Application.extend({
  config: function() {
    return window[this.get('configKey')];
  }.property(),

  apiEndpoint: function() {
    return this.get('config').apiEndpoint;
  }.property('config'),

  nonce: function() {
    return this.get('config').nonce;
  }.property('config')
});

WpImgur = WpImgurApplication.create({
  configKey: 'wp_imgur_app',
  rootElement: '#wp-imgur'
});

WpImgur.StaticNotice = Em.Object.create({
  show: function(type, message) {
    var element = jQuery('.static-notice');
    element.attr('class', type);

    var content = jQuery('p strong', element);
    content.text(message);
  },

  hide: function() {
    jQuery('.static-notice').remove();
  }
});

WpImgur.NoticeObject = Em.Object.extend({
  type: '',
  messages: Ember.A(),

  show: function(type, value) {
    var messages = this.toMessages(value);
    this.set('type', type);
    this.set('messages', messages);
  },

  hide: function() {
    this.set('type', '');
  },

  toMessages: function(value) {
    var messages = Ember.A();
    var type = typeof(value);

    if (type === 'string') {
      messages.push(value);
    } else if (type === 'object') {
      for (var field in value) {
        if (value.hasOwnProperty(field)) {
          var errors = value[field];
          var n = errors.length;
          var i;

          for (i = 0; i < n; i++) {
            messages.push(errors[i]);
          }
        }
      }
    } else {
      messages.push('Unknown response from server.');
    }

    return messages;
  },

  available: function() {
    return this.get('type') !== '';
  }.property('type'),

  progress: function() {
    return this.get('type') === 'progress';
  }.property('type'),

  cssClass: function() {
    var type = this.get('type');
    if (type === 'progress') {
      return 'updated progress';
    } else if (type === 'success') {
      return 'updated';
    } else {
      return type;
    }
  }.property('type')
});

Notice = WpImgur.NoticeObject.create({});

WpImgur.AdapterObject = Em.Object.extend({
  apiEndpoint: null,
  nonce: null,

  urlFor: function(controller, operation) {
    var params        = {};
    params.controller = controller;
    params.operation  = operation;
    params.nonce      = this.get('nonce');

    return this.get('apiEndpoint') + '&' + jQuery.param(params);
  },

  ajax: function(controller, operation, params) {
    params.url = this.urlFor(controller, operation);

    return new Ember.RSVP.Promise(function(resolve, reject) {
      return jQuery.ajax(params)
      .then(function(response) {
        if (response === '0') {
          reject('Not Logged In');
        } else if (response.success) {
          resolve(response.data);
        } else {
          reject(response.data.error);
        }
      })
      .fail(function(response) {
        var error;
        if (response.statusText === 'timeout') {
          error = 'Request Timed Out.';
        } else if (response.responseJSON) {
          error = response.responseJSON.data.error;
        } else {
          error = 'Unknown Response.';
        }

        reject(error);
      });
    });
  }
});

WpImgur.Adapter = WpImgur.AdapterObject.create({
  apiEndpoint: WpImgur.get('apiEndpoint'),
  nonce: WpImgur.get('nonce'),
});

WpImgur.ConfigModel = Em.Object.extend({
  verifyPin: function() {
    var data = {
      pin: this.get('pin')
    };

    var params = {
      type: 'POST',
      data: JSON.stringify(data)
    };

    return WpImgur.Adapter.ajax(
      'config', 'verifyPin', params
    )
    .then(function(json) {
      return true;
    });
  }
});

WpImgur.ConfigModel.reopenClass({
  load: function() {
    var params = {
      type: 'GET'
    };

    return WpImgur.Adapter.ajax(
      'config', 'index', params
    )
    .then(function(json) {
      var model = WpImgur.ConfigModel.create({});
      model.set('authorized', json.authorized);
      model.set('authorizeUrl', json.authorizeUrl);
      model.set('pin', '');

      return model;
    });
  }
});

WpImgur.SyncModel = Em.Object.extend(Ember.Evented, {
  items: Ember.A(),
  active: false,
  current: -1,
  currentItem: null,

  startSync: function() {
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
    }
  },

  next: function() {
    var data = {
      id: this.items[this.current]
    };
    var self = this;
    var params = {
      type: 'POST',
      data: JSON.stringify(data)
    };

    return WpImgur.Adapter.ajax(
      'sync', 'update', params
    )
    .then(function(item) {
      self.set('currentItem', item);
      self.queueNext();
    });
  },

  stopSync: function() {
    this.set('active', false);
    this.trigger('syncStop');
  },

  isActive: function() {
    return this.get('active');
  }.property('active'),

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
    var params = {
      type: 'GET'
    };

    return WpImgur.Adapter.ajax(
      'sync', 'index', params
    )
    .then(function(items) {
      self.set('items', Ember.A(items));
    });
  }
});

WpImgur.Router.map(function() {
  this.route('authorize');
  this.route('verifyPin');
  this.route('sync');
});

WpImgur.Router.reopen({
  location: 'none'
});

WpImgur.ApplicationRoute = Em.Route.extend({
  model: function() {
    return WpImgur.ConfigModel.load();
  },

  afterModel: function(model) {
    WpImgur.StaticNotice.hide();

    if (model.get('authorized')) {
      this.transitionTo('sync');
    } else {
      this.transitionTo('authorize');
    }
  },

  actions: {
    authorizeStart: function() {
      var model = this.modelFor('application');
      window.open(model.get('authorizeUrl'), '_blank');
      this.get('controller').transitionToRoute('verifyPin');
    },
    verifyPin: function() {
      Notice.show('progress', 'Verifying PIN ...');
      var model = this.modelFor('application');
      var self = this;

      model.verifyPin()
      .then(function() {
        Notice.show('updated', 'PIN Verified successfully.');

        var controller = self.get('controller');
        controller.transitionToRoute('sync');
      })
      .catch(function(error) {
        Notice.show('error', error);
      });
    },

    error: function(reason) {
      WpImgur.StaticNotice.show('error', 'Error: ' + reason);
    }
  }
});

WpImgur.VerifyPinRoute = Em.Route.extend({
  model: function() {
    return this.modelFor('application');
  }
});

WpImgur.SyncRoute = Em.Route.extend({
  model: function() {
    return WpImgur.SyncModel.create();
  }
});

WpImgur.ApplicationController = Em.ObjectController.extend({
  notice: Notice
});

WpImgur.SyncController = Em.ObjectController.extend({
  onSyncStart: function() {
    Notice.show('progress', 'Starting Sync ...');
  },

  onSyncProgress: function() {
    var model = this.get('content');
    Notice.show('progress', 'Synchronizing ' + model.get('name') + ' ...');

    var thumb = jQuery('.imgur-thumb');
    thumb.css('background-image', "url(" + model.get('thumbnail') + ")");
  },

  onSyncStop: function() {
    Notice.show('success', 'Sync Stopped.');
  },

  onSyncError: function() {
    Notice.show('error', 'Sync Failed: ' + error);
  },

  onSyncComplete: function() {
    Notice.show('success', 'Sync Completed.');
  },

  actions: {
    startSync: function() {
      var model  = this.get('content');
      var events = ['syncStart', 'syncProgress', 'syncStop', 'syncComplete', 'syncError'];
      var self   = this;

      events.forEach(function(eventName) {
        var callbackName = 'on' + eventName.capitalize();
        var callback = self[callbackName];
        model.off(eventName, self, callback);
        model.on(eventName, self, callback);
      });

      model.startSync();
    },

    stopSync: function() {
      var model = this.get('content');
      model.stopSync();
    }
  }
});
