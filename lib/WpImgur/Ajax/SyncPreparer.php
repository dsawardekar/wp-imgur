<?php

namespace WpImgur\Ajax;

class SyncPreparer {

  public $pluginMeta;
  public $imgurAlbumRepo;

  function needs() {
    return array(
      'pluginMeta',
      'imgurAlbumRepo',
      'imgurImageRepo',
      'optionsStore'
    );
  }

  function prepare() {
    // TODO: remove after Arrow bugfix
    $this->optionsStore->load();

    $this->createAlbum();
    $this->detectUploadMode();

    $this->optionsStore->save();
  }

  function createAlbum() {
    if ($this->optionsStore->getOption('album') === '') {
      $params = array(
        'title' => site_url()
      );

      $album = $this->imgurAlbumRepo->create($params);
      $this->optionsStore->setOption('album', $album['id']);
      return true;
    }

    return false;
  }

  function detectUploadMode() {
    try {
      $detectorUrl = plugins_url('images/detector.png', $this->pluginMeta->getFile());
      $params = array(
        'type' => 'url',
        'image' => $detectorUrl,
        'title' => 'upload_mode_detector'
      );

      $image = $this->imgurImageRepo->create($params);
      $this->imgurImageRepo->delete($image['deletehash']);

      $mode = 'pull';
    } catch (\Imgur\Exception $e) {
      $mode = 'push';
    }

    $this->optionsStore->setOption('uploadMode', $mode);
    return $mode;
  }

}
