<?php

namespace WpImgur\Image;

use Encase\Container;

class SrcReplacerTest extends \WP_UnitTestCase {

  public $container;
  public $replacer;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->factory('imageSrcReplacer', 'WpImgur\Image\SrcReplacer')
      ->factory('imageCollection', 'WpImgur\Image\Collection')
      ->factory('imageStore', 'WpImgur\Image\Store')
      ->singleton('imagePostType', 'WpImgur\Image\PostType');

    $this->replacer = $this->container->lookup('imageSrcReplacer');
  }

  function test_it_has_a_container() {
    $this->assertSame($this->container, $this->replacer->container);
  }

  function test_it_knows_valid_replaceable_prefix() {
    $actual = $this->replacer->replaceablePrefix();
    $expected = wp_upload_dir()['baseurl'];
    $this->assertStringStartsWith($expected, $actual);
  }

  function test_it_knows_if_src_is_not_replaceable() {
    $src = 'http://foo.com';
    $actual = $this->replacer->replaceable($src);
    $this->assertFalse($actual);
  }

  function test_it_knows_if_src_is_replaceable() {
    $src = site_url() . '/wp-content/uploads/foo.jpg';
    $actual = $this->replacer->replaceable($src);
    $this->assertTrue($actual);
  }

  function test_it_can_build_list_of_slugs_from_invalid_content() {
    $html  = "<img src='lorem.jpg'>";
    $html .= "<img src='ipsum.jpg'>";
    $html .= "<img src='dolor.jpg'>";

    $this->replacer->scan($html);

    $this->assertFalse($this->replacer->hasSlugs());
  }

  function test_it_can_build_list_of_slugs_from_valid_content() {
    $prefix = site_url() . '/wp-content/uploads';
    $html  = "<img src='$prefix/lorem.jpg'>";
    $html .= "<img src='$prefix/ipsum.jpg'>";
    $html .= "<img src='$prefix/dolor.jpg'>";

    $this->replacer->scan($html);

    $this->assertTrue($this->replacer->hasSlugs());
    $this->assertEquals(array('lorem.jpg', 'ipsum.jpg', 'dolor.jpg'), $this->replacer->getSlugs());
  }

  function test_it_can_fetch_missing_images_for_slugs() {
    $this->replacer->fetch(array());
    $this->assertEquals(0, $this->replacer->imageCollection->count());
  }

  function insertImage($slug, $size, $url) {
    $imageStore = $this->container->lookup('imageStore');
    $imageStore->setSlug($slug);
    $imageStore->addImage($size, $url);
    $imageStore->save();
  }

  function test_it_can_fetch_images_for_slugs() {
    $this->insertImage('lorem', '1x1', 'one');
    $this->insertImage('ipsum', '1x1', 'two');
    $this->insertImage('dolor', '1x1', 'three');

    $this->replacer->fetch(array('lorem', 'ipsum', 'dolor'));
    $this->assertEquals(3, $this->replacer->imageCollection->count());
  }

  function test_it_can_find_variant_for_original_src() {
    $src = site_url() . '/wp-content/uploads/foo.jpg';
    $variant = $this->replacer->variantFor($src);

    $this->assertEquals('original', $variant['size']);
    $this->assertEquals('foo.jpg', $variant['slug']);
  }

  function test_it_can_find_variant_for_src_with_variant() {
    $src = site_url() . '/wp-content/uploads/foo-10x20.jpg';
    $variant = $this->replacer->variantFor($src);

    $this->assertEquals('10x20', $variant['size']);
    $this->assertEquals('foo.jpg', $variant['slug']);
  }

  function test_it_can_find_variant_for_src_with_duplicate_variant() {
    $src = site_url() . '/wp-content/uploads/foo-100x200-30x50.jpg';
    $variant = $this->replacer->variantFor($src);

    $this->assertEquals('30x50', $variant['size']);
    $this->assertEquals('foo-100x200.jpg', $variant['slug']);
  }

  /* integration tests */
  function test_it_can_replace_content_without_images() {
    $html = 'foo';
    $actual = $this->replacer->replace($html);
    $this->assertEquals('foo', $actual);
    $this->assertFalse($this->replacer->replaced());
  }

  function test_it_can_replace_content_with_only_external_images() {
    $html  = "<img src='lorem.jpg'>";
    $html .= "<img src='ipsum.jpg'>";
    $html .= "<img src='dolor.jpg'>";

    $actual = $this->replacer->replace($html);
    $this->assertEquals($html, $actual);
    $this->assertFalse($this->replacer->replaced());
  }

  function test_it_can_replace_content_with_valid_images_without_storage() {
    $prefix = site_url() . '/wp-content/uploads';
    $html  = "<img src='$prefix/lorem.jpg'>";
    $html .= "<img src='$prefix/ipsum.jpg'>";
    $html .= "<img src='$prefix/dolor.jpg'>";

    $actual = $this->replacer->replace($html);
    $this->assertEquals($html, $actual);
    $this->assertFalse($this->replacer->replaced());
  }

  function test_it_can_replace_content_with_valid_images_with_stored_originals() {
    $prefix = site_url() . '/wp-content/uploads';
    $html  = "<img src='$prefix/lorem.jpg'>";
    $html .= "<img src='$prefix/ipsum.jpg'>";
    $html .= "<img src='$prefix/dolor.jpg'>";

    $this->insertImage('lorem-jpg', 'original', 'lorem-replaced');
    $this->insertImage('ipsum-jpg', 'original', 'ipsum-replaced');
    $this->insertImage('dolor-jpg', 'original', 'dolor-replaced');

    $expected  = "<img src='lorem-replaced'>";
    $expected .= "<img src='ipsum-replaced'>";
    $expected .= "<img src='dolor-replaced'>";

    $actual = $this->replacer->replace($html);
    $this->assertEquals($expected, $actual);
    $this->assertTrue($this->replacer->replaced());
  }

  function test_it_can_replace_content_with_mixed_images() {
    $prefix = site_url() . '/wp-content/uploads';
    $html  = "<img src='$prefix/lorem.jpg'>";
    $html .= "<img src='ipsum.png'>";
    $html .= "<img src='http://foo.com/bar.gif'>";

    $this->insertImage('lorem-jpg', 'original', 'lorem-replaced');

    $expected  = "<img src='lorem-replaced'>";
    $expected .= "<img src='ipsum.png'>";
    $expected .= "<img src='http://foo.com/bar.gif'>";

    $actual = $this->replacer->replace($html);
    $this->assertEquals($expected, $actual);
    $this->assertTrue($this->replacer->replaced());
  }

  function test_it_can_replace_content_with_multiple_variants() {
    $prefix = site_url() . '/wp-content/uploads';
    $html  = "<img src='$prefix/lorem.jpg'>";
    $html .= "<img src='$prefix/lorem-10x20.jpg'>";
    $html .= "<img src='$prefix/lorem-30x40.jpg'>";
    $html .= "<img src='$prefix/lorem-50x60.jpg'>";

    $imageStore = $this->container->lookup('imageStore');
    $imageStore->setSlug('lorem-jpg');
    $imageStore->addImage('original', 'lorem-original');
    $imageStore->addImage('10x20', 'lorem-10x20-r');
    $imageStore->addImage('30x40', 'lorem-30x40-r');
    $imageStore->addImage('50x60', 'lorem-50x60-r');
    $imageStore->save();

    $expected  = "<img src='lorem-original'>";
    $expected .= "<img src='lorem-10x20-r'>";
    $expected .= "<img src='lorem-30x40-r'>";
    $expected .= "<img src='lorem-50x60-r'>";

    $actual = $this->replacer->replace($html);
    $this->assertEquals($expected, $actual);
    $this->assertTrue($this->replacer->replaced());
  }
}
