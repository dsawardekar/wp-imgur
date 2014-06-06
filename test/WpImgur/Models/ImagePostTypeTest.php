<?php

namespace WpImgur\Models;

class ImagePostTypeTest extends \WP_UnitTestCase {

  public $postType;

  function setUp() {
    parent::setUp();

    $this->postType = new ImagePostType();
  }

  function test_it_has_a_name() {
    $this->assertEquals('imgur_image', $this->postType->getName());
  }

  function test_it_is_not_public() {
    $this->assertFalse($this->postType->getOptions()['public']);
  }

  function test_it_is_not_included_in_search() {
    $this->assertTrue($this->postType->getOptions()['exclude_from_search']);
    $this->assertFalse($this->postType->getOptions()['publicly_queryable']);
  }

  function test_it_does_not_have_ui() {
    $this->assertFalse($this->postType->getOptions()['show_ui']);
  }

  function test_it_is_not_hierarchical() {
    $this->assertFalse($this->postType->getOptions()['hierarchical']);
  }

  function test_it_does_not_rewrite_urls() {
    $this->assertFalse($this->postType->getOptions()['rewrite']);
  }

  function test_it_can_be_exported() {
    $this->assertTrue($this->postType->getOptions()['can_export']);
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
    $content = array('foo' => 'bar');
    $this->postType->create('an image', $content);

    $image = $this->postType->find('an image');
    $json = $image->post_content;

    $this->assertEquals(json_decode($json, true), $content);
  }

  function test_it_wont_find_missing_image() {
    $post = $this->postType->find('an image');
    $this->assertFalse($post);
  }

  function test_it_can_find_list_of_stored_images_by_post_names() {
    $this->postType->register();
    $this->postType->create('image 1', array('foo' => 1));
    $this->postType->create('image 2', array('foo' => 2));
    $this->postType->create('image 3', array('foo' => 3));

    $images = $this->postType->findBy(array('image-1', 'image-2', 'image-3'));
    $this->assertEquals(3, count($images));
  }

  function test_it_can_find_media_attachment_images() {
    $meta = array(
      'post_mime_type' => 'image/jpeg',
      'post_type' => 'attachment'
    );
    $this->factory->attachment->create_object('image-1', 1, $meta);
    $this->factory->attachment->create_object('image-2', 2, $meta);
    $this->factory->attachment->create_object('image-3', 3, $meta);

    $images = $this->postType->findImages();
    $this->assertEquals(3, count($images));
  }

}
