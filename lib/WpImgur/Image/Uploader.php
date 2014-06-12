<?php

namespace WpImgur\Image;

class Uploader {

  public $container;
  public $pluginMeta;
  public $optionsStore;

  function needs() {
    return array(
      'pluginMeta', 'optionsStore', 'imgurImageRepo'
    );
  }

  function getAlbum() {
    return $this->optionsStore->getOption('album');
  }

  function hasAlbum() {
    return $this->getAlbum() !== '';
  }

  function getMode() {
    return $this->optionsStore->getOption('uploadMode');
  }

  function upload($image) {
    if ($this->getMode() === 'push') {
      $this->uploadByPush($image);
    } else {
      $this->uploadByPull($image);
    }
  }

  function uploadByPush($image) {
    $params          = $this->getUploadParams($image, 'file');
    $params['image'] = file_get_contents($image->getFilepath());
    $uploadedImage   = $this->imgurImageRepo->create($params);

    return $uploadedImage;
  }

  function uploadByPull($image) {
    $params          = $this->getUploadParams($image, 'url');
    $params['image'] = $image->getUrl();
    $uploadedImage   = $this->imgurImageRepo->create($params);

    return $uploadedImage;
  }

  function getUploadParams($image, $type) {
    $params = array(
      'title' => basename($image->getFilename()),
      'type'  => $type,
    );

    if ($this->hasAlbum()) {
      $params['album'] = $this->getAlbum();
    }

    return $params;
  }

}
