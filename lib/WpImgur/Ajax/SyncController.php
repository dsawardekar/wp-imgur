<?php

namespace WpImgur\Ajax;

class SyncController extends \Arrow\Ajax\Controller {

  function needs() {
    return array_merge(
      parent::needs(),
      array('imagePostType')
    );
  }

  function index() {
    $items = $this->imagePostType->findImages();
    $this->sendSuccess($items);
  }

  function update() {
    $validator = new \Valitron\Validator($this->params);
    $validator->rule('required', 'id');
    $validator->rule('integer', 'id');

    if ($validator->validate()) {
      $id           = $this->params['id'];
      $image        = $this->imagePostType->findImage($id);
      $uploads = wp_upload_dir();

      if (array_key_exists('thumbnail', $image['sizes'])) {
        $file = $image['file'];
        $path = $uploads['basedir'] . '/' . $file;
        if (file_exists($path)) {
          $file = dirname($file) . '/' . $image['sizes']['thumbnail']['file'];
          $thumbnail = $uploads['baseurl'] . '/' . $file;
        } else {
          $thumbnail = '';
        }
      } else {
        $thumbnail = '';
      }

      $result = array(
        'thumbnail' => $thumbnail,
        'name' => $image['file']
      );

      $this->sendSuccess($result);
    } else {
      $this->sendError($validator->errors());
    }
  }

}
