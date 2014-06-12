<?php

namespace WpImgur\Models;

use Encase\Container;

class ImageTest extends \WP_UnitTestCase {

  public $container;
  public $image;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->factory('image', 'WpImgur\Models\Image');

    $this->image = $this->container->lookup('image');
  }

  function test_it_stores_image_attributes() {
    $attr = array('file' => 'foo');
    $this->image->setAttributes($attr);

    $this->assertEquals($attr, $this->image->getAttributes());
  }

  function test_it_stores_image_kind() {
    $this->image->setKind('original');
    $this->assertEquals('original', $this->image->getKind());
  }

  function test_it_has_standard_image_sizes() {
    $sizes = Image::$standardSizes;

    $this->assertEquals('s', $sizes['90x90']);
    $this->assertEquals('t', $sizes['160x160']);
    $this->assertEquals('m', $sizes['320x320']);
    $this->assertEquals('l', $sizes['640x640']);
    $this->assertEquals('h', $sizes['1024x1024']);
  }

  function test_it_stores_parent() {
    $image = $this->container->lookup('image');
    $this->image->setParent($image);

    $this->assertSame($image, $this->image->getParent());
  }

  function test_it_stores_image_meta() {
    $meta = array('foo' => 'bar');
    $this->image->setMeta($meta);

    $this->assertEquals($meta, $this->image->getMeta());
  }

  function test_it_knows_its_width() {
    $attr = array('width' => 100);
    $this->image->setAttributes($attr);

    $this->assertEquals(100, $this->image->getWidth());
  }

  function test_it_knows_its_height() {
    $attr = array('height' => 100);
    $this->image->setAttributes($attr);

    $this->assertEquals(100, $this->image->getHeight());
  }

  function test_it_knows_its_size() {
    $attr = array('width' => 100, 'height' => 200);
    $this->image->setAttributes($attr);

    $this->assertEquals('100x200', $this->image->getSize());
  }

  function test_it_knows_its_mime_type() {
    $attr = array('mime-type' => 'image/jpeg');
    $this->image->setAttributes($attr);

    $this->assertEquals('image/jpeg', $this->image->getMimeType());
  }

  function test_it_knows_its_filename() {
    $attr = array('file' => 'foo.jpg');
    $this->image->setAttributes($attr);

    $this->assertEquals('foo.jpg', $this->image->getFilename());
  }

  function test_it_knows_if_image_is_not_custom_size() {
    $attr = array(
      'width' => 165,
      'height' => 166
    );

    $this->image->setAttributes($attr);
    $this->assertFalse($this->image->isCustomSize());
  }

  function test_it_knows_if_image_is_custom_size() {
    $attr = array(
      'width' => 160,
      'height' => 160
    );

    $this->image->setAttributes($attr);
    $this->assertTrue($this->image->isCustomSize());
  }

  function test_it_knows_if_image_is_original() {
    $this->image->setKind('original');
    $this->assertTrue($this->image->isOriginal());
  }

  function test_it_knows_if_image_is_not_original() {
    $this->image->setKind('thumbnail');
    $this->assertFalse($this->image->isOriginal());
  }

  function test_it_knows_if_it_does_not_have_parent() {
    $this->assertFalse($this->image->hasParent());
  }

  function test_it_knows_if_it_has_parent() {
    $image = $this->container->lookup('image');
    $this->image->setParent($image);

    $this->assertTrue($this->image->hasParent());
  }

  function test_it_has_filepath_with_parent_image() {
    $image = $this->container->lookup('image');
    $image->setAttributes(array(
      'file' => '2011/12/parent.jpg'
    ));

    $this->image->setParent($image);
    $this->image->setAttributes(array(
      'file' => 'child.jpg'
    ));

    $actual = $this->image->getFilepath();
    $expected = '/uploads/2011/12/child.jpg';

    $this->assertStringEndsWith($expected, $actual);
  }

  function test_it_has_filepath_without_parent_image() {
    $this->image->setAttributes(array(
      'file' => 'foo.jpg'
    ));

    $actual   = $this->image->getFilepath();
    $expected = '/uploads/foo.jpg';

    $this->assertStringEndsWith($expected, $actual);
  }

  function test_it_knows_if_file_does_not_exist() {
    $this->image->setAttributes(array(
      'file' => 'foo.jpg'
    ));

    $this->assertFalse($this->image->fileExists());
  }

  function test_it_has_image_url_with_parent_image() {
    $image = $this->container->lookup('image');
    $image->setAttributes(array(
      'file' => '2011/12/parent.jpg'
    ));

    $this->image->setParent($image);
    $this->image->setAttributes(array(
      'file' => 'child.jpg'
    ));

    $actual = $this->image->getUrl();
    $expected = '/uploads/2011/12/child.jpg';

    $this->assertStringEndsWith($expected, $actual);
  }

  function test_it_has_url_without_parent_image() {
    $this->image->setAttributes(array(
      'file' => 'foo.jpg'
    ));

    $actual   = $this->image->getUrl();
    $expected = '/uploads/foo.jpg';

    $this->assertStringEndsWith($expected, $actual);
  }

  function test_it_has_correct_url_for_image_with_parent_without_date_subdirs() {
    $image = $this->container->lookup('image');
    $image->setAttributes(array(
      'file' => 'parent.jpg'
    ));

    $this->image->setParent($image);
    $this->image->setAttributes(array(
      'file' => 'child.jpg'
    ));

    $actual = $this->image->getUrl();
    $expected = '/uploads/child.jpg';

    $this->assertStringEndsWith($expected, $actual);
  }
}
