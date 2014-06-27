import Ember from 'ember';
import api from 'wp-imgur/ext/arrow_api';
import pages from 'wp-imgur/models/pages';
import TaskQueue from 'wp-imgur/ext/task';

var SyncImageTask = Ember.Object.extend({
  id: null,

  run: function() {
    var params = { id: this.get('id') };
    return api.post('sync', params);
  }
});

var SyncModel = Ember.Object.extend(Ember.Evented, {
  taskQueue: null,
  running: false,
  batchSize: 4,
  didLoad: false,

  init: function() {
    var taskQueue = TaskQueue.create({ batchSize: this.get('batchSize') });
    taskQueue.on('taskQueueProgress' , this, this.didTaskQueueProgress);
    taskQueue.on('taskQueueComplete' , this, this.didTaskQueueComplete);
    taskQueue.on('taskQueueError'    , this, this.didTaskQueueError);

    this.set('taskQueue', taskQueue);
  },

  load: function() {
    return api.all('sync');
  },

  startSync: function() {
    this.trigger('syncStart');
    this.set('running', true);

    if (this.get('didLoad')) {
      this.taskQueue.start();
    } else {
      var self = this;
      this.load().then(function(ids) {
        self.set('didLoad', true);
        self.syncImages(ids);
      });
    }
  },

  stopSync: function() {
    this.set('running', false);
    this.taskQueue.stop();
    this.trigger('syncStop');
  },

  syncImages: function(ids) {
    var i = 0;
    var id;
    var n = ids.length;
    var task;

    this.taskQueue.reset();

    for (i = 0; i < n; i++) {
      id   = ids[i];
      task = SyncImageTask.create({ id: id });

      this.taskQueue.add(task);
    }

    this.taskQueue.start();
  },

  didTaskQueueProgress: function(task) {
    this.set('current', task.get('output'));
    this.trigger('syncProgress');
  },

  didTaskQueueComplete: function() {
    this.set('running', false);
    this.set('didLoad', false);
    this.trigger('syncComplete');
  },

  didTaskQueueError: function(error) {
    this.set('running', false);
    this.trigger('syncError', error);
    this.taskQueue.stop();
  },

  progress: function() {
    return Math.round(this.taskQueue.get('progress'));
  }.property('taskQueue.progress'),

  active: function() {
    return this.get('running');
  }.property('running')

});

export default SyncModel.create();
