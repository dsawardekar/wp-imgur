
;define("wp-imgur/app", 
  ["ember","ember/resolver","ember/load-initializers","wp-imgur/ext/easy_form","wp-imgur/ext/ember_i18n","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Resolver = __dependency2__["default"];
    var loadInitializers = __dependency3__["default"];
    var EasyForm = __dependency4__["default"];
    var I18n = __dependency5__["default"];

    var App = Ember.Application.extend({
      modulePrefix: 'wp-imgur',
      Resolver: Resolver,
      rootElement: '#wp-imgur',
      includes: [
        EasyForm,
      ]
    });

    loadInitializers(App, 'wp-imgur');

    __exports__["default"] = App;
  });
;define("wp-imgur/ext/easy_form", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global require, requirejs */
    var Ember = __dependency1__["default"];

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

    __exports__["default"] = Ember.EasyForm;
  });
;define("wp-imgur/ext/ember_i18n", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    Ember.I18n.translations = window.wp_imgur;
    Ember.I18n.I18N_COMPILE_WITHOUT_HANDLEBARS = true;

    __exports__["default"] = Ember.I18n;
  });
;define("wp-imgur/components/notice-bar", 
  ["ember","wp-imgur/models/notice","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Notice = __dependency2__["default"];

    var NoticeBarComponent = Ember.Component.extend({
      classNameBindings: [
        'visible:nohide:hide',
      ],

      notice: function() {
        return Notice;
      }.property(),

      visible: function() {
        return !this.get('notice.available');
      }.property('notice.available'),

      messages: function() {
        return this.get('notice.messages');
      }.property('notice.messages'),

      messageClass: function() {
        var noticeType = this.get('notice.type');

        if (noticeType === 'progress') {
          return 'updated progress';
        } else if (noticeType === 'success') {
          return 'updated';
        } else if (noticeType === null) {
          return '';
        } else {
          return noticeType;
        }
      }.property('notice.type')
    });

    __exports__["default"] = NoticeBarComponent;
  });
;define("wp-imgur/models/notice", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var Notice = Ember.Object.extend({
      type: null,
      messages: Ember.A(),
      intervalId: -1,
      autoHideIn: 5000,

      show: function(type, value) {
        this.set('type', type);
        this.set('messages', this.toMessages(value));
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
        })["catch"](function(error) {
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
          messages.push(value["toString"]());
        } else {
          messages.push('Unknown Error: ' + value);
        }

        return messages;
      },

      fieldsToMessages: function(fields) {
        var messages = Ember.A();
        for (var field in fields) {
          if (fields["hasOwnProperty"](field)) {
            var errors = fields[field];
            messages.push.apply(messages, errors);
          }
        }

        return messages;
      },
    });

    __exports__["default"] = Notice.create();
  });
;define("wp-imgur/components/wp-button", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var WpButtonComponent = Ember.Component.extend({
      classNames : ['wp-button-view'],
      type       : 'primary',
      label      : 'Submit',
      action     : null,
      data       : null,
      pending    : false,

      buttonClassList: function() {
        var type = this.get('type');
        var list = 'button button-' + type;

        if (this.get('pending')) {
          list += ' disabled';
        }

        return list;
      }.property('type', 'pending'),

      spinnerClassList: function() {
        var pending = this.get('pending');
        var list = '';

        if (pending) {
          list = 'spinner wp-button-spinner';
        } else {
          list = 'hide';
        }

        return list;
      }.property('pending'),

      waitFor: function(promise) {
        var self = this;
        this.set('pending', true);

        promise["finally"](function() {
          self.set('pending', false);
        });
      },

      actions: {
        buttonClick: function(view) {
          this.sendAction('action', this, this.get('data'));
        }
      }

    });

    __exports__["default"] = WpButtonComponent;
  });
;define("wp-imgur/components/wp-progress-button", 
  ["ember","wp-imgur/ext/ember_i18n","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var I18n = __dependency2__["default"];

    var WpProgressButtonComponent = Ember.Component.extend(I18n.TranslateableProperties, {
      classNames : ['wp-progress-button-view'],
      type       : 'primary',
      startLabel : 'Start',
      stopLabel  : 'Stop',
      action     : null,
      data       : null,
      started    : false,
      startAction : 'start',
      stopAction : 'stop',
      progress: 0,

      label: function() {
        if (this.get('started')) {
          return this.get('stopLabel');
        } else {
          return this.get('startLabel');
        }
      }.property('startLabel', 'stopLabel', 'started'),

      progressText: function() {
        var progress = this.get('progress');
        if (isNaN(progress)) {
          progress = 0;
        }

        return progress;
      }.property('progress'),

      buttonClassList: function() {
        var type = this.get('type');
        var list = 'button button-' + type;

        if (this.get('pending')) {
          list += ' disabled';
        }

        return list;
      }.property('type', 'pending'),

      progressClassList: function() {
        if (this.get('started')) {
          return 'wp-progress-button-progress';
        } else {
          return 'hide';
        }
      }.property('started'),

      actions: {
        buttonClick: function(view) {
          var started = this.get('started');

          if (!started) {
            this.sendAction('startAction', this, this.get('data'));
          } else {
            this.sendAction('stopAction', this, this.get('data'));
          }
        }
      }

    });

    __exports__["default"] = WpProgressButtonComponent;
  });
