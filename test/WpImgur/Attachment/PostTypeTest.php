<?php

namespace WpImgur\Attachment;

use Encase\Container;

class PostTypeTest extends \WP_UnitTestCase {

  public $container;
  public $postType;
  public $store;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->factory('image', 'WpImgur\Image\Image')
      ->singleton('imageStore', 'WpImgur\Image\Store')
      ->singleton('attachmentPostType', 'WpImgur\Attachment\PostType');

    $this->postType = $this->container->lookup('attachmentPostType');
    $this->store    = $this->container->lookup('imageStore');
  }

  function test_it_can_find_media_attachment_images() {
    $meta = array(
      'post_mime_type' => 'image/jpeg',
      'post_type' => 'attachment'
    );
    $this->factory->attachment->create_object('image-1', 1, $meta);
    $this->factory->attachment->create_object('image-2', 2, $meta);
    $this->factory->attachment->create_object('image-3', 3, $meta);

    $images = $this->postType->findAll();
    $this->assertEquals(3, count($images));
  }

  function test_it_returns_empty_list_of_images_for_unknown_attachment_id() {
    $images = $this->postType->find(1000);
    $this->assertEquals(0, count($images));
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

  function setUpAttachment() {
    $attachment = $this->factory->post->create_and_get(
      array(
        'post_title' => 'foo',
        'post_type' => 'attachment'
      )
    );

    $id = $attachment->ID;
    wp_update_attachment_metadata($id, $this->getImageData());

    return $id;
  }

  function test_it_can_load_images_for_attachment() {
    $id = $this->setUpAttachment();
    $images = $this->postType->find($id);

    $image = $images[0];
    $this->assertEquals('original', $image->getKind());
    $this->assertEquals('2400x1500', $image->getSize());
    $this->assertEquals('2012/12/foo.jpg', $image->getFilename());

    $image = $images[1];
    $this->assertEquals('thumbnail', $image->getKind());
    $this->assertEquals('150x150', $image->getSize());
    $this->assertEquals('foo-150x150.jpg', $image->getFilename());

    $image = $images[2];
    $this->assertEquals('medium', $image->getKind());
    $this->assertEquals('300x194', $image->getSize());
    $this->assertEquals('foo-300x194.jpg', $image->getFilename());

    $image = $images[3];
    $this->assertEquals('large', $image->getKind());
    $this->assertEquals('1024x665', $image->getSize());
    $this->assertEquals('foo-1024x665.jpg', $image->getFilename());

    $image = $images[4];
    $this->assertEquals('post-thumbnail', $image->getKind());
    $this->assertEquals('624x405', $image->getSize());
    $this->assertEquals('foo-624x405.jpg', $image->getFilename());
  }
}
