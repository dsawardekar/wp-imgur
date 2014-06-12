<?php

namespace WpImgur\Image;

use Encase\Container;

class ImageStoreTest extends \WP_UnitTestCase {

  public $container;
  public $store;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->factory('image', 'WpImgur\Image\Image')
      ->singleton('imageStore', 'WpImgur\Image\Store');

    $this->store = $this->container->lookup('imageStore');
  }

  function test_it_has_a_container() {
    $this->assertSame($this->container, $this->store->container);
  }

  function test_it_can_create_images() {
    $image = $this->store->container->lookup('image');
    $this->assertInstanceOf('WpImgur\Image\Image', $image);
  }

}