;define("wp-imgur/config", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var Config = Ember.Object.extend({
      configKey: 'wp_imgur',

      store: function() {
        return window[this.get('configKey')].options;
      }.property(),

      apiEndpoint: function() {
        return this.get('store').apiEndpoint;
      }.property('store'),

      nonce: function() {
        return this.get('store').nonce;
      }.property('store'),

      debug: function() {
        return this.get('store').debug;
      }.property('store'),

      authorized: function() {
        return this.get('store').authorized;
      }.property('store'),

      authorizeUrl: function() {
        return this.get('store').authorizeUrl;
      }.property('store'),

      album: function(name, value) {
        if (this._album === undefined) {
          this._album = this.get('store').album;
        }

        if (value !== undefined) {
          this._album = value;
        }

        return this._album;
      }.property('store'),

      syncOnMediaUpload: function(name, value) {
        if (this._syncOnMediaUpload === undefined) {
          this._syncOnMediaUpload = !!this.get('store').syncOnMediaUpload;
        }

        if (value !== undefined) {
          this._syncOnMediaUpload = value;
        }

        return this._syncOnMediaUpload;
      }.property('store'),

      syncOnMediaEdit: function(name, value) {
        if (this._syncOnMediaEdit === undefined) {
          this._syncOnMediaEdit = !!this.get('store').syncOnMediaEdit;
        }

        if (value !== undefined) {
          this._syncOnMediaEdit = value;
        }

        return this._syncOnMediaEdit;
      }.property('store'),

      siteUrl: function() {
        return this.get('store').siteUrl;
      }.property('store'),

      uploadMode: function(name, value) {
        if (this._uploadMode === undefined) {
          this._uploadMode = this.get('store').uploadMode;
        }

        if (value !== undefined) {
          this._uploadMode = value;
        }

        return this._uploadMode;
      }.property('store')

    });

    __exports__["default"] = Config.create();
  });
;define("wp-imgur/controllers/application", 
  ["ember","wp-imgur/models/auth","wp-imgur/models/pages","wp-imgur/models/notice","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var auth = __dependency2__["default"];
    var pages = __dependency3__["default"];
    var Notice = __dependency4__["default"];

    var ApplicationController = Ember.ObjectController.extend({
      pages: pages,

      actions: {
        changeSelectedTab: function(index) {
          if (index === 0) {
            this.transitionToRoute('sync');
          } else {
            this.transitionToRoute('auth');
          }
        },
      }
    });

    __exports__["default"] = ApplicationController;
  });
;define("wp-imgur/models/auth", 
  ["ember","wp-imgur/ext/arrow_api","wp-imgur/config","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var api = __dependency2__["default"];
    var config = __dependency3__["default"];

    var AuthModel = Ember.Object.extend({
      authorized: false,
      authorizeUrl: null,
      pin: null,

      loaded: function() {
        return this.get('authorizeUrl') !== null;
      }.property('authorizeUrl'),

      load: function() {
        if (this.get('loaded')) {
          return this;
        }

        this.set('authorized', config.get('authorized'));
        this.set('authorizeUrl', config.get('authorizeUrl'));
        this.set('pin', '');

        return this;
      },

      verifyPin: function() {
        var self   = this;
        var params = {
          type: 'POST',
          data: {
            'pin': this.get('pin')
          }
        };

        return api.request('auth', 'verifyPin', params)
        .then(function(json) {
          self.set('authorized', json.authorized);
          self.set('pin', '');

          config.set('uploadMode', json.uploadMode);
          config.set('album', json.album);

          return json.authorized;
        });
      }
    });

    __exports__["default"] = AuthModel.create();
  });
