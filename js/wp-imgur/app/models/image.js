import Ember from 'ember';
import api from 'wp-imgur/ext/arrow_api';
import TaskQueueModel from 'wp-imgur/ext/task_queue_model';

var DeleteImageTask = Ember.Object.extend({
  id: null,

  run: function() {
    return api.delete('image', { id: this.get('id') });
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

export default ImageModel.create();
