<?php

namespace Arrow\Asset;

class Manifest {

  public $container;

  public $templates         = array();
  public $styles            = array();
  public $scripts           = array();
  public $localizerVariable = null;

  public $scriptOptions;
  public $stylesheetOptions;

  public $context    = null;
  public $admin      = true;
  public $didLoad    = false;
  public $loaderMode = 'schedule';

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
      if (array_key_exists($i - 1, $assets)) {
        $options['dependencies'] = array($assets[$i - 1]);
      }
      if ($i === $total - 1 && $this->hasContext()) {
        $options['localizer'] = $this->getContext();
        $variable = $this->getLocalizerVariable();
        if (!is_null($variable)) {
          $options['variable'] = $variable;
        }
      }

      if ($this->getLoaderMode() === 'schedule') {
        $loader->schedule($asset, $options);
      } else {
        $loader->stream($asset, $options);
      }
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

  function getLocalizerVariable() {
    return $this->localizerVariable;
  }

  function includeTemplate($template) {
    include($template);
  }

  function getLoaderMode() {
    return $this->loaderMode;
  }

  function setLoaderMode($loaderMode) {
    $this->loaderMode = $loaderMode;
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