;define("wp-imgur/ext/arrow_api", 
  ["ember","wp-imgur/config","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var config = __dependency2__["default"];

    var ArrowApi = Ember.Object.extend({
      apiEndpoint: config.get('apiEndpoint'),
      nonce: config.get('nonce'),

      urlFor: function(controller, operation) {
        var params        = {};
        params.controller = controller;
        params.operation  = operation;
        params.nonce      = this.get('nonce');

        return this.get('apiEndpoint') + '&' + Ember.$.param(params);
      },

      request: function(controller, operation, queryParams) {
        queryParams.url = this.urlFor(controller, operation);

        if (queryParams.type === 'POST' && queryParams["hasOwnProperty"]('data')) {
          queryParams.data = JSON.stringify(queryParams.data);
        }

        return new Ember.RSVP.Promise(function(resolve, reject) {
          return Ember.$.ajax(queryParams)
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
      },

      all: function(resource) {
        var queryParams = { type: 'GET' };
        return this.request(resource, 'all', queryParams);
      },

      fetch: function(resource, params) {
        var queryParams = { type: 'GET', data: params };
        return this.request(resource, 'get', queryParams);
      },

      post: function(resource, params) {
        var queryParams = { type: 'POST', data: params };
        return this.request(resource, 'post', queryParams);
      },

      put: function(resource, params) {
        var queryParams = { type: 'POST', data: params };
        return this.request(resource, 'put', queryParams);
      },

      patch: function(resource, params) {
        var queryParams = { type: 'POST', data: params };
        return this.request(resource, 'patch', queryParams);
      },

      "delete": function(resource, params) {
        var queryParams = { type: 'POST', data: params };
        return this.request(resource, 'delete', queryParams);
      }

    });

    __exports__["default"] = ArrowApi.create();
  });
;define("wp-imgur/models/pages", 
  ["ember","wp-imgur/models/auth","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var auth = __dependency2__["default"];

    var Pages = Ember.Object.extend({
      labels: ['tab.sync', 'tab.settings'],
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

    __exports__["default"] = Pages.create();
  });
;define("wp-imgur/controllers/auth/authorized", 
  ["ember","wp-imgur/config","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var config = __dependency2__["default"];

    var AuthorizedController = Ember.ObjectController.extend({
      config: config
    });

    __exports__["default"] = AuthorizedController;
  });
;define("wp-imgur/controllers/auth/verifypin", 
  ["ember","wp-imgur/models/auth","wp-imgur/models/notice","wp-imgur/models/pages","wp-imgur/ext/ember_i18n","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var auth = __dependency2__["default"];
    var Notice = __dependency3__["default"];
    var pages = __dependency4__["default"];
    var I18n = __dependency5__["default"];

    var VerifyPinController = Ember.ObjectController.extend({
      verifying: false,

      actions: {
        verifyPin: function(button) {
          if (this.get('verifying')) {
            return;
          }

          var self = this;
          var promise = auth.verifyPin();
          this.set('verifying', true);

          button.waitFor(promise);
          Notice.showAfter(promise, I18n.t('status.authorize.success'));

          promise.then(function() {
            pages.set('lockEnabled', false);
            self.transitionToRoute('auth.authorized');
          })["finally"](function() {
            self.set('verifying', false);
          });
        }
      }
    });

    __exports__["default"] = VerifyPinController;
  });
;define("wp-imgur/controllers/settings", 
  ["ember","wp-imgur/config","wp-imgur/models/auth","wp-imgur/models/pages","wp-imgur/models/notice","wp-imgur/models/image","wp-imgur/ext/ember_i18n","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var config = __dependency2__["default"];
    var auth = __dependency3__["default"];
    var pages = __dependency4__["default"];
    var Notice = __dependency5__["default"];
    var image = __dependency6__["default"];
    var I18n = __dependency7__["default"];

    var SettingsController = Ember.ObjectController.extend({
      config: config,
      auth: auth,
      image: image,

      albumUrl: function() {
        return 'http://imgur.com/a/' + config.get('album');
      }.property('config.album'),

      onDeleteImageStart: function() {
        Notice.show('progress', I18n.t('status.cleanup.start') + ' ...');
        pages.set('lockEnabled', true);
      },

      onDeleteImageProgress: function() {
      },

      onDeleteImageStop: function() {
        Notice.hide();
        pages.set('lockEnabled', false);
      },

      onDeleteImageError: function(error) {
        Notice.show('error', I18n.t('status.cleanup.failed') + ': ' + error);
        pages.set('lockEnabled', false);
      },

      onDeleteImageComplete: function() {
        var siteUrl = config.get('siteUrl');
        Notice.show('success', I18n.t('album') + ' ' + siteUrl + ' ' + I18n.t('status.cleanup.success'));
        pages.set('lockEnabled', false);
      },

      actions: {
        startDeleteImage: function() {
          var model  = image;
          var events = ['deleteImageStart', 'deleteImageProgress', 'deleteImageStop', 'deleteImageComplete', 'deleteImageError'];
          var self   = this;

          events.forEach(function(eventName) {
            var callbackName = 'on' + eventName.capitalize();
            var callback = self[callbackName];

            model.off(eventName, self, callback);
            model.on(eventName, self, callback);
          });

          model.start();
        },

        stopDeleteImage: function() {
          var model = image;
          model.stop();
        }
      }
    });

    __exports__["default"] = SettingsController;
  });
;define("wp-imgur/models/image", 
  ["ember","wp-imgur/ext/arrow_api","wp-imgur/ext/task_queue_model","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var api = __dependency2__["default"];
    var TaskQueueModel = __dependency3__["default"];

    var DeleteImageTask = Ember.Object.extend({
      id: null,

      run: function() {
        return api["delete"]('image', { id: this.get('id') });
      }
    });

    var ImageModel = TaskQueueModel.extend({
      maxBatchSize: 4,

      taskEvents            : {
        'taskQueueStart'    : 'deleteImageStart',
        'taskQueueProgress' : 'deleteImageProgress',
        'taskQueueComplete' : 'deleteImageComplete',
        'taskQueueError'    : 'deleteImageError',
        'taskQueueStop'     : 'deleteImageStop'
      },

      load: function() {
        return api.all('image');
      },

      taskFor: function(id) {
        return DeleteImageTask.create({ id: id });
      }
    });

    __exports__["default"] = ImageModel.create();
  });
;define("wp-imgur/ext/task_queue_model", 
  ["ember","wp-imgur/ext/task_queue","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var TaskQueue = __dependency2__["default"];

    var TaskQueueModel = Ember.Object.extend(Ember.Evented, {
      taskQueue        : null,
      active           : false,
      maxBatchSize     : 4,
      didLoad          : false,
      current          : null,
      loading: false,

      taskEvents            : {
        'taskQueueStart'    : 'taskQueueStart',
        'taskQueueProgress' : 'taskQueueProgress',
        'taskQueueComplete' : 'taskQueueComplete',
        'taskQueueError'    : 'taskQueueError',
        'taskQueueStop'     : 'taskQueueStop'
      },

      init: function() {
        var taskQueue = TaskQueue.create({ maxBatchSize: this.get('maxBatchSize') });
        taskQueue.on('taskQueueStart'    , this , this.didTaskQueueStart);
        taskQueue.on('taskQueueProgress' , this , this.didTaskQueueProgress);
        taskQueue.on('taskQueueComplete' , this , this.didTaskQueueComplete);
        taskQueue.on('taskQueueError'    , this , this.didTaskQueueError);

        this.set('taskQueue', taskQueue);
      },

      load: function() {
        /* abstract */
      },

      taskFor: function(item) {
        /* abstract */
      },

      start: function() {
        this.triggerQueueEvent('taskQueueStart');
        this.set('active', true);
        this.set('current', null);

        if (this.get('didLoad')) {
          this.taskQueue.start();
        } else {
          var self = this;

          this.set('loading', true);
          this.load().then(function(items) {
            self.set('didLoad', true);
            self.startQueue(items);
          })["catch"](function(error) {
            self.didTaskQueueError(null, error);
          });
        }
      },

      stop: function() {
        if (this.set('active')) {
          this.set('active', false);
          this.taskQueue.stop();
          this.triggerQueueEvent('taskQueueStop');
        }
      },

      startQueue: function(items) {
        var i = 0;
        var n = items.length;
        var item, task;

        if (n > 0) {
          this.taskQueue.reset();

          for (i = 0; i < n; i++) {
            item = items[i];
            task = this.taskFor(item);

            this.taskQueue.add(task);
          }

          this.taskQueue.start();
        } else {
          this.didTaskQueueComplete();
        }
      },

      triggerQueueEvent: function() {
        var args  = Array.prototype.slice.call(arguments, 0);
        var event = args[0];
        event = this.get('taskEvents')[event];
        args[0] = event;

        return this.trigger.apply(this, args);
      },

      didTaskQueueStart: function() {
        this.set('loading', false);
      },

      didTaskQueueProgress: function(task) {
        this.set('current', task.get('output'));
        this.triggerQueueEvent('taskQueueProgress');
      },

      didTaskQueueComplete: function() {
        this.set('active', false);
        this.set('didLoad', false);
        this.triggerQueueEvent('taskQueueComplete');
        this.taskQueue.reset();
      },

      didTaskQueueError: function(task, error) {
        this.set('active', false);
        this.triggerQueueEvent('taskQueueError', error);
        if (this.get('didLoad')) {
          this.taskQueue.stop();
        }
      },

      progress: function() {
        if (this.get('loading')) {
          return 0;
        } else {
          return Math.round(this.taskQueue.get('progress'));
        }
      }.property('taskQueue.progress'),

    });

    __exports__["default"] = TaskQueueModel;
  });
;define("wp-imgur/ext/task_queue", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var TaskQueue = Ember.Object.extend(Ember.Evented, {
      tasks     : null,
      pending   : null,
      completed : null,
      failures  : null,
      maxBatchSize : 1,
      didFirst  : false,
      active    : false,

      init: function() {
        this.reset();
      },

      add: function(task) {
        this.tasks.push(task);
      },

      reset: function() {
        this.set('tasks', Ember.A());
        this.set('completed', Ember.A());
        this.set('failures', Ember.A());
        this.set('pending', Ember.A());
        this.set('didFirst', false);
      },

      start: function() {
        if (this.get('active')) {
          this.resume();
        } else {
          this.set('active', true);
          this.set('pending', this.tasks.slice());
          this.set('completed', Ember.A());
          this.set('failures', Ember.A());
          this.set('running', Ember.A());

          this.next();
        }
      },

      resume: function() {
        this.next();
      },

      stop: function() {
        var i = 0;
        var n = this.running.length;
        var task;

        while (this.running.length > 0) {
          task = this.running.pop();
          this.pending.unshift(task);
        }
      },

      hasTasks: function() {
        var completed  = this.get('completed').length;
        var failures   = this.get('failures').length;
        var totalTasks = this.get('tasks').length;
        var totalDone  = completed + failures;

        return totalDone < totalTasks;
      },

      progress: function() {
        var completed = this.get('completed').length;
        var failures  = this.get('failures').length;
        var total     = this.get('tasks').length;

        return (completed + failures) / total * 100;
      }.property('completed.[]', 'failures.[]'),

      /* helpers */
      next: function() {
        var batchSize = this.get('batchSize');
        var task;

        while (this.running.length < batchSize) {
          task = this.nextTask();

          if (task !== null) {
            this.running.pushObject(task);
            this.runTask(task);
          } else {
            break;
          }
        }
      },

      nextTask: function() {
        if (this.pending.length > 0) {
          return this.pending.shift();
        } else {
          return null;
        }
      },

      runTask: function(task) {
        this.didTaskStart(task);

        var taskResult;
        var taskError = 'ok';

        try {
          taskResult = task.run();
        } catch (err) {
          taskError = err;
        }

        if (taskError === 'ok') {
          if (this.isResultPromise(taskResult)) {
            var self = this;

            return taskResult
              .then(function(output) {
                self.didTaskComplete(task, output);
              })["catch"](function(error) {
                self.didTaskError(task, error);
              });
          } else {
            this.didTaskComplete(task, taskResult);
          }
        } else {
          this.didTaskError(task, taskError);
        }
      },

      isResultPromise: function(taskResult) {
        return taskResult instanceof Ember.RSVP.Promise;
      },

      didTaskStart: function(task) {
        if (!this.get('didFirst')) {
          this.set('didFirst', true);
          this.trigger('taskQueueStart');
        }
      },

      didTaskComplete: function(task, output) {
        var index = this.runningAt(task);
        if (index !== -1) {
          task.output = output;

          this.running.splice(index, 1);
          this.completed.pushObject(task);
          this.peek(task);
        }
      },

      didTaskError: function(task, error) {
        var index = this.runningAt(task);
        if (index !== -1) {
          task.error = error;

          this.running.splice(index, 1);
          this.failures.pushObject(task);
          this.peek(task);
          this.trigger('taskQueueError', task, error);
        }
      },

      peek: function(task) {
        this.trigger('taskQueueProgress', task);

        if (this.hasTasks()) {
          this.next();
        } else {
          this.didTaskQueueComplete();
        }
      },

      didTaskQueueComplete: function() {
        this.set('active', false);
        this.trigger('taskQueueComplete');
      },

      taskAt: function(index) {
        return this.tasks[index];
      },

      runningAt: function(task) {
        return this.running.indexOf(task);
      },

      completedAt: function(task) {
        return this.completed.indexOf(task);
      },

      failureAt: function(task) {
        return this.failures.indexOf(task);
      },

      /*
       * Provides some rudimentary acceleration.
       *
       * Until at least maxBatchSize(4) uploads have completed
       * the batch size is 1, so uploads will be serial.
       * After that parallel uploads will kick in.
       *
       * TODO: If tasks complete very quickly, it suggests the server can
       * handle more requests. We should be able to do at least 6 parallel
       * requests as per browser limitations.
       *
       * Likewise batchSize could be reduced as well.
       */
      batchSize: function() {
        var completed    = this.get('completed');
        var maxBatchSize = this.get('maxBatchSize');

        if (completed && completed.length >= maxBatchSize) {
          return maxBatchSize;
        } else {
          return 1;
        }
      }.property('maxBatchSize', 'completed.[]')

    });

    __exports__["default"] = TaskQueue;
  });
;define("wp-imgur/controllers/sync", 
  ["ember","wp-imgur/models/notice","wp-imgur/models/pages","wp-imgur/ext/ember_i18n","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Notice = __dependency2__["default"];
    var pages = __dependency3__["default"];
    var I18n = __dependency4__["default"];

    var SyncController = Ember.ObjectController.extend({
      onSyncStart: function() {
        Notice.show('progress', I18n.t('status.sync.starting') + ' ...');
        pages.set('lockEnabled', true);
      },

      onSyncProgress: function() {
        var model = this.get('content');
        Notice.show('progress', I18n.t('status.sync.synchronizing') + ' ' + model.get('current.name') + ' ...');
      },

      onSyncStop: function() {
        Notice.show('success', I18n.t('status.sync.stopped'));
        pages.set('lockEnabled', false);
      },

      onSyncError: function(error) {
        Notice.show('error', error);
        pages.set('lockEnabled', false);
      },

      onSyncComplete: function() {
        Notice.show('success', I18n.t('status.sync.completed'));
        pages.set('lockEnabled', false);
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

          var promise = model.start();
        },

        stopSync: function() {
          var model = this.get('content');
          model.stop();
        }
      }
    });

    __exports__["default"] = SyncController;
  });
;define("wp-imgur/ext/wp_notice", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var WpNotice = Ember.Object.extend({
      show: function(type, message) {
        var element = Ember.$('.static-notice');
        element.attr('class', type);

        var content = Ember.$('p strong', element);
        content.text(message);
      },

      hide: function() {
        Ember.$('.static-notice').remove();
        Ember.$('#static-header').remove();
      }
    });

    __exports__["default"] = WpNotice.create();
  });
;define("wp-imgur/models/settings", 
  ["ember","wp-imgur/config","wp-imgur/ext/arrow_api","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var config = __dependency2__["default"];
    var api = __dependency3__["default"];

    var SettingsModel = Ember.Object.extend({
      updateMediaOptions: function() {
        var params = {
          syncOnMediaUpload: config.get('syncOnMediaUpload') ? 1 : 0,
          syncOnMediaEdit: config.get('syncOnMediaEdit') ? 1 : 0
        };

        return api.patch('config', params);
      }
    });

    __exports__["default"] = SettingsModel.create();
  });
;define("wp-imgur/models/sync", 
  ["ember","wp-imgur/ext/arrow_api","wp-imgur/ext/task_queue_model","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var api = __dependency2__["default"];
    var TaskQueueModel = __dependency3__["default"];

    var SyncImageTask = Ember.Object.extend({
      id: null,

      run: function() {
        var params = { id: this.get('id') };
        return api.post('sync', params);
      }
    });

    var SyncModel = TaskQueueModel.extend({
      maxBatchSize: 4,

      taskEvents            : {
        'taskQueueStart'    : 'syncStart',
        'taskQueueProgress' : 'syncProgress',
        'taskQueueComplete' : 'syncComplete',
        'taskQueueError'    : 'syncError',
        'taskQueueStop'     : 'syncStop'
      },

      load: function() {
        return api.all('sync');
      },

      taskFor: function(id) {
        return SyncImageTask.create({ id: id });
      }

    });

    __exports__["default"] = SyncModel.create();
  });
;define("wp-imgur/router", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var Router = Ember.Router.extend({
      location: WpImgurENV.locationType
    });

    Router.map(function() {
      this.resource('settings', function() {
        this.resource('auth', function() {
          this.route('unauthorized');
          this.route('verifypin');
          this.route('authorized');
        });
      });

      this.route('sync');
    });

    __exports__["default"] = Router;
  });
