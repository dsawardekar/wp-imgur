<?php

namespace Arrow\Options;

class Page {

  public $container;
  public $pluginMeta;
  public $optionsStore;
  public $adminScriptLoader;
  public $adminStylesheetLoader;
  public $didEnable    = false;

  function needs() {
    return array(
      'pluginMeta',
      'optionsStore',
      'adminScriptLoader',
      'adminStylesheetLoader'
    );
  }

  function enable() {
    if ($this->didEnable) {
      return;
    }

    $this->didEnable = true;
    add_action('admin_menu', array($this, 'register'));
  }

  function register() {
    $meta = $this->pluginMeta;

    add_options_page(
      $meta->getOptionsPageTitle(),
      $meta->getOptionsMenuTitle(),
      $meta->getOptionsCapability(),
      $meta->getOptionsMenuSlug(),
      array($this, 'show')
    );

    $this->loadStyles();
    $this->loadScripts();
  }

  function getTemplateName() {
    return 'options';
  }

  function getTemplatePath() {
    return $this->pluginMeta->getDir() . '/templates/' . $this->getTemplateName() . '.html';
  }

  function show() {
    include($this->getTemplatePath());
  }

  function loadScripts() {
    $this->scheduleAssets(
      $this->adminScriptLoader,
      $this->getOptionsScripts(),
      $this->pluginMeta->getScriptOptions(),
      'jquery'
    );

    $this->adminScriptLoader->localize(
      $this->pluginMeta->getOptionsApp(),
      array($this, 'getPageContext')
    );

    $this->adminScriptLoader->load();
  }

  function loadStyles() {
    $this->scheduleAssets(
      $this->adminStylesheetLoader,
      $this->getOptionsStyles(),
      $this->pluginMeta->getStylesheetOptions()
    );

    $this->adminStylesheetLoader->load();
  }

  function scheduleAssets($loader, $assets, $options, $parent = null) {
    $total = count($assets);
    $asset = null;

    for ($i = 0; $i < $total; $i++) {
      $asset  = $assets[$i];
      if ($i === 0) {
        if (!is_null($parent)) {
          $options['dependencies'] = array($parent);
        }
      } else {
        $options['dependencies'] = array($assets[$i - 1]);
      }

      $loader->schedule($asset, $options);
    }

    if ($total > 0) {
      $options['dependencies'] = array($asset);
    }

    $loader->schedule($this->pluginMeta->getOptionsApp(), $options);
  }

  function getOptionsScripts() {
    return $this->pluginMeta->getOptionsScripts();
  }

  function getOptionsStyles() {
    return $this->pluginMeta->getOptionsStyles();
  }

  function getPageContext($script) {
    return array(
      'apiEndpoint' => $this->getApiEndpoint(),
      'nonce' => $this->getNonceValue()
    );
  }

  function getApiEndpoint() {
    $action = str_replace('-', '_', $this->pluginMeta->getSlug());
    $url  = admin_url('admin-ajax.php');
    $url .= '?action=' . $action;
    $url .= '&admin=1';

    return $url;
  }

  function getNonceValue() {
    return wp_create_nonce($this->pluginMeta->getSlug());
  }

}
