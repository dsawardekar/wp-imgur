<?php

namespace WpImgur;

class PluginMeta extends \Arrow\PluginMeta {

  function __construct($file) {
    parent::__construct($file);

    $this->version = Version::$version;
  }

  function getDefaultOptions() {
    return array(
      'accessToken'       => '',
      'refreshToken'      => '',
      'accessTokenExpiry' => strtotime('-1 hour'),
      'album'             => '',
      'uploadMode'        => 'push'
    );
  }

}
