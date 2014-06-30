<?php

namespace WpImgur;

class Plugin extends \Arrow\Plugin {

  function __construct($file) {
    parent::__construct($file);

    $this->container
      ->object('pluginMeta'          ,  new PluginMeta($file))

      ->packager('optionsPackager'    ,  'Arrow\Options\Packager')
      ->packager('imgurApiPackager'   ,  'WpImgur\Api\Packager')
      ->packager('imagePackager'      ,  'WpImgur\Image\Packager')
      ->packager('attachmentPackager' ,  'WpImgur\Attachment\Packager')
      ->packager('ajaxPackager'       ,  'WpImgur\Ajax\Packager');
  }

  function enable() {
    add_action('admin_init', array($this, 'initAdmin'));
    add_action('init', array($this, 'initFrontEnd'));
  }

  function initAdmin() {
    $this->lookup('imageSynchronizer')->enable();
  }

  function initFrontEnd() {
    $this->lookup('imageSrcReplacer')->enable();
  }

}