;define("wp-imgur/routes/application", 
  ["ember","wp-imgur/ext/wp_notice","wp-imgur/models/notice","wp-imgur/models/auth","wp-imgur/models/pages","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var WpNotice = __dependency2__["default"];
    var Notice = __dependency3__["default"];
    var auth = __dependency4__["default"];
    var pages = __dependency5__["default"];

    var ApplicationRoute = Ember.Route.extend({
      model: function() {
        return auth.load();
      },

      afterModel: function(model) {
        WpNotice.hide();

        if (model.get('authorized')) {
          this.transitionTo('sync');
        } else {
          pages.set('lockEnabled', true);
          this.transitionTo('auth.unauthorized');
        }
      },

      actions: {
        error: function(reason) {
          WpNotice.show('error', Ember.I18n.t('status.error') + ': ' + reason);
        }
      }
    });

    __exports__["default"] = ApplicationRoute;
  });
;define("wp-imgur/routes/auth", 
  ["ember","wp-imgur/models/auth","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var auth = __dependency2__["default"];

    var AuthRoute = Ember.Route.extend({
      model: function() {
        return auth.load();
      },

      afterModel: function(model) {
        if (auth.get('authorized')) {
          this.transitionTo('auth.authorized');
        } else {
          this.transitionTo('auth.unauthorized');
        }
      },

      actions: {
        openAuthorizeUrl: function() {
          window.open(auth.get('authorizeUrl'), '_blank');
          this.get('controller').transitionToRoute('auth.verifypin');
        }
      }
    });

    __exports__["default"] = AuthRoute;
  });
