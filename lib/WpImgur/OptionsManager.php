<?php

namespace WpImgur;

class OptionsManager extends \Arrow\OptionsManager\OptionsManager {

  function __construct($container) {
    parent::__construct($container);

    $container
      ->singleton('optionsValidator', 'WpImgur\OptionsValidator')
      ->singleton('optionsPage', 'WpImgur\OptionsPage');
  }

}
