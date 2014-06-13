<?php

namespace WpImgur\Ajax;

class SyncController extends \Arrow\Ajax\Controller {

  public $attachmentPostType;

  function needs() {
    return array_merge(
      parent::needs(),
      array('attachmentPostType')
    );
  }

  function index() {
    return $this->attachmentPostType->findAll();
  }

  function update() {
    $validator = $this->getValidator();
    $validator->rule('required', 'id');
    $validator->rule('integer', 'id');

    if ($validator->validate()) {
      $id     = $this->params['id'];
      $images = $this->attachmentPostType->find($id);
      $image  = $images[1];

      $result = array(
        'thumbnail' => $image->getUrl(),
        'name'      => $image->getFilename()
      );

      return $result;
    } else {
      return $this->error($validator->errors());
    }
  }

}
