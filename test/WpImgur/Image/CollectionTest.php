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

  function test_it_wont_find_for_standard_size_without_original() {
    $this->insertImage('foo', '1x1', 'one');
    $this->collection->load(array('foo'));

    $this->assertFalse($this->collection->hasImage('foo', '160x160'));
  }

  function test_it_will_find_for_any_standard_size_if_original_is_present() {
    $this->insertImage('foo', 'original', 'one');
    $this->collection->load(array('foo'));

    $this->assertTrue($this->collection->hasImage('foo', '90x90'));
    $this->assertTrue($this->collection->hasImage('foo', '160x160'));
    $this->assertTrue($this->collection->hasImage('foo', '320x320'));
    $this->assertTrue($this->collection->hasImage('foo', '640x640'));
    $this->assertTrue($this->collection->hasImage('foo', '1024x1024'));
  }

  function test_it_can_find_url_for_valid_image_variant() {
    $this->insertImage('foo', '1x1', 'one');
    $this->collection->load(array('foo'));

    $actual = $this->collection->getImageUrl('foo', '1x1');
    $this->assertEquals('one', $actual);
  }

  function test_it_can_find_standard_url_for_standard_sizes() {
    $this->insertImage('foo', 'original', 'http://foo.com/one.jpg');
    $this->collection->load(array('foo'));

    $url = $this->collection->getImageUrl('foo', 'original');
    $this->assertEquals('http://foo.com/one.jpg', $url);

    $url = $this->collection->getImageUrl('foo', '90x90');
    $this->assertEquals('http://foo.com/ones.jpg', $url);

    $url = $this->collection->getImageUrl('foo', '160x160');
    $this->assertEquals('http://foo.com/onet.jpg', $url);

    $url = $this->collection->getImageUrl('foo', '320x320');
    $this->assertEquals('http://foo.com/onem.jpg', $url);

    $url = $this->collection->getImageUrl('foo', '640x640');
    $this->assertEquals('http://foo.com/onel.jpg', $url);

    $url = $this->collection->getImageUrl('foo', '1024x1024');
    $this->assertEquals('http://foo.com/oneh.jpg', $url);
  }

}
