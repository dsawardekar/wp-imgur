<?php

namespace WpImgur\Ajax;

class SyncController extends \Arrow\Ajax\Controller {

  public $attachmentPostType;
  public $imageSynchronizer;

  function needs() {
    return array_merge(
      parent::needs(),
      array('attachmentPostType', 'imageSynchronizer')
    );
  }

  function all() {
    return $this->attachmentPostType->findAll();
  }

  function post() {
    $validator = $this->getValidator();
    $validator->rule('required', 'id');
    $validator->rule('integer', 'id');

    if ($validator->validate()) {
      return $this->imageSynchronizer->sync($this->params['id']);
    } else {
      return $this->error($validator->errors());
    }
  }

}
