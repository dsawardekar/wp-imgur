<?php

namespace WpImgur\Image;

use Encase\Container;

class UploaderTest extends \WP_UnitTestCase {

  public $container;
  public $pluginMeta;
  public $uploader;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->object('pluginMeta', new \WpImgur\PluginMeta('wp-imgur.php'))
      ->factory('image', 'WpImgur\Image\Image')
      ->singleton('optionsStore', 'Arrow\Options\Store')
      ->packager('imgurPackager', 'Imgur\Packager')
      ->factory('uploader', 'WpImgur\Image\Uploader');

    $this->pluginMeta = $this->lookup('pluginMeta');
    $this->image      = $this->lookup('image');
    $this->uploader   = $this->lookup('uploader');
    $this->store      = $this->lookup('optionsStore');
  }

  function lookup($key) {
    return $this->container->lookup($key);
  }

  function test_it_has_plugin_meta() {
    $this->assertSame($this->pluginMeta, $this->uploader->pluginMeta);
  }

  function test_it_has_album_id() {
    $this->store->setOption('album', 'foo');
    $this->assertEquals('foo', $this->uploader->getAlbum());
  }

  function test_it_has_upload_mode() {
    $this->store->setOption('uploadMode', 'push');
    $this->assertEquals('push', $this->uploader->getMode());
  }

  function test_it_knows_if_album_is_absent() {
    $this->assertFalse($this->uploader->hasAlbum());
  }

  function test_it_knows_if_album_is_present() {
    $this->store->setOption('album', 'foo');
    $this->assertTrue($this->uploader->hasAlbum());
  }

  function test_it_can_build_upload_params_for_push() {
    $image = $this->lookup('image');
    $image->setAttributes(array('file' => 'test/images/wordpress-logo.png'));
    $this->store->setOption('album', 'foo');
    $actual = $this->uploader->getUploadParams($image, 'file');

    $this->assertEquals('wordpress-logo.png', $actual['title']);
    $this->assertEquals('file', $actual['type']);
    $this->assertEquals('foo', $actual['album']);
  }

  function test_it_can_build_upload_params_for_pull() {
    $image = $this->lookup('image');
    $image->setAttributes(array('file' => 'test/images/wordpress-logo.png'));
    $actual = $this->uploader->getUploadParams($image, 'url');

    $this->assertEquals('wordpress-logo.png', $actual['title']);
    $this->assertEquals('url', $actual['type']);
    $this->assertNotContains('album', $actual);
  }

  function test_it_can_upload_by_push() {
    $this->container->factory('image', 'WpImgur\Image\UploadableImage');
    $image = $this->lookup('image');
    $image->setAttributes(array('file' => 'test/images/wordpress-logo.png'));

    $result = array(
      'id' => 'foo',
      'link' => 'a-link'
    );

    $mock = $this->getMock('Imgur\ImageRepo');
    $mock
      ->expects($this->once())
      ->method('create')
      ->will($this->returnValue($result));

    $this->uploader->imgurImageRepo = $mock;
    $actual = $this->uploader->uploadByPush($image);

    $this->assertEquals('a-link', $actual['link']);
  }

  function test_it_can_upload_by_pull() {
    $image = $this->lookup('image');
    $image->setAttributes(array('file' => 'test/images/wordpress-logo.png'));

    $result = array(
      'id' => 'foo',
      'link' => 'a-link'
    );

    $mock = $this->getMock('Imgur\ImageRepo');
    $mock
      ->expects($this->once())
      ->method('create')
      ->will($this->returnValue($result));

    $this->uploader->imgurImageRepo = $mock;
    $actual = $this->uploader->uploadByPull($image);

    $this->assertEquals('a-link', $actual['link']);
  }

  function test_it_will_upload_by_push_if_mode_is_push() {
    $this->container->factory('image', 'WpImgur\Image\UploadableImage');
    $image = $this->lookup('image');
    $image->setAttributes(array('file' => 'test/images/wordpress-logo.png'));

    $mock = $this->getMock('Imgur\ImageRepo');
    $mock
      ->expects($this->once())
      ->method('create')
      ->with($this->callback(function($subject) {
        return $subject['type'] === 'file';
      }));

    $this->uploader->imgurImageRepo = $mock;
    $this->uploader->upload($image);
  }

  function test_it_will_upload_by_pull_if_mode_is_pull() {
    $image = $this->lookup('image');
    $image->setAttributes(array('file' => 'test/images/wordpress-logo.png'));

    $mock = $this->getMock('Imgur\ImageRepo');
    $mock
      ->expects($this->once())
      ->method('create')
      ->with($this->callback(function($subject) {
        return $subject['type'] === 'url';
      }));

    $this->store->setOption('uploadMode', 'pull');
    $this->uploader->imgurImageRepo = $mock;
    $this->uploader->upload($image);
  }

}

class UploadableImage extends \WpImgur\Image\Image {

  function getFilepath() {
    return $this->getFilename();
  }

}
