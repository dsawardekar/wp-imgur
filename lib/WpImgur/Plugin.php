<?php

namespace WpImgur;

class Plugin extends \Arrow\Plugin {

  public $container;

  function __construct($file) {
    parent::__construct($file);

    $this->container
      ->object('pluginMeta', new PluginMeta($file))
      ->object('assetManager', new \Arrow\AssetManager\AssetManager($this->container))
      ->object('optionsManager', new OptionsManager($this->container))

      ->singleton('imgurCredentials', 'WpImgur\Credentials')
      ->singleton('imgurAdapter', 'WpImgur\Adapter')
      ->singleton('imgurImageRepo', 'WpImgur\ImageRepo')
      ->singleton('imgurAlbumRepo', 'WpImgur\AlbumRepo');
  }

  function enable() {
    add_action('admin_init', array($this, 'initAdmin'));
    add_action('admin_menu', array($this, 'initAdminMenu'));
    add_action('init', array($this, 'initFrontEnd'));
  }

  function initAdmin() {
    $this->lookup('optionsPostHandler')->enable();
  }

  function initAdminMenu() {
    $this->lookup('optionsPage')->register();
  }

  function initFrontEnd() {

  }

}
