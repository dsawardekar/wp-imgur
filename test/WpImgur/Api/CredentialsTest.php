<?php

namespace WpImgur\Api;

use Encase\Container;

class CredentialsTest extends \WP_UnitTestCase {

  public $container;
  public $cred;
  public $store;
  public $pluginMeta;

  function setUp() {
    parent::setUp();

    $this->pluginMeta = new \WpImgur\PluginMeta('wp-imgur.php');
    $this->container  = new Container();
    $this->container
      ->object('pluginMeta', $this->pluginMeta)
      ->object('optionsManager', new \WpImgur\OptionsManager($this->container))
      ->singleton('imgurCredentials', 'WpImgur\Api\Credentials');

    $this->cred = $this->container->lookup('imgurCredentials');
    $this->store = $this->container->lookup('optionsStore');
  }

  function test_it_has_an_options_store() {
    $this->assertSame($this->store, $this->cred->optionsStore);
  }

  function test_it_knows_if_credentials_have_not_loaded() {
    $this->assertFalse($this->cred->loaded());
  }

  function test_it_has_blank_credentials_if_not_present_in_db() {
    $this->cred->load();
    $this->assertEquals('', $this->cred->getAccessToken());
    $this->assertEquals('', $this->cred->getRefreshToken());
    $this->assertTrue($this->cred->hasAccessTokenExpired());
  }

  function test_it_can_store_credentials_as_options() {
    $this->cred->setAccessToken('foo');
    $this->cred->setAccessTokenExpiry(60);
    $this->cred->setRefreshToken('bar');
    $this->cred->save();

    $this->assertEquals('foo', $this->store->getOption('accessToken'));
    $this->assertEquals('bar', $this->store->getOption('refreshToken'));
    $this->assertEquals($this->cred->getAccessTokenExpiry(), $this->store->getOption('accessTokenExpiry'));
  }

  function test_it_can_load_stored_options() {
    update_option('wp-imgur-options', '{"accessToken":"a","accessTokenExpiry":100, "refreshToken": "b"}');
    $this->cred->load();

    $this->assertEquals('a', $this->cred->getAccessToken());
    $this->assertEquals('b', $this->cred->getRefreshToken());
    $this->assertEquals(100, $this->cred->getAccessTokenExpiry());
    $this->assertTrue($this->cred->loaded());
  }

  function test_it_has_imgur_client_id() {
    $this->assertNotEquals('', $this->cred->getClientId());
  }

  function test_it_has_imgur_client_secret() {
    $this->assertNotEquals('', $this->cred->getClientSecret());
  }

}
