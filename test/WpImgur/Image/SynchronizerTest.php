<?php

namespace WpImgur\Image;

use Encase\Container;

class SynchronizerTest extends \WP_UnitTestCase {

  public $container;
  public $printer;
  public $uploader;
  public $syncer;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->object('pluginMeta', new \WpImgur\PluginMeta('my-plugin.php'))
      ->packager('optionsPackager', 'Arrow\Options\Packager')
      ->factory('image', 'WpImgur\Image\Image')
      ->factory('syncImage', 'WpImgur\Image\SyncImage')
      ->factory('imageStore', 'WpImgur\Image\Store')
      ->singleton('imagePostType', 'WpImgur\Image\PostType')
      ->singleton('attachmentPostType', 'WpImgur\Attachment\PostType')
      ->singleton('imageUploader', 'WpImgur\Image\SyncUploader')
      ->singleton('ajaxJsonPrinter', 'WpImgur\Image\SyncPrinter')
      ->factory('imageSynchronizer', 'WpImgur\Image\Synchronizer');

    $this->uploader = $this->container->lookup('imageUploader');
    $this->printer  = $this->container->lookup('ajaxJsonPrinter');
    $this->syncer   = $this->container->lookup('imageSynchronizer');
  }

  function getImageData() {
    return array(
      'width' => 2400,
      'height' => 1500,
      'file' => '2012/12/foo.jpg',
      'sizes' => array(
        'thumbnail' => array(
          'file' => 'foo-150x150.jpg',
          'width' => 150,
          'height' => 150,
          'mime-type' => 'image/jpeg'
        ),
        'medium' => array(
          'file' => 'foo-300x194.jpg',
          'width' => 300,
          'height' => 194,
          'mime-type' => 'image/jpeg'
        ),
        'large' => array(
          'file' => 'foo-1024x665.jpg',
          'width' => 1024,
          'height' => 665,
          'mime-type' => 'image/jpeg'
        ),
        'post-thumbnail' => array(
          'file' => 'foo-624x405.jpg',
          'width' => 624,
          'height' => 405,
          'mime-type' => 'image/jpeg'
        ),
      ),
      'image_meta' => array(
        'aperture' => 5,
        'credit' => 'foo',
        'title' => 'bar'
      )
    );
  }

  function setUpAttachment($title = 'foo') {
    $attachment = $this->factory->post->create_and_get(
      array(
        'post_title' => $title,
        'post_type' => 'attachment'
      )
    );

    $id = $attachment->ID;
    wp_update_attachment_metadata($id, $this->getImageData());

    return $id;
  }

  function lookup($key) {
    return $this->container->lookup($key);
  }

  function test_it_has_a_container() {
    $this->assertSame($this->container, $this->syncer->container);
  }

  function test_it_has_attachment_post_type() {
    $this->assertNotNull($this->syncer->attachmentPostType);
  }

  function test_it_has_an_image_uploader() {
    $this->assertNotNull($this->syncer->imageUploader);
  }

  function test_it_has_an_ajax_json_printer() {
    $this->assertNotNull($this->syncer->ajaxJsonPrinter);
  }

  function test_it_can_find_images_for_attachment() {
    $id = $this->setUpAttachment();
    $images = $this->syncer->imagesForAttachment($id);
    $this->assertEquals(5, count($images));
  }

  function test_it_wont_find_images_for_unknown_attachment() {
    $images = $this->syncer->imagesForAttachment(1000);
    $this->assertEquals(0, count($images));
  }

  function test_it_knows_slug_for_image() {
    $image = $this->lookup('image');
    $image->setAttributes(array('file' => 'test/foo.jpg'));
    $this->assertEquals('foo.jpg', $this->syncer->slugForImage($image));
  }

  function test_it_can_load_images_for_slug() {
    $store = $this->lookup('imageStore');
    $store->setSlug('foo-jpg');
    $store->addImage('100x100', 'one');
    $store->addImage('200x200', 'two');
    $store->addImage('original', 'three');
    $store->save();

    $store = $this->syncer->imageStoreFor('foo-jpg');
    $this->assertEquals(3, $store->count());
  }

  function test_it_can_load_images_for_empty_store() {
    $store = $this->syncer->imageStoreFor('foo-jpg');
    $this->assertEquals(0, $store->count());
  }

  function test_it_knows_that_imgur_url_does_not_exist() {
    if (!defined('TRAVIS')) return;
    $url = 'http://imgur.com/no_such_url_here.jpg';
    $this->assertFalse($this->syncer->imageUrlExists($url));
  }

  function test_it_knows_that_imgur_url_exists() {
    if (!defined('TRAVIS')) return;
    $url = 'http://imgur.com/Q3cUg29';
    $this->assertTrue($this->syncer->imageUrlExists($url));
  }

  function test_it_wont_upload_invalid_image() {
    $image = $this->lookup('image');
    $image->setAttributes(array(
      'file' => 'foo'
    ));

    $actual = $this->syncer->uploadImage($image);
    $this->assertFalse($actual);
  }

  function test_it_wont_upload_standard_size_image() {
    $image = $this->lookup('syncImage');
    $image->setAttributes(array(
      'file' => 'foo',
      'width' => 90,
      'height' => 90
    ));

    $actual = $this->syncer->uploadImage($image);
    $this->assertFalse($actual);
  }

  function test_it_will_upload_original_image() {
    $parent = $this->lookup('syncImage');
    $parent->setAttributes(array(
      'file' => 'foo',
      'width' => 1000,
      'height' => 1000
    ));

    $image = $this->lookup('syncImage');
    $image->setAttributes(array(
      'file' => 'bar',
      'width' => 200,
      'height' => 200
    ));
    $image->setParent($parent);

    $this->uploader->result = array(
      'id' => 'foo-uploaded',
      'link' => 'foo-link'
    );

    $actual = $this->syncer->uploadImage($image);
    $this->assertEquals('foo-uploaded', $actual['id']);
    $this->assertEquals('foo-link', $actual['link']);
  }

  function test_it_sends_upload_exception_to_printer() {
    $this->uploader->error = 'Foo failed.';
    $image = $this->lookup('syncImage');
    $image->setAttributes(array(
      'file' => 'foo',
      'width' => 91,
      'height' => 92
    ));

    $actual = $this->syncer->uploadAndSave($image, null);
    $this->assertContains('Foo failed', $this->printer->error);
  }

  function test_it_will_not_send_upload_exception_to_printer_if_in_hook_mode() {
    $this->uploader->error = 'Foo failed.';
    $image = $this->lookup('syncImage');
    $image->setAttributes(array(
      'file' => 'foo',
      'width' => 91,
      'height' => 92
    ));

    $this->syncer->hookMode = true;
    $actual = $this->syncer->uploadAndSave($image, null);
    $this->assertNull($this->printer->error);
    $this->assertNull($actual);
  }

  function test_it_will_return_null_link_for_non_uploaded_images() {
    $image = $this->lookup('image');
    $image->setAttributes(array(
      'file' => 'foo',
      'width' => 91,
      'height' => 92
    ));

    $actual = $this->syncer->uploadAndSave($image, null);
    $this->assertNull($actual);
  }

  function test_it_will_add_link_to_image_store_on_upload() {
    $this->uploader->result = array('link' => 'foo-link');
    $image = $this->lookup('syncImage');
    $image->setAttributes(array(
      'file' => 'foo',
      'width' => 91,
      'height' => 92
    ));

    $store = $this->lookup('imageStore');
    $store->setSlug('foo');

    $actual = $this->syncer->uploadAndSave($image, $store);
    $this->assertEquals('foo-link', $store->getImageUrl('91x92'));
  }

  function test_it_can_sync_image_if_absent() {
    $this->uploader->result = array('link' => 'foo-link');
    $image = $this->lookup('syncImage');
    $image->setAttributes(array(
      'file' => 'foo',
      'width' => 91,
      'height' => 92
    ));

    $store = $this->lookup('imageStore');
    $store->setSlug('foo');

    $actual = $this->syncer->syncImage($image, $store);
    $this->assertEquals('foo-link', $store->getImageUrl('91x92'));
  }

  function test_it_can_sync_image_if_link_is_broken() {
    $this->uploader->result = array('link' => 'foo-link');
    $image = $this->lookup('syncImage');
    $image->setAttributes(array(
      'file' => 'foo',
      'width' => 91,
      'height' => 92
    ));

    $store = $this->lookup('imageStore');
    $store->setSlug('foo');
    $store->addImage('91x92', 'unknown');

    $actual = $this->syncer->syncImage($image, $store);
    $this->assertEquals('foo-link', $store->getImageUrl('91x92'));
  }

  function test_it_returns_existing_image_url_if_image_is_in_sync() {
    $this->uploader->result = array('link' => 'foo-link');
    $image = $this->lookup('syncImage');
    $image->setAttributes(array(
      'file' => 'foo',
      'width' => 91,
      'height' => 92
    ));

    $dummyImageUrl = 'http://i.imgur.com/Q3cUg29s.gif';
    $store = $this->getMock('WpImgur\Image\Store');
    $store->expects($this->exactly(2))
      ->method('getImageUrl')
      ->with('91x92')
      ->will($this->returnValue($dummyImageUrl));

    $store->expects($this->once())
      ->method('hasImage')
      ->will($this->returnValue(true));

    $actual = $this->syncer->syncImage($image, $store);
    $this->assertEquals($dummyImageUrl, $actual);
  }

  function test_it_will_return_image_url_as_is_if_present() {
    if (!defined('TRAVIS')) return;
    $this->uploader->result = array('link' => 'foo-link');
    $image = $this->lookup('syncImage');
    $image->setAttributes(array(
      'file' => 'foo',
      'width' => 91,
      'height' => 92
    ));

    $store = $this->lookup('imageStore');
    $store->setSlug('foo');
    $store->addImage('91x92', 'http://imgur.com/Q3cUg29');

    $actual = $this->syncer->syncImage($image, $store);
    $this->assertEquals('http://imgur.com/Q3cUg29', $store->getImageUrl('91x92'));
  }

  /* integration tests */
  function test_it_can_sync_images_for_attachment() {
    $id = $this->setUpAttachment();
    $this->container->factory('image', 'WpImgur\Image\SyncImage');
    $this->uploader->result = 'mirror';

    $actual = $this->syncer->sync($id);
    $this->assertEquals('foo.jpg', $actual['name']);
    $this->assertStringEndsWith('foo-150x150.jpg', $actual['thumbnail']);
  }

  function test_it_can_sync_image_after_upload() {
    $this->container->factory('image', 'WpImgur\Image\SyncImage');
    $id = $this->setUpAttachment();
    $this->uploader->result = 'mirror';

    $this->syncer->enable();
    do_action('added_post_meta', 100, $id, '_wp_attachment_metadata', 'foo');

    $store = $this->lookup('imageStore');
    $store->setSlug('foo-jpg');
    $store->load();

    $this->assertTrue($store->hasImage('original'));
    $this->assertTrue($store->hasImage('150x150'));
    $this->assertTrue($store->hasImage('300x194'));
    $this->assertTrue($store->hasImage('1024x665'));
    $this->assertTrue($store->hasImage('624x405'));
  }

  function test_it_will_not_sync_image_after_upload_if_disabled() {
    $optionsStore = $this->container->lookup('optionsStore');
    $optionsStore->setOption('syncOnMediaUpload', false);

    $this->container->factory('image', 'WpImgur\Image\SyncImage');
    $id = $this->setUpAttachment();
    $this->uploader->result = 'mirror';

    $this->syncer->enable();
    do_action('added_post_meta', 100, $id, '_wp_attachment_metadata', 'foo');

    $store = $this->lookup('imageStore');
    $store->setSlug('foo-jpg');
    $store->load();

    $this->assertFalse($store->hasImage('original'));
  }

  function test_it_can_sync_image_after_edit() {
    $this->container->factory('image', 'WpImgur\Image\SyncImage');
    $id = $this->setUpAttachment();
    $this->uploader->result = 'mirror';

    $this->syncer->enable();
    do_action('updated_post_meta', 100, $id, '_wp_attachment_metadata', 'foo');

    $store = $this->lookup('imageStore');
    $store->setSlug('foo-jpg');
    $store->load();

    $this->assertTrue($store->hasImage('original'));
    $this->assertTrue($store->hasImage('150x150'));
    $this->assertTrue($store->hasImage('300x194'));
    $this->assertTrue($store->hasImage('1024x665'));
    $this->assertTrue($store->hasImage('624x405'));
  }

  function test_it_will_not_sync_image_after_edit_if_disabled() {
    $optionsStore = $this->container->lookup('optionsStore');
    $optionsStore->setOption('syncOnMediaEdit', false);

    $this->container->factory('image', 'WpImgur\Image\SyncImage');
    $id = $this->setUpAttachment();
    $this->uploader->result = 'mirror';

    $this->syncer->enable();
    do_action('updated_post_meta', 100, $id, '_wp_attachment_metadata', 'foo');

    $store = $this->lookup('imageStore');
    $store->setSlug('foo-jpg');
    $store->load();

    $this->assertFalse($store->hasImage('original'));
  }

}

class SyncPrinter {

  public $success;
  public $error;

  function sendSuccess($data, $statusCode = 200) {
    $this->success = $data;
  }

  function sendError($data, $statusCode = 404) {
    $this->error = $data;
  }

}

class SyncUploader {

  public $image;
  public $result;
  public $error;

  function upload($image) {
    if (!is_null($this->error)) {
      throw new \Imgur\Exception($this->error);
    }

    if ($this->result === 'mirror') {
      return array('link' => $image->getUrl());
    }

    $this->image = $image;
    return $this->result;
  }

}

class SyncImage extends \WpImgur\Image\Image {

  function fileExists() {
    return true;
  }

}
