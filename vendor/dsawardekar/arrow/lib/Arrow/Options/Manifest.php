<?php

namespace Arrow\Options;

class Manifest extends \Arrow\Asset\Manifest\Manifest {

  public $pluginMeta;

  function needs() {
    return array('pluginMeta');
  }

  function getScripts() {
    $slug  = $this->pluginMeta->getSlug();
    $slugs = $this->getAssetSlugs();
    array_push($slugs, $slug . '-app-run');

    return $slugs;
  }

  function getStyles() {
    return $this->getAssetSlugs();
  }

  /* templates are precompiled to js */
  function getTemplates() {
    return array();
  }

  function getScriptOptions() {
    return $this->pluginMeta->getScriptOptions();
  }

  function getStylesheetOptions() {
    return $this->pluginMeta->getStylesheetOptions();
  }

  /* helpers */
  function getDebug() {
    return $this->pluginMeta->getDebug();
  }

  function getAssetSlugs() {
    $slug = $this->pluginMeta->getSlug();

    if ($this->getDebug() && $this->hasDevAssets()) {
      $prefix = $slug . '/dist/assets/';

      return array(
        $prefix . 'vendor',
        $prefix . $slug,
      );
    } else {
      return array(
        $slug . '-vendor',
        $slug . '-app'
      );
    }
  }

  function hasDevAssets() {
    $dir  = $this->pluginMeta->getDir();
    $slug = $this->pluginMeta->getSlug();

    return is_dir($dir . '/js/' . $slug . '/dist/assets');
  }

}
