<?php

namespace Arrow\Twig;

class Renderer {

  public $twigEnvironment;

  function needs() {
    return array('twigEnvironment');
  }

  function render($template, $context = array()) {
    return $this->twigEnvironment->render(
      $template, $context
    );
  }

  function display($template, $context = array()) {
    echo $this->render($template, $context);
  }

}
