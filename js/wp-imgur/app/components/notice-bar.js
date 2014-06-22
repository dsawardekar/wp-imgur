import Ember from 'ember';
import Notice from 'wp-imgur/models/notice';

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

export default NoticeBarComponent;
