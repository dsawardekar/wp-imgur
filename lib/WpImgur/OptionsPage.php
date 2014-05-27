<?php

namespace WpImgur;

class OptionsPage extends \Arrow\OptionsManager\OptionsPage {

  function needs() {
    return array_merge(
      parent::needs(),
      array('imgurAdapter')
    );
  }

  function getTemplateContext() {
    return array(
      'authorized' => $this->imgurAdapter->isAuthorized(),
      'authorizeUrl' => $this->imgurAdapter->authorizeUrl()
    );
  }

}
