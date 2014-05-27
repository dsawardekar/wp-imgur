<?php

namespace WpImgur;

class PluginMeta extends \Arrow\PluginMeta {

  function getVersion() {
    return Version::$version;
  }

  function getDefaultOptions() {
    return array(
      'accessToken' => '',
      'refreshToken' => ''
    );
  }

}
