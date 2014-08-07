<?php

namespace WpImgur;

use Encase\Container;

class PluginMetaTest extends \WP_UnitTestCase {

  public $meta;
  public $container;

  function setUp() {
    parent::setUp();

    $this->container = new Container();
    $this->container
      ->object('pluginMeta', new PluginMeta('wp-imgur.php'))
      ->packager('optionsStore', 'Arrow\Options\Packager')
      ->packager('imgurApiPackager', 'WpImgur\Api\Packager');
    $this->meta = $this->container->lookup('pluginMeta');
  }

  function test_it_is_an_arrow_plugin_meta() {
    $this->assertInstanceOf('Arrow\PluginMeta', $this->meta);
  }

  function test_it_has_a_version() {
    $this->assertEquals(Version::$version, $this->meta->version);
  }

  function test_it_has_empty_tokens_by_default() {
    $options = $this->meta->getDefaultOptions();

    $this->assertEquals('', $options['accessToken']);
    $this->assertEquals('', $options['refreshToken']);
  }

  function test_it_has_expired_default_access_token_expiry() {
    $now    = strtotime('now');
    $options = $this->meta->getDefaultOptions();
    $expiry = $options['accessTokenExpiry'];
    $this->assertLessThan($now, $expiry);
  }

  function test_it_has_empty_album_id() {
    $options = $this->meta->getDefaultOptions();
    $this->assertEquals('', $options['album']);
  }

  function test_it_uses_push_mode_by_default() {
    $options = $this->meta->getDefaultOptions();
    $this->assertEquals('push', $options['uploadMode']);
  }

  function test_it_has_valid_options_context() {
    $adapterMock = $this->getMock('Imgur\Adapter');
    $adapterMock->expects($this->once())
      ->method('isAuthorized')
      ->will($this->returnValue(false));

    $adapterMock->expects($this->once())
      ->method('authorizeUrl')
      ->will($this->returnValue('foo-url'));

    $optionsStore = $this->container->lookup('optionsStore');
    $optionsStore->setOption('syncOnMediaUpload', false);
    $optionsStore->setOption('syncOnMediaEdit', false);
    $optionsStore->setOption('uploadMode', 'pull');
    $optionsStore->setOption('album', 'foo');

    $this->container->object('imgurAdapter',  $adapterMock);
    $actual = $this->meta->getOptionsContext();

    $this->assertEquals(false, $actual['authorized']);
    $this->assertEquals('foo-url', $actual['authorizeUrl']);
    $this->assertEquals(false, $actual['syncOnMediaUpload']);
    $this->assertEquals(false, $actual['syncOnMediaEdit']);
    $this->assertEquals('pull', $actual['uploadMode']);
    $this->assertEquals('foo',  $actual['album']);
    $this->assertEquals(site_url(), $actual['siteUrl']);
  }

  function test_it_has_localizations() {
    $this->meta->localize();
    $this->assertNotEmpty($this->meta->localizedStrings);
  }

}
