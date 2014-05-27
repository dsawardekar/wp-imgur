<?php

namespace WpImgur;

use Imgur\Exception;

class OptionsPostHandler extends \Arrow\OptionsManager\OptionsPostHandler {

  public $imgurAdapter;

  function needs() {
    return array_merge(
      parent::needs(),
      array('imgurAdapter')
    );
  }

  function save() {
    $pin = $_POST['pin'];

    try {
      $this->imgurAdapter->verifyPin($pin);
    } catch (Exception $e) {
      $errors = array(
        'pin' => array(
          $e->getMessage()
        )
      );

      $this->saveErrors($errors);
    }
  }

}
