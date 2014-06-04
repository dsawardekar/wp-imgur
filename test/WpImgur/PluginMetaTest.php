<?php

namespace WpImgur;

class PluginMetaTest extends \WP_UnitTestCase {

  public $meta;

  function setUp() {
    parent::setUp();

    $this->meta = new PluginMeta('wp-imgur.php');
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
    $expiry = $this->meta->getDefaultOptions()['accessTokenExpiry'];
    $this->assertLessThan($now, $expiry);
  }

}
