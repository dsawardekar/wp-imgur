import Notice from 'wp-imgur/models/notice';

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
