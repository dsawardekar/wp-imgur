<?php

namespace Arrow\Asset;

class Stylesheet extends Asset {

  public $options = array('media' => 'all');

  public function dirname() {
    if ($this->isAppSlug()) {
      return 'js';
    } else {
      return 'css';
    }
  }

  public function extension() {
    return '.css';
  }

  public function register() {
    wp_register_style(
      $this->uniqueSlug(),
      $this->path(),
      $this->dependencies,
      $this->option('version'),
      $this->option('media')
    );
  }

  function enqueue() {
    wp_enqueue_style($this->uniqueSlug());
  }

}
