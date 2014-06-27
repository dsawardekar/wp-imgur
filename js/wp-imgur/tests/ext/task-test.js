import Ember from 'ember';
import { TaskQueue, Task } from 'wp-imgur/ext/task';

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

test('it knows if taskQueue is inactive', function(assert) {
  assert.equal(taskQueue.get('active'), false);
});

test('it knows if taskQueue is active', function(assert) {
  taskQueue.pending.push('foo');
  assert.equal(taskQueue.get('active'), true);
});

test('it knows when active taskQueue becomes inactive', function(assert) {
  taskQueue.pending.push('foo');
  assert.equal(taskQueue.get('active'), true);
  taskQueue.reset();

  assert.equal(taskQueue.get('active'), false);
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
