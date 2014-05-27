<?php

namespace WpImgur;

class OptionsManager extends \Arrow\OptionsManager\OptionsManager {

  function __construct($container) {
    parent::__construct($container);

    $container
      ->singleton('optionsPostHandler', 'WpImgur\OptionsPostHandler')
      ->singleton('optionsValidator', 'WpImgur\OptionsValidator')
      ->singleton('optionsPage', 'WpImgur\OptionsPage');
  }

}
