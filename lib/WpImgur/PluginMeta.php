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
      'uploadMode'        => 'push',
      'syncOnMediaUpload' => true,
      'syncOnMediaEdit'   => true
    );
  }

  function getOptionsContext() {
    $imgurAdapter = $this->container->lookup('imgurAdapter');
    $optionsStore = $this->container->lookup('optionsStore');

    return array(
      'authorized'        => $imgurAdapter->isAuthorized(),
      'authorizeUrl'      => $imgurAdapter->authorizeUrl(),
      'syncOnMediaUpload' => $optionsStore->getOption('syncOnMediaUpload'),
      'syncOnMediaEdit'   => $optionsStore->getOption('syncOnMediaEdit')
    );
  }

}
