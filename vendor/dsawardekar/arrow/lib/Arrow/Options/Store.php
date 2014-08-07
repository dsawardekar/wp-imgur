<?php

namespace Arrow\Options;

class Store {

  public $container;
  public $pluginMeta;

  public $didLoad   = false;
  public $didChange = false;
  protected $options;

  function needs() {
    return array('pluginMeta');
  }

  function loaded() {
    return $this->didLoad;
  }

  function changed() {
    return $this->didChange;
  }

  function load() {
    if ($this->loaded()) {
      return;
    }

    $json            = get_option($this->getOptionsKey());
    $this->options   = $this->parse($json);
    $this->didLoad   = true;
    $this->didChange = false;
  }

  function save() {
    if (!$this->changed()) {
      return false;
    }

    // we need the real plugin version, not the debug mode timestamp
    $this->options['pluginVersion'] = $this->pluginMeta->version;

    $json = $this->toJSON($this->options);
    update_option($this->getOptionsKey(), $json);
    $this->didChange = false;

    return true;
  }

  function reload() {
    $this->options = null;
    $this->didLoad = false;

    $this->load();
  }

  function clear() {
    delete_option($this->getOptionsKey());

    $this->options = null;
    $this->didLoad = false;
  }

  function getOptions() {
    if (is_null($this->options)) {
      $this->load();
    }
    return $this->options;
  }

  function getOption($name) {
    if (is_null($this->options)) {
      $this->load();
    }

    if (array_key_exists($name, $this->options)) {
      $value = $this->options[$name];
    } else {
      $defaultOptions = $this->getDefaultOptions();
      if (array_key_exists($name, $defaultOptions)) {
        $value = $defaultOptions[$name];
      } else {
        $value = null;
      }
    }

    return $value;
  }

  function setOption($name, $value) {
    if (!$this->loaded()) {
      $this->load();
    }

    $this->options[$name] = $value;
    $this->didChange = true;
  }

  function parse($json) {
    if ($json !== false) {
      $options = $this->toOptions($json);
      if (is_null($options)) {
        $options = $this->getDefaultOptions();
      }
    } else {
      $options = $this->getDefaultOptions();
    }

    return $options;
  }

  function toJSON(&$options) {
    return json_encode($options);
  }

  function toOptions($json) {
    $options = json_decode($json, true);
    if (!is_array($options)) {
      $options = null;
    }

    return $options;
  }

  function getDefaultOptions() {
    return $this->pluginMeta->getDefaultOptions();
  }

  function getOptionsKey() {
    return $this->pluginMeta->getOptionsKey();
  }

}
