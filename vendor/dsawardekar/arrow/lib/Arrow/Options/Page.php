<?php

namespace Arrow\Options;

class Page {

  public $container;
  public $pluginMeta;
  public $optionsManifest;
  public $didEnable = false;

  function needs() {
    return array(
      'pluginMeta', 'optionsManifest'
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

    $this->optionsManifest->setContext(array($this, 'getPageContext'));
    $this->optionsManifest->load();
  }

  function show() {
    include($this->getTemplatePath());
    $this->optionsManifest->loadTemplates();
  }

  function getPageContext($script) {
    $strings = $this->pluginMeta->getLocalizedStrings();
    if (!is_array($strings)) {
      $strings = array();
    }

    /* Documentation note, these variables are reserved,
     * plugins can't use the same variables */
    $options                = $this->pluginMeta->getOptionsContext();
    $options['apiEndpoint'] = $this->getApiEndpoint();
    $options['nonce']       = $this->getNonceValue();
    $options['debug']       = $this->pluginMeta->getDebug();

    $strings['options'] = $options;

    return $strings;
  }

  /* helpers */
  function getTemplateName() {
    return 'options';
  }

  function getTemplatePath() {
    return $this->pluginMeta->getDir() . '/templates/' . $this->getTemplateName() . '.html';
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
