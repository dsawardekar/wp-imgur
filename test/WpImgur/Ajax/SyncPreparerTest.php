<?php

namespace WpImgur\Ajax;

use Encase\Container;

class SyncPreparerTest extends \WP_UnitTestCase {

  public $container;
  public $preparer;
  public $pluginMeta;
  public $store;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->object('pluginMeta', new \WpImgur\PluginMeta('wp-imgur.php'))
      ->singleton('optionsStore', 'Arrow\Options\Store')
      ->factory('syncPreparer', 'WpImgur\Ajax\SyncPreparer')
      ->packager('imgurPackager', 'Imgur\Packager');

    $this->pluginMeta = $this->container->lookup('pluginMeta');
    $this->store      = $this->container->lookup('optionsStore');
    $this->imageRepo  = $this->container->lookup('imgurImageRepo');
    $this->albumRepo  = $this->container->lookup('imgurAlbumRepo');
    $this->preparer   = $this->container->lookup('syncPreparer');
  }

  function test_it_has_plugin_meta() {
    $this->assertSame($this->pluginMeta, $this->preparer->pluginMeta);
  }

  function test_it_has_options_store() {
    $this->assertInstanceOf('Arrow\Options\Store', $this->preparer->optionsStore);
  }

  function test_it_has_image_repo() {
    $this->assertSame($this->imageRepo, $this->preparer->imgurImageRepo);
  }

  function test_it_has_album_repo() {
    $this->assertSame($this->albumRepo, $this->preparer->imgurAlbumRepo);
  }

  function test_it_knows_if_album_does_not_exist() {
    $this->store->setOption('album', 'foo');
    $repo = $this->getMock('Imgur\AlbumRepo');
    $repo->expects($this->once())
      ->method('find')
      ->with('foo')
      ->will($this->throwException(new \Imgur\Exception('Unable to find album with id, foo')));

    $this->preparer->imgurAlbumRepo = $repo;
    $actual = $this->preparer->albumExists();

    $this->assertFalse($actual);
  }

  function test_it_knows_if_album_exists() {
    $this->store->setOption('album', 'foo');
    $repo = $this->getMock('Imgur\AlbumRepo');
    $repo->expects($this->once())
      ->method('find')
      ->with('foo')
      ->will($this->returnValue(array('id' => 'foo', 'title' => 'foo-album')));

    $this->preparer->imgurAlbumRepo = $repo;
    $actual = $this->preparer->albumExists();

    $this->assertTrue($actual);
  }

  function test_it_creates_album_if_absent() {
    $album = array('id' => 'foo', 'title' => site_url());
    $mock = $this->getMock('Imgur\AlbumRepo');
    $mock
      ->expects($this->once())
      ->method('create')
      ->with($this->callback(function($subject) {
        return $subject['title'] === site_url();
      }))
      ->will($this->returnValue($album));

    $this->preparer->imgurAlbumRepo = $mock;
    $actual = $this->preparer->createAlbum();

    $this->assertTrue($actual);
    $this->assertEquals('foo', $this->store->getOption('album'));
  }

  function test_it_does_not_create_album_if_present() {
    $this->store->setOption('album', 'foo');
    $album = array('id' => 'foo', 'title' => site_url());
    $mock = $this->getMock('Imgur\AlbumRepo');
    $mock->expects($this->once())
      ->method('find')
      ->with('foo')
      ->will($this->returnValue($album));

    $this->preparer->imgurAlbumRepo = $mock;
    $actual = $this->preparer->createAlbum();

    $this->assertFalse($actual);
  }

  function test_it_will_use_push_mode_if_upload_fails() {
    $mock = $this->getMock('Imgur\ImageRepo');
    $mock
      ->expects($this->once())
      ->method('create')
      ->with($this->callback(function($subject) {
        return $subject['type'] === 'url';
      }))
      ->will($this->throwException(new \Imgur\Exception('Failed to upload')));

    $this->preparer->imgurImageRepo = $mock;
    $actual = $this->preparer->detectUploadMode();

    $this->assertEquals('push', $this->store->getOption('uploadMode'));
  }

  function test_it_will_use_pull_mode_if_upload_succeeds() {
    $image = array(
      'id' => 'foo',
      'deletehash' => 'foo'
    );

    $mock = $this->getMock('Imgur\ImageRepo');
    $mock
      ->expects($this->once())
      ->method('create')
      ->will($this->returnValue($image));

    $mock
      ->expects($this->once())
      ->method('delete')
      ->will($this->returnValue(true));

    $this->preparer->imgurImageRepo = $mock;
    $actual = $this->preparer->detectUploadMode();

    $this->assertEquals('pull', $this->store->getOption('uploadMode'));
  }

  function test_it_can_prepare_env_for_sync() {
    $album = array('id' => 'an-album', 'title' => site_url());
    $image = array(
      'id' => 'foo',
      'deletehash' => 'foo'
    );

    $albumRepoMock = $this->getMock('Imgur\AlbumRepo');
    $albumRepoMock
      ->expects($this->once())
      ->method('create')
      ->with($this->callback(function($subject) {
        return $subject['title'] === site_url();
      }))
      ->will($this->returnValue($album));

    $imageRepoMock = $this->getMock('Imgur\ImageRepo');
    $imageRepoMock
      ->expects($this->once())
      ->method('create')
      ->will($this->returnValue($image));

    $imageRepoMock
      ->expects($this->once())
      ->method('delete')
      ->will($this->returnValue(true));

    $this->preparer->imgurImageRepo = $imageRepoMock;
    $this->preparer->imgurAlbumRepo = $albumRepoMock;

    $this->preparer->prepare();

    $this->container->singleton('optionsStore', 'Arrow\Options\Store');
    $store = $this->container->lookup('optionsStore');
    $store->load();

    $this->assertEquals('an-album', $store->getOption('album'));
    $this->assertEquals('pull', $store->getOption('uploadMode'));
  }

}
