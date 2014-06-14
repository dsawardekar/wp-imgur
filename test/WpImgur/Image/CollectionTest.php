<?php

namespace WpImgur\Image;

use Encase\Container;

class CollectionTest extends \WP_UnitTestCase {

  public $container;
  public $postType;
  public $collection;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->factory('imageStore', 'WpImgur\Image\Store')
      ->singleton('imagePostType', 'WpImgur\Image\PostType')
      ->factory('imageCollection', 'WpImgur\Image\Collection');

    $this->postType = $this->container->lookup('imagePostType');
    $this->collection = $this->container->lookup('imageCollection');
  }

  function test_it_has_an_image_post_type() {
    $this->assertSame($this->postType, $this->collection->imagePostType);
  }

  function test_it_knows_if_not_loaded() {
    $this->assertFalse($this->collection->loaded());
  }

  function test_it_knows_if_loaded() {
    $this->collection->load(array('foo'));
    $this->assertTrue($this->collection->loaded());
  }

  function test_it_does_not_reload_if_already_loaded() {
    $this->collection->load(array('foo'));
    $this->collection->didLoad = 'already_loaded';

    $this->collection->load(array('foo'));
    $this->assertEquals('already_loaded', $this->collection->didLoad);
  }

  function test_it_can_build_slug_from_post_name() {
    $actual = $this->collection->toSlug('foo.bar');
    $this->assertEquals('foo-bar', $actual);
  }

  function insertImage($slug, $size, $url) {
    $imageStore = $this->container->lookup('imageStore');
    $imageStore->setSlug($slug);
    $imageStore->addImage($size, $url);
    $imageStore->save();
  }

  function test_it_can_fetch_imgur_image_posts() {
    $this->insertImage('foo', '1x1', 'one');
    $this->insertImage('bar', '2x2', 'two');

    $this->collection->load(array('foo', 'bar'));
    $this->assertEquals(2, $this->collection->count());
  }

  function test_it_knows_if_image_is_stored_in_db() {
    $this->insertImage('foo', '1x1', 'one');
    $actual = $this->collection->load(array('foo'));

    $actual = $this->collection->hasImage('foo', '1x1');
    $this->assertTrue($actual);
  }

  function test_it_knows_if_image_belongs_to_unknown_slug() {
    $this->collection->load(array('foo'));
    $actual = $this->collection->hasImage('foo', '1x1');
    $this->assertFalse($actual);
  }

  function test_it_knows_if_image_size_is_absent() {
    $this->insertImage('foo', '1x1', 'one');
    $this->collection->load(array('foo'));

    $actual = $this->collection->hasImage('foo', '2x2');
    $this->assertFalse($actual);
  }

  function test_it_can_find_url_for_valid_image_variant() {
    $this->insertImage('foo', '1x1', 'one');
    $this->collection->load(array('foo'));

    $actual = $this->collection->getImageUrl('foo', '1x1');
    $this->assertEquals('one', $actual);
  }

}
