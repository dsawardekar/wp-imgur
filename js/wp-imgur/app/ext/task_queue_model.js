import Ember from 'ember';
import TaskQueue from 'wp-imgur/ext/task_queue';

var TaskQueueModel = Ember.Object.extend(Ember.Evented, {
  taskQueue        : null,
  active           : false,
  batchSize        : 4,
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
    var taskQueue = TaskQueue.create({ batchSize: this.get('batchSize') });
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
      })
      .catch(function(error) {
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

export default TaskQueueModel;
