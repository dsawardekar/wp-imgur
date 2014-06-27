<?php

namespace WpImgur\Ajax;

class Packager {

  function onInject($container) {
    $container
      ->singleton('configController', 'WpImgur\Ajax\ConfigController')
      ->singleton('syncPreparer', 'WpImgur\Ajax\SyncPreparer')
      ->singleton('imageController', 'WpImgur\Ajax\ImageController')
      ->singleton('authController' ,  'WpImgur\Ajax\AuthController')
      ->singleton('syncController'   ,  'WpImgur\Ajax\SyncController');
  }

}
