
;define("wp-imgur/app", 
  ["ember","ember/resolver","ember/load-initializers","wp-imgur/ext/easy_form","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Resolver = __dependency2__["default"];
    var loadInitializers = __dependency3__["default"];
    var EasyForm = __dependency4__["default"];

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
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    var WpProgressButtonComponent = Ember.Component.extend({
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
      configKey: 'wp_imgur_app_run',

      store: function() {
        return window[this.get('configKey')];
      }.property(),

      apiEndpoint: function() {
        return this.get('store').apiEndpoint;
      }.property('store'),

      nonce: function() {
        return this.get('store').nonce;
      }.property('store'),

      debug: function() {
        return this.get('store').debug === '1';
      }.property('store'),

      authorized: function() {
        return this.get('store').authorized === '1';
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
          this._syncOnMediaUpload = this.get('store').syncOnMediaUpload === '1';
        }

        if (value !== undefined) {
          this._syncOnMediaUpload = value;
        }

        return this._syncOnMediaUpload;
      }.property('store'),

      syncOnMediaEdit: function(name, value) {
        if (this._syncOnMediaEdit === undefined) {
          this._syncOnMediaEdit = this.get('store').syncOnMediaEdit === '1';
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
  ["ember","wp-imgur/models/auth","wp-imgur/models/notice","wp-imgur/models/pages","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var auth = __dependency2__["default"];
    var Notice = __dependency3__["default"];
    var pages = __dependency4__["default"];

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
          Notice.showAfter(promise, 'PIN Verified Successfully');

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
  ["ember","wp-imgur/config","wp-imgur/models/auth","wp-imgur/models/pages","wp-imgur/models/notice","wp-imgur/models/image","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var config = __dependency2__["default"];
    var auth = __dependency3__["default"];
    var pages = __dependency4__["default"];
    var Notice = __dependency5__["default"];
    var image = __dependency6__["default"];

    var SettingsController = Ember.ObjectController.extend({
      config: config,
      auth: auth,
      image: image,

      albumUrl: function() {
        return 'http://imgur.com/a/' + config.get('album');
      }.property('config.album'),

      onDeleteImageStart: function() {
        Notice.show('progress', 'Deleting Images ...');
        pages.set('lockEnabled', true);
      },

      onDeleteImageProgress: function() {
      },

      onDeleteImageStop: function() {
        Notice.hide();
        pages.set('lockEnabled', false);
      },

      onDeleteImageError: function(error) {
        Notice.show('error', 'Failed to delete image: ' + error);
        pages.set('lockEnabled', false);
      },

      onDeleteImageComplete: function() {
        var siteUrl = config.get('siteUrl');
        Notice.show('success', 'Album "' + siteUrl + '" was emptied successfully.');
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
      batchSize: 4,

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
      taskQueue : null,
      active    : false,
      batchSize : 4,
      didLoad   : false,
      current   : null,

      taskEvents            : {
        'taskQueueStart'    : 'taskQueueStart',
        'taskQueueProgress' : 'taskQueueProgress',
        'taskQueueComplete' : 'taskQueueComplete',
        'taskQueueError'    : 'taskQueueError',
        'taskQueueStop'     : 'taskQueueStop'
      },

      init: function() {
        var taskQueue = TaskQueue.create({ batchSize: this.get('batchSize') });
        taskQueue.on('taskQueueProgress' , this, this.didTaskQueueProgress);
        taskQueue.on('taskQueueComplete' , this, this.didTaskQueueComplete);
        taskQueue.on('taskQueueError'    , this, this.didTaskQueueError);

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

        if (this.get('didLoad')) {
          this.taskQueue.start();
        } else {
          var self = this;
          this.load().then(function(items) {
            self.set('didLoad', true);
            self.startQueue(items);
          });
        }
      },

      stop: function() {
        this.set('active', false);
        this.taskQueue.stop();
        this.triggerQueueEvent('taskQueueStop');
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

      didTaskQueueProgress: function(task) {
        this.set('current', task.get('output'));
        this.triggerQueueEvent('taskQueueProgress');
      },

      didTaskQueueComplete: function() {
        this.set('active', false);
        this.set('didLoad', false);
        this.triggerQueueEvent('taskQueueComplete');
      },

      didTaskQueueError: function(task, error) {
        this.set('active', false);
        this.triggerQueueEvent('taskQueueError', error);
        this.taskQueue.stop();
      },

      progress: function() {
        return Math.round(this.taskQueue.get('progress'));
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
      batchSize : 1,
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
                console.log('TQ.runTask: error', error);
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
        }

        this.trigger('taskQueueError', task, error);
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
      }

    });

    __exports__["default"] = TaskQueue;
  });
;define("wp-imgur/controllers/sync", 
  ["ember","wp-imgur/models/notice","wp-imgur/models/pages","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Notice = __dependency2__["default"];
    var pages = __dependency3__["default"];

    var SyncController = Ember.ObjectController.extend({
      onSyncStart: function() {
        Notice.show('progress', 'Starting Sync ...');
        pages.set('lockEnabled', true);
      },

      onSyncProgress: function() {
        var model = this.get('content');
        Notice.show('progress', 'Synchronizing ' + model.get('current.name') + ' ...');
      },

      onSyncStop: function() {
        Notice.show('success', 'Sync Stopped.');
        pages.set('lockEnabled', false);
      },

      onSyncError: function(error) {
        Notice.show('error', error);
        pages.set('lockEnabled', false);
      },

      onSyncComplete: function() {
        Notice.show('success', 'Sync Completed.');
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
      batchSize: 4,

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
          WpNotice.show('error', 'Error: ' + reason);
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
      var buffer = '', stack1, escapeExpression=this.escapeExpression;


      data.buffer.push("<h2 class=\"nav-tab-wrapper\">\n  <span>WP Imgur</span>\n  ");
      data.buffer.push(escapeExpression(helpers.view.call(depth0, "tabbar", {hash:{
        'content': ("pages.labels"),
        'selectedIndex': ("pages.selectedPage"),
        'lockEnabled': ("pages.lockEnabled")
      },hashTypes:{'content': "ID",'selectedIndex': "ID",'lockEnabled': "ID"},hashContexts:{'content': depth0,'selectedIndex': depth0,'lockEnabled': depth0},contexts:[depth0],types:["STRING"],data:data})));
      data.buffer.push("\n</h2>\n\n");
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
      var buffer = '', stack1;


      data.buffer.push("<fieldset>\n	<legend>\n    <span>Authorize</span>\n  </legend>\n  <div class=\"wp-imgur-auth\">\n  ");
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
      var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


      data.buffer.push("<p>WP Imgur is authorized to upload images to your <a\nhref=\"http://imgur.com\">Imgur</a> account in <em>");
      stack1 = helpers._triageMustache.call(depth0, "config.uploadMode", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</em> mode</a>.</p>\n");
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


      data.buffer.push("<p>Before you begin using WP Imgur, you need to grant it permissions\nto upload media to your Imgur Account. Click the <em>authorize</em> button to\nproceed.</p>\n");
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
      data.buffer.push(">\n<fieldset>\n	<legend>\n    <span>Media Uploader Integration</span>\n  </legend>\n  <p>WP Imgur can auto sync any new images you upload or edit in\n  WordPress. You can\nchange this behaviour below.</p>\n  <p>\n	<label>\n    ");
      data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
        'type': ("checkbox"),
        'name': ("syncOnMediaUpload"),
        'checked': ("config.syncOnMediaUpload")
      },hashTypes:{'type': "STRING",'name': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'name': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
      data.buffer.push("Auto Sync on Media Upload\n	</label>\n  </p>\n  <p>\n	<label>\n    ");
      data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
        'type': ("checkbox"),
        'name': ("syncOnMediaEdit"),
        'checked': ("config.syncOnMediaEdit")
      },hashTypes:{'type': "STRING",'name': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'name': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
      data.buffer.push("Auto Sync on Media Edit\n	</label>\n  </p>\n  ");
      data.buffer.push(escapeExpression((helper = helpers['wp-button'] || (depth0 && depth0['wp-button']),options={hash:{
        'action': ("updateMediaOptions"),
        'label': ("Save Changes")
      },hashTypes:{'action': "STRING",'label': "STRING"},hashContexts:{'action': depth0,'label': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "wp-button", options))));
      data.buffer.push("\n</fieldset>\n\n<fieldset>\n	<legend><span>Cleanup</span></legend>\n  <p>If you wish to uninstall the plugin you can optionally empty the\n  <a ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'href': ("albumUrl")
      },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">Album</a> on the Imgur server containing your synced images.</p>\n  ");
      data.buffer.push(escapeExpression((helper = helpers['wp-progress-button'] || (depth0 && depth0['wp-progress-button']),options={hash:{
        'startAction': ("startDeleteImage"),
        'stopAction': ("stopDeleteImage"),
        'startLabel': ("Empty Album"),
        'stopLabel': ("Cancel"),
        'progress': ("image.progress"),
        'started': ("image.active")
      },hashTypes:{'startAction': "STRING",'stopAction': "STRING",'startLabel': "STRING",'stopLabel': "STRING",'progress': "ID",'started': "ID"},hashContexts:{'startAction': depth0,'stopAction': depth0,'startLabel': depth0,'stopLabel': depth0,'progress': depth0,'started': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "wp-progress-button", options))));
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
      var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

    function program1(depth0,data) {
      
      
      data.buffer.push("\n    <p>\n    Please wait while your Media is Synced to <a\n    href=\"http://imgur.com\">Imgur</a> servers. This\n    may take a few minutes depending on the size of your Media Library ...\n    </p>\n  ");
      }

    function program3(depth0,data) {
      
      
      data.buffer.push("\n    <p>\n    Uploads your Media Library to <a\n    href=\"http://imgur.com\">Imgur</a>. You only need to do this\n    the first time that you install WP-Imgur. All subsequent media uploads\n    are automatically sent to the Imgur servers when you upload images via the Media\n    Uploader.\n    </p>\n  ");
      }

    function program5(depth0,data) {
      
      var buffer = '';
      data.buffer.push("\n     <img ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'src': ("current.thumbnail")
      },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(" ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'class': ("active:sync-thumb:hide")
      },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
      data.buffer.push("/>\n   ");
      return buffer;
      }

      data.buffer.push("<div class=\"sync\">\n  ");
      stack1 = helpers['if'].call(depth0, "active", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n  ");
      data.buffer.push(escapeExpression((helper = helpers['wp-progress-button'] || (depth0 && depth0['wp-progress-button']),options={hash:{
        'startAction': ("startSync"),
        'stopAction': ("stopSync"),
        'startLabel': ("Start Sync"),
        'stopLabel': ("Stop Sync"),
        'progress': ("progress"),
        'started': ("active")
      },hashTypes:{'startAction': "STRING",'stopAction': "STRING",'startLabel': "STRING",'stopLabel': "STRING",'progress': "ID",'started': "ID"},hashContexts:{'startAction': depth0,'stopAction': depth0,'startLabel': depth0,'stopLabel': depth0,'progress': depth0,'started': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "wp-progress-button", options))));
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


      stack1 = helpers._triageMustache.call(depth0, "view.content", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/tests/ext/task_queue-test", 
  ["ember","wp-imgur/ext/task_queue"],
  function(__dependency1__, __dependency2__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var TaskQueue = __dependency2__["default"];

    var stub = function() {};
    var stubError = function() { throw 'foo-error'; };

    var taskQueue;
    var MockTask = Ember.Object.extend({
      run: function() { return this.id; }
    });

    var DelayTask = Ember.Object.extend({
      delay: 1,
      run: function() {
        var self = this;
        var promise = new Ember.RSVP.Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve('foo');
          }, 1);
        });

        return promise;
      }
    });


    module("wp-imgur/ext/task/TaskQueue", {
      setup: function() {
        taskQueue = TaskQueue.create();
      },

      teardown: function() {
        taskQueue = null;
      }
    });

    test("it is a TaskQueue Object", function(assert) {
      assert.ok(TaskQueue.detectInstance(taskQueue));
    });

    test("it can store task objects", function(assert) {
      var task = MockTask.create();
      taskQueue.add(task);

      assert.equal(taskQueue.taskAt(0), task);
    });

    test("it can store multiple task objects", function(assert) {
      var task;
      task = MockTask.create({id: 1});
      taskQueue.add(task);

      task = MockTask.create({id: 2});
      taskQueue.add(task);

      task = MockTask.create({id: 3});
      taskQueue.add(task);

      var length = taskQueue.tasks.length;
      assert.equal(length, 3);

      assert.equal(taskQueue.taskAt(0).get('id'), 1);
      assert.equal(taskQueue.taskAt(1).get('id'), 2);
      assert.equal(taskQueue.taskAt(2).get('id'), 3);
    });

    test('it knows if taskQueue is not active initially', function(assert) {
      assert.equal(taskQueue.get('active'), false);
    });

    test('it knows taskQueue is not active after adding tasks', function(assert) {
      taskQueue.add(MockTask.create({id: 1}));
      assert.equal(taskQueue.get('active'), false);
    });

    asyncTest('it knows when active taskQueue becomes inactive', function(assert) {
      taskQueue.add(DelayTask.create({id: 1}));
      taskQueue.start();
      taskQueue.on('taskQueueComplete', function() {
        assert.equal(taskQueue.get('active'), false);
        QUnit.start();
      });
    });

    test('it copies tasks to pending on start', function(assert) {
      taskQueue.add(MockTask.create());
      taskQueue.add(MockTask.create());
      taskQueue.add(MockTask.create());

      taskQueue.next = stub;
      taskQueue.start();

      assert.equal(taskQueue.get('pending').length, 3);
    });

    test('it creates empty completed list on start', function(assert) {
      taskQueue.add(MockTask.create());
      taskQueue.next = stub;
      taskQueue.start();

      assert.equal(taskQueue.get('completed').length, 0);
    });

    test('it creates empty failures list on start', function(assert) {
      taskQueue.add(MockTask.create());
      taskQueue.next = stub;
      taskQueue.start();

      assert.equal(taskQueue.get('failures').length, 0);
    });

    test('it creates empty running list on start', function(assert) {
      taskQueue.add(MockTask.create());
      taskQueue.next = stub;
      taskQueue.start();

      assert.equal(taskQueue.get('running').length, 0);
    });

    test('it has default batch size', function(assert) {
      var batchSize = taskQueue.get('batchSize');
      assert.equal(batchSize, 1);
    });

    test('it stores batch size', function(assert) {
      taskQueue.set('batchSize', 5);
      assert.equal(taskQueue.get('batchSize'), 5);
    });

    test('it can find next task to run', function(assert) {
      taskQueue.add(MockTask.create({id: 1}));
      taskQueue.add(MockTask.create({id: 2}));
      taskQueue.next = stub;
      taskQueue.start();

      var task = taskQueue.nextTask();
      assert.equal(task.get('id'), 1);
    });

    test('it can find next task to run in correct order', function(assert) {
      taskQueue.add(MockTask.create({id: 1}));
      taskQueue.add(MockTask.create({id: 2}));
      taskQueue.add(MockTask.create({id: 3}));
      taskQueue.next = stub;
      taskQueue.start();

      var task;

      task = taskQueue.nextTask();
      assert.equal(task.get('id'), 1);

      task = taskQueue.nextTask();
      assert.equal(task.get('id'), 2);

      task = taskQueue.nextTask();
      assert.equal(task.get('id'), 3);
    });

    test('it returns null if pending list is empty', function(assert) {
      taskQueue.add(MockTask.create({id: 1}));
      taskQueue.add(MockTask.create({id: 2}));
      taskQueue.add(MockTask.create({id: 3}));
      taskQueue.next = stub;
      taskQueue.start();

      var task;

      taskQueue.nextTask();
      taskQueue.nextTask();
      taskQueue.nextTask();

      task = taskQueue.nextTask();
      assert.equal(task, null);
    });

    test('it puts pending items on running list one at a time for batch size 1', function(assert) {
      taskQueue.set('batchSize', 1);
      taskQueue.add(MockTask.create({id: 1}));
      taskQueue.add(MockTask.create({id: 2}));
      taskQueue.add(MockTask.create({id: 3}));
      taskQueue.runTask = stub;
      taskQueue.start();

      var length = taskQueue.get('running').length;
      assert.equal(length, 1);

      var task = taskQueue.get('running')[0];
      assert.equal(task.get('id'), 1);
    });

    test('it puts pending items on running list as per batchSize', function(assert) {
      taskQueue.set('batchSize', 3);
      taskQueue.runTask = stub;

      for (var i = 0; i < 10; i++) {
        taskQueue.add(MockTask.create({id: i+1}));
      }

      taskQueue.start();

      var running = taskQueue.get('running');
      var length = running.length;

      assert.equal(length, 3);

      assert.equal(running[0].get('id'), 1);
      assert.equal(running[1].get('id'), 2);
      assert.equal(running[2].get('id'), 3);
    });

    test('it breaks out of next while loop when no more tasks to run', function(assert) {
      taskQueue.set('batchSize', 3);
      taskQueue.runTask = stub;

      for (var i = 0; i < 4; i++) {
        taskQueue.add(MockTask.create({id: i+1}));
      }

      taskQueue.start();
      taskQueue.set('running', Ember.A());

      for (i = 0; i < 10; i++) {
        taskQueue.next();
      }

      var running = taskQueue.get('running');
      var length = running.length;

      assert.equal(length, 1);
      assert.equal(running[0].get('id'), 4);
    });

    test('it runs the next task that is pending', function(assert) {
      var didRunTask = null;

      taskQueue.add(MockTask.create({id: 1}));
      taskQueue.runTask = function(task) {
        didRunTask = task;
      };

      taskQueue.start();

      assert.equal(didRunTask.get('id'), 1);
    });

    test('it runs the next task that is pending in batchSizes', function(assert) {
      var didRunTasks = [];

      taskQueue.set('batchSize', 3);
      taskQueue.add(MockTask.create({id: 1}));
      taskQueue.add(MockTask.create({id: 2}));
      taskQueue.add(MockTask.create({id: 3}));

      taskQueue.runTask = function(task) {
        didRunTasks.push(task);
      };

      taskQueue.start();

      assert.equal(didRunTasks[0].get('id'), 1);
      assert.equal(didRunTasks[1].get('id'), 2);
      assert.equal(didRunTasks[2].get('id'), 3);
    });

    test('it can detect if result is not a promise', function(assert) {
      var actual = taskQueue.isResultPromise('foo');
      assert.equal(actual, false);
    });

    test('it can detect if result is a promise', function(assert) {
      var promise = new Ember.RSVP.Promise(stub);
      var actual  = taskQueue.isResultPromise(promise);

      assert.equal(actual, true);
    });

    test('it notifies taskStart handler on task run', function(assert) {
      var task = MockTask.create({id: 1});
      var didTaskStart = false;
      taskQueue.didTaskStart = function() {
        didTaskStart = true;
      };

      taskQueue.didTaskComplete = stub;
      taskQueue.runTask(task);

      assert.equal(didTaskStart, true);
    });

    test('it notifies taskComplete handler on immediate task completion', function(assert) {
      var task = MockTask.create({id: 'foo'});
      var didTaskComplete;

      taskQueue.didTaskStart = stub;
      taskQueue.didTaskComplete = function(task, output) {
        didTaskComplete = [task, output];
      };

      taskQueue.runTask(task);
      assert.equal(didTaskComplete[0].get('id'), 'foo');
      assert.equal(didTaskComplete[1], 'foo');
    });

    test('it notifies taskError handler on immediate task error', function(assert) {
      var task = MockTask.create({id: 'foo'});
      task.run = function() {
        throw 'foo-error';
      };
      var didTaskError = [];

      taskQueue.didTaskStart = stub;
      taskQueue.didTaskError = function(task, error) {
        didTaskError = [task, error];
      };

      taskQueue.runTask(task);

      assert.equal(didTaskError.length, 2);
      assert.equal(didTaskError[0].get('id'), 'foo');
      assert.equal(didTaskError[1], 'foo-error');
    });

    asyncTest('it notifies taskComplete handler when promise resolves', function(assert) {
      var task = MockTask.create({id: 'foo'});
      task.run = function() {
        var promise = new Ember.RSVP.Promise(function(resolve, reject) {
          resolve('foo-output');
        });

        return promise;
      };

      var didTaskComplete = [];

      taskQueue.didTaskStart = stub;
      taskQueue.didTaskComplete = function(task, output) {
        didTaskComplete = [task, output];
      };

      taskQueue.runTask(task).then(function() {
        assert.equal(didTaskComplete.length, 2);
        assert.equal(didTaskComplete[0].get('id'), 'foo');
        assert.equal(didTaskComplete[1], 'foo-output');
        QUnit.start();
      });
    });

    asyncTest('it notifies taskError handler when promise rejects', function(assert) {
      var task = MockTask.create({id: 'foo'});
      task.run = function() {
        var promise = new Ember.RSVP.Promise(function(resolve, reject) {
          reject('foo-error');
        });

        return promise;
      };

      var didTaskError = [];

      taskQueue.didTaskStart = stub;
      taskQueue.didTaskError = function(task, output) {
        didTaskError = [task, output];
      };

      taskQueue.runTask(task).then(function() {
        assert.equal(didTaskError.length, 2);
        assert.equal(didTaskError[0].get('id'), 'foo');
        assert.equal(didTaskError[1], 'foo-error');
        QUnit.start();
      });
    });

    test('it triggers taskQueueStart event on receiving task start for the first task', function(assert) {
      var task = MockTask.create();
      var didTaskQueueStart = false;
      taskQueue.one('taskQueueStart', function() {
        didTaskQueueStart = true;
      });

      taskQueue.didTaskStart(task);
      assert.equal(didTaskQueueStart, true);
    });

    test('it does not trigger taskQueueStart event on receiving tasks after first task', function(assert) {
      var task = MockTask.create();
      var didTaskQueueStart = 0;
      taskQueue.on('taskQueueStart', function() {
        didTaskQueueStart++;
      });

      taskQueue.didTaskStart(task);
      taskQueue.didTaskStart(task);
      taskQueue.didTaskStart(task);

      assert.equal(didTaskQueueStart, 1);
    });

    test('it removes task from running list on task completion', function(assert) {
      var task = MockTask.create({id: 'foo'});

      taskQueue.add(task);
      taskQueue.start();

      taskQueue.didTaskComplete(task, 'foo-output');
      assert.equal(taskQueue.runningAt(task), -1);
    });

    test('it adds task to completion list on completion', function(assert) {
      var task = MockTask.create({id: 'foo'});

      taskQueue.add(task);
      taskQueue.start();

      assert.equal(taskQueue.completedAt(task), 0);
    });

    test('it updates progress property on task completion', function(assert) {
      var task;
      task = MockTask.create({id: 1});
      taskQueue.add(task);

      task = MockTask.create({id: 2});
      taskQueue.add(task);

      task = MockTask.create({id: 3});
      taskQueue.add(task);

      task = MockTask.create({id: 4});
      taskQueue.add(task);

      assert.equal(taskQueue.get('progress'), 0);
      taskQueue.start();
      assert.equal(taskQueue.get('progress'), 100);
    });

    test('it removes task from running list on task error', function(assert) {
      var task = MockTask.create({id: 'foo'});
      task.run = stubError;

      taskQueue.add(task);
      taskQueue.start();

      assert.equal(taskQueue.runningAt(task), -1);
    });

    test('it adds task to failures list on task error', function(assert) {
      var task = MockTask.create({id: 'foo'});
      task.run = stubError;

      taskQueue.add(task);
      taskQueue.start();

      assert.equal(taskQueue.failureAt(task), 0);
    });

    asyncTest('it can run delayed tasks correctly', function(assert) {
      var i, task;
      taskQueue.set('batchSize', 3);

      for (i = 0; i < 5; i++) {
        task = DelayTask.create({delay: 1, id: i+1});
        taskQueue.add(task);
      }

      taskQueue.on('taskQueueComplete', function() {
        assert.equal(taskQueue.get('progress'), 100);
        QUnit.start();
      });

      taskQueue.start();
    });

    asyncTest('it empties the running task stack on taskQueue stop', function(assert) {
      var i, task;
      taskQueue.set('batchSize', 2);
      var didStop = false;

      for (i = 0; i < 5; i++) {
        task = DelayTask.create({delay: 1, id: i+1});
        taskQueue.add(task);
      }

      taskQueue.on('taskQueueProgress', function() {
        if (taskQueue.get('progress') === 20) {
          taskQueue.stop();
          assert.equal(taskQueue.get('running').length, 0);
          assert.equal(taskQueue.get('pending').length, 4);
          QUnit.start();
        }
      });

      taskQueue.start();
    });

    asyncTest('it can resume a stopped taskQueue', function(assert) {
      var i, task;
      taskQueue.set('batchSize', 1);
      var didStop = false;

      for (i = 0; i < 5; i++) {
        task = DelayTask.create({delay: 1, id: i+1});
        taskQueue.add(task);
      }

      taskQueue.on('taskQueueProgress', function() {
        if (!didStop) {
          if (taskQueue.get('progress') === 20) {
            taskQueue.stop();
            didStop = true;

            taskQueue.start();
          }
        }
      });

      taskQueue.on('taskQueueComplete', function() {
        assert.equal(taskQueue.get('progress'), 100);
        QUnit.start();
      });

      taskQueue.start();
    });
  });
;define("wp-imgur/tests/helpers/resolver", 
  ["ember/resolver","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Resolver = __dependency1__["default"];

    var resolver = Resolver.create();

    resolver.namespace = {
      modulePrefix: 'wp-imgur'
    };

    __exports__["default"] = resolver;
  });
;define("wp-imgur/tests/helpers/start-app", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /* global require */

    var Application = require('wp-imgur/app')['default'];
    var Router = require('wp-imgur/router')['default'];

    __exports__["default"] = function startApp(attrs) {
      var App;

      var attributes = Ember.merge({
        // useful Test defaults
        rootElement: '#ember-testing',
        LOG_ACTIVE_GENERATION:false,
        LOG_VIEW_LOOKUPS: false
      }, attrs); // but you can override;

      Router.reopen({
        location: 'none'
      });

      Ember.run(function(){
        App = Application.create(attributes);
        App.setupForTesting();
        App.injectTestHelpers();
      });

      App.reset(); // this shouldn't be needed, i want to be able to "start an app at a specific URL"

      return App;
    }
  });
;define("wp-imgur/tests/models/notice-test", 
  ["wp-imgur/models/notice"],
  function(__dependency1__) {
    "use strict";
    var Notice = __dependency1__["default"];

    var notice;

    module('Unit: Notice Model', {
      setup: function() {
        notice = Notice;
      }
    });

    test('notice is not enabled by default', function(assert) {
      var actual = notice.get('enabled');
      assert.equal(false, actual);
    });

    test('notice is enabled after type change', function(assert) {
      notice.show('error', 'foo');
      var actual = notice.get('enabled');
      assert.equal(true, actual);
    });

    test('notice can convert string value to messages', function(assert) {
      var messages = notice.toMessages('foo');
      assert.deepEqual(['foo'], messages);
    });

    test('notice can convert list of errors to messages', function(assert) {
      var messages = notice.toMessages(['a', 'b', 'c']);
      assert.deepEqual(['a', 'b', 'c'], messages);
    });

    test('notice can convert field errors to messages', function(assert) {
      var messages = notice.toMessages({
        'foo': ['a', 'b'],
        'bar': ['c', 'd']
      });

      assert.deepEqual(['a', 'b', 'c', 'd'], messages);
    });

    test('notice return unknown error for empty fields', function(assert) {
      var messages = notice.toMessages({});
      assert.deepEqual([], messages);
    });

    /*
    test('notice return unknown error for invalid value', function(assert) {
      var message = '';
      var err;

      assert.throws(function() {
        try {
          notice.foo();
        } catch (error) {
          err = error;
          throw error;
        }
      }, Error);

      var messages = notice.toMessages(err);
      assert.deepEqual(['TypeError: undefined is not a function'], messages);
    });
    */
  });
;define("wp-imgur/tests/test-helper", 
  ["wp-imgur/tests/helpers/resolver","ember-qunit"],
  function(__dependency1__, __dependency2__) {
    "use strict";
    var resolver = __dependency1__["default"];
    var setResolver = __dependency2__.setResolver;

    setResolver(resolver);

    document.write('<div id="ember-testing-container"><div id="ember-testing"></div></div>');
  });
;define("wp-imgur/tests/wp-imgur/app.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur');
    test('wp-imgur/app.js should pass jshint', function() { 
      ok(true, 'wp-imgur/app.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/components/notice-bar.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/components');
    test('wp-imgur/components/notice-bar.js should pass jshint', function() { 
      ok(true, 'wp-imgur/components/notice-bar.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/components/wp-button.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/components');
    test('wp-imgur/components/wp-button.js should pass jshint', function() { 
      ok(true, 'wp-imgur/components/wp-button.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/components/wp-progress-button.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/components');
    test('wp-imgur/components/wp-progress-button.js should pass jshint', function() { 
      ok(true, 'wp-imgur/components/wp-progress-button.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/config.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur');
    test('wp-imgur/config.js should pass jshint', function() { 
      ok(true, 'wp-imgur/config.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/controllers/application.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/controllers');
    test('wp-imgur/controllers/application.js should pass jshint', function() { 
      ok(true, 'wp-imgur/controllers/application.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/controllers/auth/authorized.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/controllers/auth');
    test('wp-imgur/controllers/auth/authorized.js should pass jshint', function() { 
      ok(true, 'wp-imgur/controllers/auth/authorized.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/controllers/auth/verifypin.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/controllers/auth');
    test('wp-imgur/controllers/auth/verifypin.js should pass jshint', function() { 
      ok(true, 'wp-imgur/controllers/auth/verifypin.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/controllers/settings.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/controllers');
    test('wp-imgur/controllers/settings.js should pass jshint', function() { 
      ok(true, 'wp-imgur/controllers/settings.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/controllers/sync.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/controllers');
    test('wp-imgur/controllers/sync.js should pass jshint', function() { 
      ok(true, 'wp-imgur/controllers/sync.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/ext/arrow_api.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/ext');
    test('wp-imgur/ext/arrow_api.js should pass jshint', function() { 
      ok(true, 'wp-imgur/ext/arrow_api.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/ext/easy_form.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/ext');
    test('wp-imgur/ext/easy_form.js should pass jshint', function() { 
      ok(true, 'wp-imgur/ext/easy_form.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/ext/task_queue.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/ext');
    test('wp-imgur/ext/task_queue.js should pass jshint', function() { 
      ok(true, 'wp-imgur/ext/task_queue.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/ext/task_queue_model.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/ext');
    test('wp-imgur/ext/task_queue_model.js should pass jshint', function() { 
      ok(true, 'wp-imgur/ext/task_queue_model.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/ext/wp_notice.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/ext');
    test('wp-imgur/ext/wp_notice.js should pass jshint', function() { 
      ok(true, 'wp-imgur/ext/wp_notice.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/models/auth.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/models');
    test('wp-imgur/models/auth.js should pass jshint', function() { 
      ok(true, 'wp-imgur/models/auth.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/models/image.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/models');
    test('wp-imgur/models/image.js should pass jshint', function() { 
      ok(true, 'wp-imgur/models/image.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/models/notice.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/models');
    test('wp-imgur/models/notice.js should pass jshint', function() { 
      ok(true, 'wp-imgur/models/notice.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/models/pages.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/models');
    test('wp-imgur/models/pages.js should pass jshint', function() { 
      ok(true, 'wp-imgur/models/pages.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/models/settings.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/models');
    test('wp-imgur/models/settings.js should pass jshint', function() { 
      ok(true, 'wp-imgur/models/settings.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/models/sync.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/models');
    test('wp-imgur/models/sync.js should pass jshint', function() { 
      ok(true, 'wp-imgur/models/sync.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/router.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur');
    test('wp-imgur/router.js should pass jshint', function() { 
      ok(true, 'wp-imgur/router.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/routes/application.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/routes');
    test('wp-imgur/routes/application.js should pass jshint', function() { 
      ok(true, 'wp-imgur/routes/application.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/routes/auth.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/routes');
    test('wp-imgur/routes/auth.js should pass jshint', function() { 
      ok(true, 'wp-imgur/routes/auth.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/routes/auth/verifypin.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/routes/auth');
    test('wp-imgur/routes/auth/verifypin.js should pass jshint', function() { 
      ok(true, 'wp-imgur/routes/auth/verifypin.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/routes/settings.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/routes');
    test('wp-imgur/routes/settings.js should pass jshint', function() { 
      ok(true, 'wp-imgur/routes/settings.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/routes/sync.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/routes');
    test('wp-imgur/routes/sync.js should pass jshint', function() { 
      ok(true, 'wp-imgur/routes/sync.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/tests/ext/task_queue-test.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/tests/ext');
    test('wp-imgur/tests/ext/task_queue-test.js should pass jshint', function() { 
      ok(true, 'wp-imgur/tests/ext/task_queue-test.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/tests/helpers/resolver.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/tests/helpers');
    test('wp-imgur/tests/helpers/resolver.js should pass jshint', function() { 
      ok(true, 'wp-imgur/tests/helpers/resolver.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/tests/helpers/start-app.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/tests/helpers');
    test('wp-imgur/tests/helpers/start-app.js should pass jshint', function() { 
      ok(true, 'wp-imgur/tests/helpers/start-app.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/tests/models/notice-test.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/tests/models');
    test('wp-imgur/tests/models/notice-test.js should pass jshint', function() { 
      ok(true, 'wp-imgur/tests/models/notice-test.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/tests/test-helper.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/tests');
    test('wp-imgur/tests/test-helper.js should pass jshint', function() { 
      ok(true, 'wp-imgur/tests/test-helper.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/views/tabbar.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/views');
    test('wp-imgur/views/tabbar.js should pass jshint', function() { 
      ok(true, 'wp-imgur/views/tabbar.js should pass jshint.'); 
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
      content: ['Sync', 'Settings'],
      _selectedIndex: 0,
      _lockEnabled: false,
      didRenderOnce: false,

      itemViewClass: Ember.View.extend({
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
        }.property('enabled')
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