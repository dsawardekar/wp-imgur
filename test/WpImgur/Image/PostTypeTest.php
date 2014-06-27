<?php

namespace WpImgur\Image;

use Encase\Container;

class PostTypeTest extends \WP_UnitTestCase {

  public $container;
  public $postType;

  function setUp() {
    parent::setUp();

    $this->postType = new PostType();
  }

  function test_it_has_a_name() {
    $this->assertEquals('imgur_image', $this->postType->getName());
  }

  function test_it_is_not_public() {
    $options = $this->postType->getOptions();
    $this->assertFalse($options['public']);
  }

  function test_it_is_not_included_in_search() {
    $options = $this->postType->getOptions();
    $this->assertTrue($options['exclude_from_search']);
    $this->assertFalse($options['publicly_queryable']);
  }

  function test_it_does_not_have_ui() {
    $options = $this->postType->getOptions();
    $this->assertFalse($options['show_ui']);
  }

  function test_it_is_not_hierarchical() {
    $options = $this->postType->getOptions();
    $this->assertFalse($options['hierarchical']);
  }

  function test_it_does_not_rewrite_urls() {
    $options = $this->postType->getOptions();
    $this->assertFalse($options['rewrite']);
  }

  function test_it_can_be_exported() {
    $options = $this->postType->getOptions();
    $this->assertTrue($options['can_export']);
  }

  function test_it_can_be_registered() {
    $this->postType->register();
    $this->assertTrue(post_type_exists('imgur_image'));
  }

  function test_it_can_convert_post_name_to_slug() {
    $actual = $this->postType->toSlug('Hello World');
    $this->assertEquals('hello-world', $actual);
  }

  function test_it_can_convert_post_name_with_accented_characters_to_slug() {
    $actual = $this->postType->toSlug('mûr pouvait être écrit mëur');
    $this->assertEquals('m%c3%bbr-pouvait-%c3%aatre-%c3%a9crit-m%c3%abur', $actual);
  }

  function test_it_can_store_image_details() {
    $this->postType->register();

    $content = array('foo' => 'bar');
    $result = $this->postType->create('an image', $content);

    $this->assertInternalType('int', $result);
  }

  function test_it_can_find_stored_image() {
    $this->postType->register();
    $content = array(
      'sizes' => array('100x100' => 'foo')
    );
    $this->postType->create('an image', $content);

    $json = $this->postType->find('an image');

    $this->assertEquals('foo', $json['sizes']['100x100']);
  }

  function test_it_wont_find_missing_image() {
    $post = $this->postType->find('an image');
    $this->assertFalse($post);
  }

  function test_it_wont_find_anything_for_empty_post_names() {
    $this->postType->register();

    $images = $this->postType->findBy(array());
    $this->assertEquals(0, count($images));
  }

  function test_it_can_find_list_of_stored_images_by_post_names() {
    $this->postType->register();
    $this->postType->create('image 1', array('foo' => 1));
    $this->postType->create('image 2', array('foo' => 2));
    $this->postType->create('image 3', array('foo' => 3));
    $this->postType->create('image 4', array('foo' => 1));
    $this->postType->create('image 5', array('foo' => 2));
    $this->postType->create('image 6', array('foo' => 3));

    $images = $this->postType->findBy(array('image-1', 'image-2', 'image-3'));
    $this->assertEquals(3, count($images));
  }

  function test_it_can_find_list_of_stored_image_ids() {
    $this->postType->register();

    $expected = array();
    array_push($expected, $this->postType->create('image 1', array('foo' => 1)));
    array_push($expected, $this->postType->create('image 2', array('foo' => 1)));
    array_push($expected, $this->postType->create('image 3', array('foo' => 1)));
    array_push($expected, $this->postType->create('image 4', array('foo' => 1)));
    array_push($expected, $this->postType->create('image 5', array('foo' => 1)));

    $images = $this->postType->findAll();
    $this->assertEquals(5, count($images));
    $this->assertEquals($expected, $images);
  }

}
