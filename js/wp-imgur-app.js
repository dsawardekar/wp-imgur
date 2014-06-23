
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

      show: function(type, value) {
        this.set('type', type);
        this.set('messages', this.toMessages(value));
      },

      hide: function() {
        this.set('type', null);
        this.set('messages', Ember.A());
      },

      enabled: function() {
        return this.get('type') !== null;
      },

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
      }.property('store')
    });

    __exports__["default"] = Config.create();
  });
;define("wp-imgur/controllers/sync", 
  ["ember","wp-imgur/models/notice","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Notice = __dependency2__["default"];

    var SyncController = Ember.ObjectController.extend({
      onSyncStart: function() {
        Notice.show('progress', 'Starting Sync ...');
      },

      onSyncProgress: function() {
        var model = this.get('content');
        Notice.show('progress', 'Synchronizing ' + model.get('name') + ' ...');

        var thumb = Ember.$('.imgur-thumb');
        thumb.css('background-image', "url(" + model.get('thumbnail') + ")");
      },

      onSyncStop: function() {
        Notice.show('success', 'Sync Stopped.');
      },

      onSyncError: function(error) {
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

    __exports__["default"] = SyncController;
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

      request: function(controller, operation, params) {
        params.url = this.urlFor(controller, operation);

        return new Ember.RSVP.Promise(function(resolve, reject) {
          return Ember.$.ajax(params)
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

    __exports__["default"] = ArrowApi.create();
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
      }
    });

    __exports__["default"] = WpNotice.create();
  });
;define("wp-imgur/models/auth", 
  ["ember","wp-imgur/ext/arrow_api","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var api = __dependency2__["default"];

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

        var self   = this;
        var params = { 'type': 'GET' };

        return api.request('auth', 'index', params)
        .then(function(json) {
          self.set('authorized', json.authorized);
          self.set('authorizeUrl', json.authorizeUrl);
          self.set('pin', '');

          return self;
        });
      },

      verifyPin: function() {
        var data   = { 'pin': this.get('pin') };
        var params = {
          type: 'POST',
          data: JSON.stringify(data)
        };

        return api.request('auth', 'verifyPin', params)
        .then(function(json) {
          return true;
        });
      }
    });

    var instance = AuthModel.create();

    __exports__["default"] = instance;
  });
;define("wp-imgur/models/sync", 
  ["ember","wp-imgur/ext/arrow_api","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var api = __dependency2__["default"];

    var SyncModel = Ember.Object.extend(Ember.Evented, {
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
          })["catch"](function(error) {
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

        return api.request('sync', 'update', params)
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

        return api.request('sync', 'index', params)
        .then(function(items) {
          self.set('items', Ember.A(items));
        });
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
      this.route('authorize');
      this.route('verifypin');
      this.route('sync');
    });

    __exports__["default"] = Router;
  });
