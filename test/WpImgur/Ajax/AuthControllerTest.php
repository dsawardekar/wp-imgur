<?php

namespace WpImgur\Ajax;

use Encase\Container;
require_once __DIR__ . '/JsonPrinter.php';

class AuthControllerTest extends \WP_UnitTestCase {

  public $container;
  public $adapter;
  public $preparer;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->object('pluginMeta', new \WpImgur\PluginMeta('wp-imgur.php'))
      ->singleton('optionsStore', 'Arrow\Options\Store')
      ->packager('imgurPackager', 'WpImgur\Api\Packager')
      ->singleton('syncPreparer', 'WpImgur\Ajax\SyncPreparer')
      ->singleton('authController', 'WpImgur\Ajax\AuthController')
      ->singleton('ajaxJsonPrinter', 'WpImgur\Ajax\JsonPrinter');

    $this->adapter = $this->lookup('imgurAdapter');
    $this->store = $this->lookup('optionsStore');
    $this->preparer = $this->lookup('syncPreparer');
    $this->controller = $this->lookup('authController');
  }

  function lookup($key) {
    return $this->container->lookup($key);
  }

  function test_it_has_an_imgur_adapter() {
    $this->assertSame($this->adapter, $this->controller->imgurAdapter);
  }

  function test_it_has_a_sync_preparer() {
    $this->assertSame($this->preparer, $this->controller->syncPreparer);
  }

  function test_it_has_verify_pin_action() {
    $this->assertContains('verifyPin', $this->controller->adminActions());
  }

  function test_it_only_allows_verify_pin_over_post() {
    $methods = $this->controller->actionMethods();
    $this->assertEquals(array('POST'), $methods['verifyPin']);
  }

  function test_it_will_send_error_if_input_without_pin() {
    $this->controller->params = array();
    $actual = $this->controller->verifyPin();

    $this->assertInstanceOf('Arrow\Ajax\ControllerError', $actual);
  }

  function test_it_will_send_error_if_input_pin_is_invalid() {
    $this->controller->params = array('pin' => '<?php echo "foo";');
    $actual = $this->controller->verifyPin();

    $this->assertInstanceOf('Arrow\Ajax\ControllerError', $actual);
  }

  function test_it_will_send_error_if_invalid_pin() {
    if (!defined('TRAVIS')) return;
    $this->controller->params = array('pin' => 'foo');
    $actual = $this->controller->verifyPin();

    $this->assertInstanceOf('Arrow\Ajax\ControllerError', $actual);
  }

  function test_it_will_success_for_valid_pin() {
    $mock = $this->getMock('Imgur\Adapter');
    $mock->expects($this->once())
      ->method('verifyPin')
      ->with('valid_pin')
      ->will($this->returnValue(true));

    $this->controller->imgurAdapter = $mock;

    $mock = $this->getMock('WpImgur\Ajax\SyncPreparer');
    $mock->expects($this->once())
      ->method('prepare');

    $this->controller->syncPreparer = $mock;
    $this->store->setOption('uploadMode', 'pull');
    $this->store->setOption('album', 'foo');

    $this->controller->params = array('pin' => 'valid_pin');
    $actual = $this->controller->verifyPin();

    $this->assertTrue($actual['authorized']);
    $this->assertEquals('pull', $actual['uploadMode']);
    $this->assertEquals('foo', $actual['album']);
  }


}
