<?php

namespace WpImgur\Image;

use Encase\Container;

class ImageStoreTest extends \WP_UnitTestCase {

  public $container;
  public $store;
  public $postType;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->factory('image', 'WpImgur\Image\Image')
      ->singleton('imagePostType', 'WpImgur\Image\PostType')
      ->factory('imageStore', 'WpImgur\Image\Store');

    $this->store = $this->container->lookup('imageStore');
    $this->postType = $this->container->lookup('imagePostType');
  }

  function lookup($key) {
    return $this->container->lookup($key);
  }

  function test_it_has_a_container() {
    $this->assertSame($this->container, $this->store->container);
  }

  function test_it_knows_if_image_of_size_is_not_stored() {
    $this->assertFalse($this->store->hasImage('100x100'));
  }

  function test_it_can_add_image_to_storage() {
    $this->store->addImage('100x200', 'imgur.com/foo');
    $this->assertTrue($this->store->hasImage('100x200'));
    $this->assertEquals('imgur.com/foo', $this->store->getImageUrl('100x200'));
  }

  function test_it_can_remove_image_from_storage() {
    $this->store->addImage('100x200', 'imgur.com/foo');
    $this->store->removeImage('100x200');
  }

  function test_it_knows_path_to_images_url() {
    $this->store->addImage('100x200', 'imgur.com/foo');
    $actual = $this->store->getImageUrl('100x200');

    $this->assertEquals('imgur.com/foo', $actual);
  }

  function test_it_has_a_slug_name() {
    $this->store->setSlug('foo');
    $this->assertEquals('foo', $this->store->getSlug());
  }

  function test_it_knows_if_not_loaded() {
    $this->assertFalse($this->store->loaded());
  }

  function test_it_knows_if_loaded() {
    $this->store->load();
    $this->assertTrue($this->store->didLoad);
  }

  function test_it_does_not_reload_if_already_loaded() {
    $this->store->load();
    $this->store->didLoad = 'already_loaded';

    $this->store->load();
    $this->assertEquals('already_loaded', $this->store->didLoad);
  }

  function test_it_can_save_image_sizes() {
    $this->store->addImage('100x100', 'foo');
    $result = $this->store->save();
    $this->assertTrue($result);
    $this->assertTrue($this->store->exists());
  }

  function test_it_wont_save_image_store_unless_changed() {
    $this->store->addImage('100x100', 'foo');
    $actual = $this->store->save();

    $this->assertTrue($actual);

    $actual = $this->store->save();
    $this->assertFalse($actual);
  }

  function test_it_can_load_stored_image_sizes() {
    $this->store->setSlug('foo');
    $this->store->addImage('100x100', 'one');
    $this->store->addImage('200x200', 'two');
    $this->store->addImage('original', 'three');
    $this->store->save();

    $this->store = $this->container->lookup('imageStore');
    $this->store->load();

    $this->assertEquals('one', $this->store->getImageUrl('100x100'));
    $this->assertEquals('two', $this->store->getImageUrl('200x200'));
    $this->assertEquals('three', $this->store->getImageUrl('original'));
  }

  function test_it_can_add_new_sizes_to_existing_storage() {
    $this->store->setSlug('foo');
    $this->store->addImage('original', 'three');
    $this->store->save();

    $this->store = $this->container->lookup('imageStore');
    $this->store->load();
    $this->assertEquals(1, $this->store->count());

    $this->store->addImage('100x100', 'one');
    $this->store->addImage('200x200', 'two');
    $this->store->save();

    $this->store = $this->container->lookup('imageStore');
    $this->store->load();

    $this->assertEquals('one', $this->store->getImageUrl('100x100'));
    $this->assertEquals('two', $this->store->getImageUrl('200x200'));
    $this->assertEquals('three', $this->store->getImageUrl('original'));
    $this->assertEquals(3, $this->store->count());

    $this->assertEquals(1, count($this->postType->findAll()));
  }

}