;define("wp-imgur/routes/auth/verifypin", 
  ["ember","wp-imgur/models/auth","wp-imgur/models/pages","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var auth = __dependency2__["default"];
    var pages = __dependency3__["default"];

    var VerifyPinRoute = Ember.Route.extend({
      model: function() {
        return auth;
      }
    });

    __exports__["default"] = VerifyPinRoute;
  });
;define("wp-imgur/routes/settings", 
  ["ember","wp-imgur/models/auth","wp-imgur/models/settings","wp-imgur/models/notice","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var auth = __dependency2__["default"];
    var settings = __dependency3__["default"];
    var notice = __dependency4__["default"];

    var SettingsRoute = Ember.Route.extend({
      model: function() {
        return auth.load();
      },

      actions: {
        updateMediaOptions: function(button) {
          var promise = settings.updateMediaOptions();

          button.waitFor(promise);
          notice.showAfter(promise, 'Settings Saved.');
        }
      }
    });

    __exports__["default"] = SettingsRoute;
  });
;define("wp-imgur/routes/sync", 
  ["ember","wp-imgur/models/sync","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var sync = __dependency2__["default"];

    var SyncRoute = Ember.Route.extend({
      model: function() {
        return sync;
      }
    });

    __exports__["default"] = SyncRoute;
  });
