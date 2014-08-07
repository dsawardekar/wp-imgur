<?php

namespace Arrow\Asset;

class Script extends Asset {

  public $localized = false;

  public function dirname() {
    return 'js';
  }

  public function extension() {
    return '.js';
  }

  public function register() {
    wp_register_script(
      $this->slug,
      $this->path(),
      $this->dependencies,
      $this->option('version'),
      $this->option('in_footer')
    );

    if (!is_null($this->localizer)) {
      $this->runLocalizer();
      $this->localized = true;
    }
  }

  function localize($data) {
    wp_localize_script(
      $this->slug,
      $this->localizeSlug(),
      $data
    );
  }

  function enqueue() {
    wp_enqueue_script($this->slug);
  }

  function defaultOptions() {
    return $this->pluginMeta->getScriptOptions();
  }

  function localizeSlug() {
    if (array_key_exists('variable', $this->options)) {
      return $this->options['variable'];
    } else {
      return parent::localizeSlug();
    }
  }
}
