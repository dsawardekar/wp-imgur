<?php

namespace Arrow\Asset;

class AssetLoader {

  public $container;

  protected $scheduled = array();
  protected $streamed  = array();
  protected $didLoad   = false;

  public function needs() {
    return array();
  }

  public function schedule($slug, $options = null) {
    $asset = $this->assetFor($slug, $options);
    $this->scheduled[$slug] = $asset;

    if (!is_null($options)) {
      $this->loadAssetOption($asset, 'dependencies', $options);
      $this->loadAssetOption($asset, 'localizer', $options);
    }

    return $this;
  }

  public function stream($slug, $options = null) {
    if ($this->isStreamed($slug)) {
      return;
    }

    $asset = $this->assetFor($slug, $options);

    if (!is_null($options)) {
      $this->loadAssetOption($asset, 'dependencies', $options);
      $this->loadAssetOption($asset, 'localizer', $options);
    }

    $asset->register();
    $asset->enqueue();

    $this->streamed[$slug] = $asset;
  }

  public function dependency($slug, $dependencies) {
    $asset = $this->find($slug);
    $asset->dependencies = $dependencies;

    return $this;
  }

  public function localize($slug, $callable) {
    $asset = $this->find($slug);
    $asset->localizer = $callable;

    return $this;
  }

  public function load() {
    if ($this->loaded() === true) {
      return;
    }

    $this->register();
    $this->enqueue();
    $this->didLoad = true;
  }

  function loadAssetOption($asset, $name, $options) {
    if (array_key_exists($name, $options)) {
      $asset->$name = $options[$name];
    }
  }

  function register() {
    foreach ($this->scheduled as $slug => $asset) {
      $asset->register();
    }
  }

  public function loaded() {
    return $this->didLoad;
  }

  public function isScheduled($key) {
    return array_key_exists($key, $this->scheduled);
  }

  public function isStreamed($key) {
    return array_key_exists($key, $this->streamed);
  }

  public function find($key) {
    if ($this->isScheduled($key)) {
      return $this->scheduled[$key];
    } elseif ($this->isStreamed($key)) {
      return $this->streamed[$key];
    } else {
      return false;
    }
  }

  function enqueue() {
    add_action($this->enqueueAction(), $this->enqueueCallback());
  }

  function doEnqueue() {
    foreach ($this->scheduled as $slug => $asset) {
      $asset->enqueue();
    }
  }

  function enqueueCallback() {
    return array($this, 'doEnqueue');
  }

  /* abstract, implementation included for easier testing */
  function assetFor($slug, $options = null) {
    $asset = $this->container->lookup($this->assetType());
    $asset->slug = $slug;

    if (!is_null($options)) {
      $asset->options = $options;
    }

    return $asset;
  }

  function assetType() {
    return 'asset';
  }

  function enqueueAction() {
    return 'wp_enqueue_scripts';
  }

}
