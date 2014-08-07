import Ember from 'ember';
import api from 'wp-imgur/ext/arrow_api';
import TaskQueueModel from 'wp-imgur/ext/task_queue_model';

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

export default SyncModel.create();
