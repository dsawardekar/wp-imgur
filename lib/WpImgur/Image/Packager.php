<?php

namespace WpImgur\Image;

class Packager {

  function onInject($container) {
    $container
      ->factory('image'               , 'WpImgur\Image\Image')
      ->factory('imageStore'          , 'WpImgur\Image\Store')
      ->factory('imageCollection'     , 'WpImgur\Image\Collection')
      ->factory('imageSrcReplacer'    , 'WpImgur\Image\SrcReplacer')
      ->singleton('imageDeleter'      , 'WpImgur\Image\Deleter')
      ->singleton('imagePostType'     , 'WpImgur\Image\PostType')
      ->singleton('imageUploader'     , 'WpImgur\Image\Uploader')
      ->singleton('imageSynchronizer' , 'WpImgur\Image\Synchronizer')
      ->initializer('imagePostType'   , array($this, 'initializePostType'));
  }

  function initializePostType($postType, $container) {
    $postType->register();
  }

}
