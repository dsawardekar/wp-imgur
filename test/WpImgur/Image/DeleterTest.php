<?php

namespace WpImgur\Image;

use Encase\Container;

class DeleterTest extends \WP_UnitTestCase {

  public $container;
  public $deleter;
  public $repo;
  public $postType;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->object('pluginMeta', new \WpImgur\PluginMeta('wp-imgur.php'))
      ->packager('optionsPackager', 'Arrow\Options\Packager')
      ->singleton('imagePostType', 'WpImgur\Image\PostType')
      ->packager('imgurPackager', 'WpImgur\Api\Packager')
      ->singleton('deleter', 'WpImgur\Image\Deleter');

    $this->deleter = $this->container->lookup('deleter');
    $this->repo = $this->container->lookup('imgurImageRepo');
    $this->postType = $this->container->lookup('imagePostType');
  }

  function test_it_has_a_container() {
    $this->assertSame($this->container, $this->deleter->container);
  }

  function test_it_has_an_imgur_image_repo() {
    $this->assertSame($this->repo, $this->deleter->imgurImageRepo);
  }

  function test_it_has_an_image_post_type() {
    $this->assertSame($this->postType, $this->deleter->imagePostType);
  }

  function test_it_knows_if_image_url_is_not_imgur_image() {
    $id = $this->deleter->getImageId('foo');
    $this->assertFalse($id);
  }

  function test_it_knows_if_local_site_url_is_not_imgur_image() {
    $url = plugins_url('images/foo.jpg');
    $id = $this->deleter->getImageId($url);
    $this->assertFalse($id);
  }

  function test_it_can_find_id_of_imgur_image() {
    $url = 'http://i.imgur.com/foo.jpg';
    $id = $this->deleter->getImageId($url);
    $this->assertEquals('foo', $id);
  }

  function test_it_can_delete_imgur_image_using_repo() {
    $repo = $this->getMock('Imgur\ImageRepo');
    $repo->expects($this->once())->method('delete')->with('foo')->will($this->returnValue(true));
    $this->deleter->imgurImageRepo = $repo;

    $actual = $this->deleter->deleteImgurImage('foo');

    $this->assertTrue($actual);
  }

  function test_it_can_find_imgur_images_for_post_id() {
    $this->postType->register();
    $content = array(
      'original' => 'original',
      '10x10' => 'ten',
      '20x20' => 'twenty'
    );

    $id = $this->postType->create('foo-1', $content);
    $images = $this->deleter->getImgurImages($id);
    $expected = array(
      'original', 'ten', 'twenty'
    );

    $this->assertEquals($expected, $images);
  }

  function test_it_can_delete_imgur_images_for_post_id() {
    $repo = $this->getMock('Imgur\ImageRepo');
    $repo
      ->expects($this->exactly(3))
      ->method('delete')
      ->with($this->logicalOr(
        $this->equalTo('original'),
        $this->equalTo('ten'),
        $this->equalTo('twenty')
      ))
      ->will($this->returnValue(true));

    $this->postType->register();
    $content = array(
      'original' => 'http://i.imgur.com/original.jpg',
      '10x10' => 'http://i.imgur.com/ten.jpg',
      '20x20' => 'http://i.imgur.com/twenty.jpg'
    );

    $id = $this->postType->create('foo-1', $content);
    $this->deleter->imgurImageRepo = $repo;
    $this->deleter->delete($id);
  }

}