;define("wp-imgur/templates/application", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


      data.buffer.push("<h2 class=\"nav-tab-wrapper\">\n  <span>WP Imgur</span>\n  ");
      data.buffer.push(escapeExpression(helpers.view.call(depth0, "tabbar", {hash:{
        'content': ("pages.labels"),
        'selectedIndex': ("pages.selectedPage"),
        'lockEnabled': ("pages.lockEnabled")
      },hashTypes:{'content': "ID",'selectedIndex': "ID",'lockEnabled': "ID"},hashContexts:{'content': depth0,'selectedIndex': depth0,'lockEnabled': depth0},contexts:[depth0],types:["STRING"],data:data})));
      data.buffer.push("\n  <span class='attribution'>");
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{
        'tagName': ("span")
      },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "credits.tagline", options) : helperMissing.call(depth0, "t", "credits.tagline", options))));
      data.buffer.push("<a\n  href=\"http://imgur.com\">Imgur.com</a></span>\n</h2>\n\n");
      stack1 = helpers._triageMustache.call(depth0, "notice-bar", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/auth", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


      data.buffer.push("<fieldset>\n	<legend>\n    <span>");
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "section.auth.title", options) : helperMissing.call(depth0, "t", "section.auth.title", options))));
      data.buffer.push("</span>\n  </legend>\n  <div class=\"wp-imgur-auth\">\n  ");
      stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n  </div>\n</fieldset>\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/auth/authorized", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


      data.buffer.push("<p></p>\n<p>");
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{
        'uploadModeBinding': ("config.uploadMode")
      },hashTypes:{'uploadModeBinding': "ID"},hashContexts:{'uploadModeBinding': depth0},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "section.auth.authorized", options) : helperMissing.call(depth0, "t", "section.auth.authorized", options))));
      data.buffer.push("\n");
      data.buffer.push(escapeExpression((helper = helpers['wp-button'] || (depth0 && depth0['wp-button']),options={hash:{
        'action': ("openAuthorizeUrl"),
        'label': ("Reauthorize")
      },hashTypes:{'action': "STRING",'label': "STRING"},hashContexts:{'action': depth0,'label': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "wp-button", options))));
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/auth/unauthorized", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


      data.buffer.push("<p>");
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "section.auth.unauthorized", options) : helperMissing.call(depth0, "t", "section.auth.unauthorized", options))));
      data.buffer.push("</p>\n");
      data.buffer.push(escapeExpression((helper = helpers['wp-button'] || (depth0 && depth0['wp-button']),options={hash:{
        'action': ("openAuthorizeUrl"),
        'label': ("Authorize")
      },hashTypes:{'action': "STRING",'label': "STRING"},hashContexts:{'action': depth0,'label': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "wp-button", options))));
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/auth/verifypin", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = '', helper, options;
      data.buffer.push("\n    <table class=\"form-table\">\n      <tbody>\n      ");
      data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
        'wrapper': ("wp-input"),
        'placeholder': ("Imgur PIN")
      },hashTypes:{'wrapper': "STRING",'placeholder': "STRING"},hashContexts:{'wrapper': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "pin", options) : helperMissing.call(depth0, "input", "pin", options))));
      data.buffer.push("\n      </tbody>\n    </table>\n    <p class=\"submit\">\n      ");
      data.buffer.push(escapeExpression((helper = helpers['wp-button'] || (depth0 && depth0['wp-button']),options={hash:{
        'type': ("primary"),
        'action': ("verifyPin"),
        'label': ("Verify PIN")
      },hashTypes:{'type': "STRING",'action': "STRING",'label': "STRING"},hashContexts:{'type': depth0,'action': depth0,'label': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "wp-button", options))));
      data.buffer.push("\n    </p>\n  ");
      return buffer;
      }

      data.buffer.push("<div class=\"auth-verify-pin\">\n  <p>A new window will have opened where you can obtain your Imgur PIN. <a\n  target=\"_blank\" ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'href': ("authorizeUrl")
      },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">Click here</a> if the\n  window did not open.</a></p>\n  <p>\n  Copy the Imgur PIN into the input below and click <em>Verify PIN</em>.\n  </p>\n\n  ");
      stack1 = (helper = helpers['form-for'] || (depth0 && depth0['form-for']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "", options) : helperMissing.call(depth0, "form-for", "", options));
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n</div>\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/components/notice-bar", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = '', stack1;
      data.buffer.push("\n    <p>\n      <strong>");
      stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</strong>\n    </p>\n  ");
      return buffer;
      }

      data.buffer.push("<div id=\"message\" ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'class': ("messageClass")
      },hashTypes:{'class': "ID"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">\n  ");
      stack1 = helpers.each.call(depth0, "messages", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n</div>\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/components/wp-button", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, escapeExpression=this.escapeExpression;


      data.buffer.push("<div class=\"wp-button\">\n  <button\n    ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'class': ("buttonClassList")
      },hashTypes:{'class': "ID"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
      data.buffer.push("\n    ");
      data.buffer.push(escapeExpression(helpers.action.call(depth0, "buttonClick", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
      data.buffer.push("\n  >");
      stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</button>\n  <span\n    ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'class': ("spinnerClassList")
      },hashTypes:{'class': "ID"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">&nbsp;</span>\n</div>\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/components/wp-input", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


      data.buffer.push("<tr>\n  <th scope=\"row\">\n    ");
      data.buffer.push(escapeExpression((helper = helpers['label-field'] || (depth0 && depth0['label-field']),options={hash:{
        'propertyBinding': ("view.property"),
        'textBinding': ("view.label")
      },hashTypes:{'propertyBinding': "STRING",'textBinding': "STRING"},hashContexts:{'propertyBinding': depth0,'textBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "label-field", options))));
      data.buffer.push("\n  </th>\n  <td>\n    ");
      data.buffer.push(escapeExpression((helper = helpers['input-field'] || (depth0 && depth0['input-field']),options={hash:{
        'propertyBinding': ("view.property"),
        'inputOptionsBinding': ("view.inputOptionsValues")
      },hashTypes:{'propertyBinding': "STRING",'inputOptionsBinding': "STRING"},hashContexts:{'propertyBinding': depth0,'inputOptionsBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input-field", options))));
      data.buffer.push("\n    ");
      data.buffer.push(escapeExpression((helper = helpers['error-field'] || (depth0 && depth0['error-field']),options={hash:{
        'propertyBinding': ("view.property")
      },hashTypes:{'propertyBinding': "STRING"},hashContexts:{'propertyBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "error-field", options))));
      data.buffer.push("\n  </td>\n</tr>\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/components/wp-progress-button", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, escapeExpression=this.escapeExpression;


      data.buffer.push("<div class=\"wp-progress-button\">\n  <button\n    ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'class': ("buttonClassList")
      },hashTypes:{'class': "ID"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
      data.buffer.push("\n    ");
      data.buffer.push(escapeExpression(helpers.action.call(depth0, "buttonClick", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
      data.buffer.push("\n  >");
      stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</button>\n  <span\n    ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'class': ("progressClassList")
      },hashTypes:{'class': "ID"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">");
      stack1 = helpers._triageMustache.call(depth0, "progressText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("%</span>\n</div>\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/easyForm/error", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1;


      stack1 = helpers._triageMustache.call(depth0, "view.errorText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/easyForm/hint", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1;


      stack1 = helpers._triageMustache.call(depth0, "view.hintText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/easyForm/input", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


      data.buffer.push(escapeExpression((helper = helpers['label-field'] || (depth0 && depth0['label-field']),options={hash:{
        'propertyBinding': ("view.property"),
        'textBinding': ("view.label")
      },hashTypes:{'propertyBinding': "STRING",'textBinding': "STRING"},hashContexts:{'propertyBinding': depth0,'textBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "label-field", options))));
      data.buffer.push("\n");
      data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "easyForm/inputControls", options) : helperMissing.call(depth0, "partial", "easyForm/inputControls", options))));
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/easyForm/inputControls", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = '', helper, options;
      data.buffer.push("\n  ");
      data.buffer.push(escapeExpression((helper = helpers['error-field'] || (depth0 && depth0['error-field']),options={hash:{
        'propertyBinding': ("view.property")
      },hashTypes:{'propertyBinding': "STRING"},hashContexts:{'propertyBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "error-field", options))));
      data.buffer.push("\n");
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = '', helper, options;
      data.buffer.push("\n  ");
      data.buffer.push(escapeExpression((helper = helpers['hint-field'] || (depth0 && depth0['hint-field']),options={hash:{
        'propertyBinding': ("view.property"),
        'textBinding': ("view.hint")
      },hashTypes:{'propertyBinding': "STRING",'textBinding': "STRING"},hashContexts:{'propertyBinding': depth0,'textBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "hint-field", options))));
      data.buffer.push("\n");
      return buffer;
      }

      data.buffer.push(escapeExpression((helper = helpers['input-field'] || (depth0 && depth0['input-field']),options={hash:{
        'propertyBinding': ("view.property"),
        'inputOptionsBinding': ("view.inputOptionsValues")
      },hashTypes:{'propertyBinding': "STRING",'inputOptionsBinding': "STRING"},hashContexts:{'propertyBinding': depth0,'inputOptionsBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input-field", options))));
      data.buffer.push("\n");
      stack1 = helpers['if'].call(depth0, "view.showError", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      stack1 = helpers['if'].call(depth0, "view.hint", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/easyForm/label", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1;


      stack1 = helpers._triageMustache.call(depth0, "view.labelText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/loading", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '';


      return buffer;
      
    });
  });
;define("wp-imgur/templates/settings", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


      data.buffer.push("<div class=\"wrap-settings\">\n");
      stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n</div>\n\n<div ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'class': ("auth.authorized:extra-settings-active:extra-settings-inactive")
      },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">\n<fieldset>\n	<legend>\n    <span>");
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "section.mediaintegration.title", options) : helperMissing.call(depth0, "t", "section.mediaintegration.title", options))));
      data.buffer.push("</span>\n  </legend>\n  <p>");
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "section.mediaintegration.help", options) : helperMissing.call(depth0, "t", "section.mediaintegration.help", options))));
      data.buffer.push("</p>\n  <p>\n	<label>\n    ");
      data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
        'type': ("checkbox"),
        'name': ("syncOnMediaUpload"),
        'checked': ("config.syncOnMediaUpload")
      },hashTypes:{'type': "STRING",'name': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'name': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "button.sync-on-upload", options) : helperMissing.call(depth0, "t", "button.sync-on-upload", options))));
      data.buffer.push("\n	</label>\n  </p>\n  <p>\n	<label>\n    ");
      data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
        'type': ("checkbox"),
        'name': ("syncOnMediaEdit"),
        'checked': ("config.syncOnMediaEdit")
      },hashTypes:{'type': "STRING",'name': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'name': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "button.sync-on-edit", options) : helperMissing.call(depth0, "t", "button.sync-on-edit", options))));
      data.buffer.push("\n	</label>\n  </p>\n  ");
      data.buffer.push(escapeExpression((helper = helpers['wp-button'] || (depth0 && depth0['wp-button']),options={hash:{
        'action': ("updateMediaOptions"),
        'label': ("Save Changes")
      },hashTypes:{'action': "STRING",'label': "STRING"},hashContexts:{'action': depth0,'label': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "wp-button", options))));
      data.buffer.push("\n</fieldset>\n\n<fieldset>\n	<legend><span>");
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "section.cleanup.title", options) : helperMissing.call(depth0, "t", "section.cleanup.title", options))));
      data.buffer.push("</span></legend>\n  <p>If you wish to uninstall the plugin you can optionally empty the\n  <a ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'href': ("albumUrl")
      },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">Album</a> on the Imgur server containing your synced images.</p>\n  ");
      data.buffer.push(escapeExpression((helper = helpers['wp-progress-button'] || (depth0 && depth0['wp-progress-button']),options={hash:{
        'startAction': ("startDeleteImage"),
        'stopAction': ("stopDeleteImage"),
        'startLabelTranslation': ("button.cleanup"),
        'stopLabelTranslation': ("button.cancel"),
        'progress': ("image.progress"),
        'started': ("image.active")
      },hashTypes:{'startAction': "STRING",'stopAction': "STRING",'startLabelTranslation': "STRING",'stopLabelTranslation': "STRING",'progress': "ID",'started': "ID"},hashContexts:{'startAction': depth0,'stopAction': depth0,'startLabelTranslation': depth0,'stopLabelTranslation': depth0,'progress': depth0,'started': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "wp-progress-button", options))));
      data.buffer.push("\n</fieldset>\n</div>\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/sync", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = '', helper, options;
      data.buffer.push("\n    <p>\n     ");
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "help.sync-active", options) : helperMissing.call(depth0, "t", "help.sync-active", options))));
      data.buffer.push("\n    </p>\n  ");
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = '', helper, options;
      data.buffer.push("\n    <p>\n    ");
      data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "help.sync", options) : helperMissing.call(depth0, "t", "help.sync", options))));
      data.buffer.push("\n    </p>\n  ");
      return buffer;
      }

    function program5(depth0,data) {
      
      var buffer = '';
      data.buffer.push("\n     <img\n      ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'src': ("current.thumbnail")
      },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
      data.buffer.push("\n      ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'class': ("active:sync-thumb:hide")
      },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(" />\n   ");
      return buffer;
      }

      data.buffer.push("<div class=\"sync\">\n  ");
      stack1 = helpers['if'].call(depth0, "active", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n  ");
      data.buffer.push(escapeExpression((helper = helpers['wp-progress-button'] || (depth0 && depth0['wp-progress-button']),options={hash:{
        'startAction': ("startSync"),
        'stopAction': ("stopSync"),
        'startLabelTranslation': ("button.start-sync"),
        'stopLabelTranslation': ("button.stop-sync"),
        'progress': ("progress"),
        'started': ("active")
      },hashTypes:{'startAction': "STRING",'stopAction': "STRING",'startLabelTranslation': "STRING",'stopLabelTranslation': "STRING",'progress': "ID",'started': "ID"},hashContexts:{'startAction': depth0,'stopAction': depth0,'startLabelTranslation': depth0,'stopLabelTranslation': depth0,'progress': depth0,'started': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "wp-progress-button", options))));
      data.buffer.push("\n   ");
      stack1 = helpers['if'].call(depth0, "current.thumbnail", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n</div>\n\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/tabbaritem", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1;


      stack1 = helpers._triageMustache.call(depth0, "view.tabLabel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/views/tabbar", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

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

    __exports__["default"] = TabBarView;
  });