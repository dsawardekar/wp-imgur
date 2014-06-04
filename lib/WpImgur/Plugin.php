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
      ->singleton('imgurAdapter', 'Imgur\Adapter')
      ->singleton('imgurImageRepo', 'Imgur\ImageRepo')
      ->singleton('imgurAlbumRepo', 'Imgur\AlbumRepo');
  }

  function enable() {
    add_action('admin_init', array($this, 'initAdmin'));
    add_action('init', array($this, 'initFrontEnd'));
  }

  function initAdmin() {
    $this->lookup('imgurCredentials')->load();
  }

  function initFrontEnd() {

  }

}
