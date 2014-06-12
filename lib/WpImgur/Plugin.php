<?php

namespace WpImgur;

class Plugin extends \Arrow\Plugin {

  function __construct($file) {
    parent::__construct($file);

    $this->container
      ->object('pluginMeta'          ,  new PluginMeta($file))

      ->packager('assetPackager'     ,  'Arrow\Asset\Packager')
      ->packager('optionsPackager'   ,  'Arrow\Options\Packager')
      ->packager('imgurPackager'     ,  'WpImgur\Api\Packager')

      ->singleton('imagePostType'    ,  'WpImgur\Models\ImagePostType')
      ->singleton('configController' ,  'WpImgur\Ajax\ConfigController')
      ->singleton('syncController'   ,  'WpImgur\Ajax\SyncController');
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
