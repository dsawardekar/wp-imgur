<?php

namespace Arrow\Asset\Manifest;

class AppManifest extends Manifest {

  public $manifestDirScanner;
  public $manifestFileCollector;
  public $pluginMeta;

  function needs() {
    return array_merge(
      parent::needs(),
      array(
        'manifestDirScanner',
        'manifestFileCollector',
        'pluginMeta'
      )
    );
  }

  function getScripts() {
    if ($this->canScan()) {
      return $this->findScripts();
    } else {
      return array($this->getScriptsOutput());
    }
  }

  function getStyles() {
    if ($this->canScan()) {
      return $this->findStyles();
    } else {
      return array($this->getStylesOutput());
    }
  }

  function getTemplates() {
    if ($this->canScan()) {
      return $this->findTemplates();
    } else {
      return array($this->getTemplatesOutput());
    }
  }

  function loadTemplates() {
    if ($this->getDebug()) {
      parent::loadTemplates();
    } else {
      include($this->getTemplatesOutputFile());
    }
  }

  function includeTemplate($template) {
    $slug = $this->toTemplateSlug($template);

    echo "<script type='text/x-handlebars' data-template-name='$slug'>\n";
    include($template);
    echo "</script>\n";
  }

  function toTemplateSlug($path) {
    $prefix = $this->getAppDir() . '/templates';
    $len    = strlen($prefix);
    $path   = substr($path, $len + 1);
    $info   = pathinfo($path);

    if ($info['dirname'] === '.') {
      return $info['filename'];
    } else {
      return $info['dirname'] . '/' . $info['filename'];
    }
  }

  function getScriptsOutput() {
    return $this->getAppName() . '-app';
  }

  function getStylesOutput() {
    return $this->getAppName() . '-app';
  }

  function getTemplatesOutput() {
    return $this->getAppName() . '-app';
  }

  function getTemplatesOutputFile() {
    return $this->pluginMeta->getDir() . '/templates/' . $this->getTemplatesOutput() . '.html';
  }

  /* helpers */
  function getAppDir() {
    return $this->pluginMeta->getDir() . '/js/app';
  }

  function hasAppDir() {
    return is_dir($this->getAppDir());
  }

  function getAppName() {
    return $this->pluginMeta->getSlug();
  }

  function getDebug() {
    return $this->pluginMeta->getDebug();
  }

  function canScan() {
    $debug = $this->getDebug();

    if ($debug) {
      return $this->hasAppDir();
    } else {
      return false;
    }
  }

  function find($extension) {
    $this->manifestFileCollector->reset();
    $this->manifestDirScanner->scan(
      $this->getAppDir(), $extension, true
    );

    return $this->manifestFileCollector->getFiles();
  }

  function findScripts() {
    $files = $this->find('js');
    return $this->toSlugs($files);
  }

  function findStyles() {
    $files = $this->find('css');
    return $this->toSlugs($files);
  }

  function findTemplates() {
    return $this->find('hbs');
  }

  function toSlugs($files) {
    return array_map(array($this, 'toSlug'), $files);
  }

  function toSlug($path) {
    $prefix = $this->pluginMeta->getDir() . '/js';
    $len    = strlen($prefix);
    $path   = substr($path, $len + 1);
    $info   = pathinfo($path);

    return $info['dirname'] . '/' . $info['filename'];
  }

}
