import Ember from 'ember';

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
          })
          .catch(function(error) {
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

export default TaskQueue;
