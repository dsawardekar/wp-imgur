<?php

namespace WpImgur\Ajax;

class ImageController extends \Arrow\Ajax\Controller {

  public $imagePostType;

  function needs() {
    return array_merge(
      parent::needs(),
      array('imagePostType')
    );
  }

  function all() {
    return $this->imagePostType->findAll();
  }

  function delete() {
    $id = $this->params['id'];
    return "deleted: $id";
  }

}
