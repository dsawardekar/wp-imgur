<?php

namespace WpImgur\Api;

class Packager extends \Imgur\Packager {

  function onInject($container) {
    parent::onInject($container);

    $container
      ->singleton('imgurCredentials', 'WpImgur\Api\Credentials');
  }

}
