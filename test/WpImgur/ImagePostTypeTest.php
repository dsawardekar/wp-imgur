<?php

namespace WpImgur;

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

}
