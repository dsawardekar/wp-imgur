<?php

namespace WpImgur\Ajax;

use Encase\Container;

require_once __DIR__ . '/JsonPrinter.php';

class SyncControllerTest extends \WP_UnitTestCase {

  public $container;
  public $attachmentPostType;
  public $syncer;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->object('pluginMeta', new \WpImgur\PluginMeta('wp-imgur.php'))
      ->singleton('optionsStore', 'Arrow\Options\Store')
      ->packager('imgurApiPackager', 'WpImgur\Api\Packager')
      ->packager('imagePackager', 'WpImgur\Image\Packager')
      ->packager('attachmentPackager', 'WpImgur\Attachment\Packager')
      ->singleton('ajaxJsonPrinter', 'WpImgur\Ajax\JsonPrinter')
      ->singleton('syncController', 'WpImgur\Ajax\SyncController');

    $this->controller = $this->lookup('syncController');
  }

  function lookup($key) {
    return $this->container->lookup($key);
  }

  function test_it_has_an_attachment_post_type() {
    $this->assertInstanceOf('WpImgur\Attachment\PostType', $this->controller->attachmentPostType);
  }

  function test_it_can_find_all_attachment_ids() {
    $meta = array(
      'post_mime_type' => 'image/jpeg',
      'post_type' => 'attachment'
    );
    $ids = array();
    array_push($ids, $this->factory->attachment->create_object('image-1', 1, $meta));
    array_push($ids, $this->factory->attachment->create_object('image-2', 2, $meta));
    array_push($ids, $this->factory->attachment->create_object('image-3', 3, $meta));

    $actual = $this->controller->index();

    $this->assertSame(
      array_diff($ids, $actual), array_diff($actual, $ids)
    );
  }

  function test_it_will_return_empty_list_if_no_attachments_found() {
    $actual = $this->controller->index();
    $this->assertEmpty($actual);
  }

  function test_it_will_not_sync_without_id() {
    $this->controller->params = array();
    $actual = $this->controller->update();
    $this->assertInstanceOf('Arrow\Ajax\ControllerError', $actual);
  }

  function test_it_will_not_sync_with_invalid_id() {
    $this->controller->params = array('id' => 'foo');
    $actual = $this->controller->update();
    $this->assertInstanceOf('Arrow\Ajax\ControllerError', $actual);
  }

  function test_it_will_skip_synching_unknown_attachment_id() {
    $this->controller->params = array('id' => 1000);
    $actual = $this->controller->update();
    $this->assertContains('Skipped', $actual['name']);
  }

  function test_it_will_sync_valid_attachment_id() {
    $result = array(
      'id' => '',
      'name' => 'foo',
      'thumbnail' => 'foo.jpg'
    );

    $mock = $this->getMock('WpImgur\Image\Synchronizer');
    $mock->expects($this->once())
      ->method('sync')
      ->with(10)
      ->will($this->returnValue($result));

    $this->controller->imageSynchronizer = $mock;

    $this->controller->params = array('id' => 10);
    $actual = $this->controller->update();
    $this->assertEquals($result, $actual);
  }

}
