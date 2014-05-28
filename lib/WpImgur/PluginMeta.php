<?php

namespace WpImgur;

class PluginMeta extends \Arrow\PluginMeta {

  function getVersion() {
    //return Version::$version;
    return strtotime('now');
  }

  function getDefaultOptions() {
    return array(
      'accessToken' => '',
      'refreshToken' => '',
      'accessTokenExpiry' => strtotime('-1 hour')
    );
  }

}