;define("wp-imgur/routes/application", 
  ["ember","wp-imgur/ext/wp_notice","wp-imgur/models/notice","wp-imgur/models/auth","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var WpNotice = __dependency2__["default"];
    var Notice = __dependency3__["default"];
    var auth = __dependency4__["default"];

    var ApplicationRoute = Ember.Route.extend({
      model: function() {
        return auth.load();
      },

      afterModel: function(model) {
        WpNotice.hide();

        if (model.get('authorized')) {
          this.transitionTo('sync');
        } else {
          this.transitionTo('authorize');
        }
      },

      actions: {
        authorizeStart: function() {
          window.open(auth.get('authorizeUrl'), '_blank');
          this.get('controller').transitionToRoute('verifypin');
        },

        verifyPin: function() {
          Notice.show('progress', 'Verifying PIN ...');
          var self = this;

          auth.verifyPin()
          .then(function() {
            Notice.show('updated', 'PIN Verified successfully.');

            var controller = self.get('controller');
            controller.transitionToRoute('sync');
          })["catch"](function(error) {
            Notice.show('error', error);
          });
        },

        error: function(reason) {
          WpNotice.show('error', 'Error: ' + reason);
        }
      }
    });

    __exports__["default"] = ApplicationRoute;
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
;define("wp-imgur/routes/verifypin", 
  ["ember","wp-imgur/models/auth","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var auth = __dependency2__["default"];

    var VerifyPinRoute = Ember.Route.extend({
      model: function() {
        return auth;
      }
    });

    __exports__["default"] = VerifyPinRoute;
  });
;define("wp-imgur/templates/application", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1;


      stack1 = helpers._triageMustache.call(depth0, "notice-bar", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/authorize", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', escapeExpression=this.escapeExpression;


      data.buffer.push("<p class=\"submit\">\n  <a target='_blank' class=\"button button-primary\" ");
      data.buffer.push(escapeExpression(helpers.action.call(depth0, "authorizeStart", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
      data.buffer.push(">Authorize</a>\n</p>\n");
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
;define("wp-imgur/templates/sync", 
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
      data.buffer.push("\n    <button class=\"button button-primary\" ");
      data.buffer.push(escapeExpression(helpers.action.call(depth0, "stopSync", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
      data.buffer.push(">Stop Sync</button>\n    <strong>&nbsp;");
      stack1 = helpers._triageMustache.call(depth0, "percentComplete", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push(" %</strong>\n    ");
      stack1 = helpers['if'].call(depth0, "thumbnail", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n  ");
      return buffer;
      }
    function program2(depth0,data) {
      
      var buffer = '';
      data.buffer.push("\n    <p class=\"submit\">\n      <img ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'src': ("thumbnail")
      },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(" class=\"imgur-thumb\">\n    </p>\n    ");
      return buffer;
      }

    function program4(depth0,data) {
      
      var buffer = '';
      data.buffer.push("\n    <button class=\"button button-primary\" ");
      data.buffer.push(escapeExpression(helpers.action.call(depth0, "startSync", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
      data.buffer.push(">Start Sync</button>\n  ");
      return buffer;
      }

      data.buffer.push("<p class=\"submit\">\n  ");
      stack1 = helpers['if'].call(depth0, "isActive", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n</p>\n");
      return buffer;
      
    });
  });
;define("wp-imgur/templates/verifypin", 
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
      data.buffer.push("\n  <table class=\"form-table\">\n    <tbody>\n    ");
      data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
        'wrapper': ("wp-input"),
        'label': ("Enter Imgur PIN")
      },hashTypes:{'wrapper': "STRING",'label': "STRING"},hashContexts:{'wrapper': depth0,'label': depth0},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "pin", options) : helperMissing.call(depth0, "input", "pin", options))));
      data.buffer.push("\n    </tbody>\n  </table>\n  <p class=\"submit\">\n    <button class=\"button button-primary\" ");
      data.buffer.push(escapeExpression(helpers.action.call(depth0, "verifyPin", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
      data.buffer.push(">Verify PIN</button>\n  </p>\n");
      return buffer;
      }

      stack1 = (helper = helpers['form-for'] || (depth0 && depth0['form-for']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "", options) : helperMissing.call(depth0, "form-for", "", options));
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      
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
;define("wp-imgur/tests/wp-imgur/config.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur');
    test('wp-imgur/config.js should pass jshint', function() { 
      ok(true, 'wp-imgur/config.js should pass jshint.'); 
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
;define("wp-imgur/tests/wp-imgur/models/notice.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/models');
    test('wp-imgur/models/notice.js should pass jshint', function() { 
      ok(true, 'wp-imgur/models/notice.js should pass jshint.'); 
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
;define("wp-imgur/tests/wp-imgur/routes/sync.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/routes');
    test('wp-imgur/routes/sync.js should pass jshint', function() { 
      ok(true, 'wp-imgur/routes/sync.js should pass jshint.'); 
    });
  });
;define("wp-imgur/tests/wp-imgur/routes/verifypin.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/routes');
    test('wp-imgur/routes/verifypin.js should pass jshint', function() { 
      ok(true, 'wp-imgur/routes/verifypin.js should pass jshint.'); 
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
;define("wp-imgur/tests/wp-imgur/tests/test-helper.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - wp-imgur/tests');
    test('wp-imgur/tests/test-helper.js should pass jshint', function() { 
      ok(true, 'wp-imgur/tests/test-helper.js should pass jshint.'); 
    });
  });