<?php

namespace WpImgur\Ajax;

class SyncController extends \Arrow\Ajax\Controller {

  public $container;
  public $attachmentPostType;
  public $imageSynchronizer;

  function needs() {
    return array_merge(
      parent::needs(),
      array('attachmentPostType', 'imageSynchronizer')
    );
  }

  function index() {
    $items = $this->attachmentPostType->findAll();
    //return array_slice($items, 0, 1);
    //return array_slice($items, 0, 5);
    return $items;
  }

  function update() {
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
