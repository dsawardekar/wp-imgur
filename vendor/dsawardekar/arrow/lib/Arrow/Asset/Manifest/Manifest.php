<?php

namespace Arrow\Asset\Manifest;

class Manifest {

  public $container;

  public $templates = array();
  public $styles    = array();
  public $scripts   = array();

  public $scriptOptions;
  public $stylesheetOptions;

  public $context = null;
  public $admin   = true;
  public $didLoad = false;

  function needs() {
    return array();
  }

  function loaded() {
    return $this->didLoad;
  }

  function load($admin = true) {
    if ($this->loaded()) {
      return;
    }

    $this->admin = $admin;

    $this->loadStyles();
    $this->loadScripts();
    $this->didLoad = true;
  }

  function loadScripts() {
    $loader  = $this->getScriptLoader();
    $scripts = $this->getScripts();
    $total   = count($scripts);

    if ($total === 0) {
      return;
    }

    $this->scheduleAssets(
      $loader, $scripts, $this->getScriptOptions()
    );

    $last    = $total - 1;
    $script  = $scripts[$last];
    $context = $this->getContext();

    if (!is_null($context)) {
      $loader->localize($script, $context);
    }

    $loader->load();
  }

  function loadStyles() {
    $loader = $this->getStylesheetLoader();
    $styles = $this->getStyles();
    $total  = count($styles);

    if ($total === 0) {
      return;
    }

    $this->scheduleAssets(
      $loader, $styles, $this->getStylesheetOptions()
    );

    $loader->load();
  }

  function loadTemplates() {
    $templates = $this->getTemplates();

    foreach ($templates as $template) {
      $this->includeTemplate($template);
    }
  }

  function hasContext() {
    return !is_null($this->context) && is_callable($this->context);
  }

  function getContext() {
    return $this->context;
  }

  function setContext($context) {
    $this->context = $context;
  }

  function scheduleAssets($loader, $assets, $options) {
    $total = count($assets);

    for ($i = 0; $i < $total; $i++) {
      $asset  = $assets[$i];
      if ($i !== 0) {
        $options['dependencies'] = array($assets[$i - 1]);
      }

      $loader->schedule($asset, $options);
    }
  }

  /* abstract */
  function getScripts() {
    return $this->scripts;
  }

  function getStyles() {
    return $this->styles;
  }

  function getTemplates() {
    return $this->templates;
  }

  function getScriptOptions() {
    return $this->scriptOptions;
  }

  function getStylesheetOptions() {
    return $this->stylesheetOptions;
  }

  function includeTemplate($template) {
    include($template);
  }

  /* helpers */
  function lookup($key) {
    return $this->container->lookup($key);
  }

  function getScriptLoader() {
    if ($this->admin) {
      $key = 'adminScriptLoader';
    } else {
      $key = 'scriptLoader';
    }

    return $this->lookup($key);
  }

  function getStylesheetLoader() {
    if ($this->admin) {
      $key = 'adminStylesheetLoader';
    } else {
      $key = 'stylesheetLoader';
    }

    return $this->lookup($key);
  }


}
