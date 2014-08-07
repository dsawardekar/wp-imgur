<?php

namespace WpImgur\Image;

class PackagerTest extends \WP_UnitTestCase {

  public $packager;
  public $container;

  function setUp() {
    parent::setUp();

    $this->container = new \Encase\Container();
    $this->container
      ->object('pluginMeta', new \WpImgur\PluginMeta('wp-imgur.php'))
      ->packager('imagePackager', 'WpImgur\Image\Packager');
  }

  function test_it_registers_post_type_on_creation() {
    $postType = $this->container->lookup('imagePostType');
    $this->assertTrue($postType->didRegister);
  }

}
