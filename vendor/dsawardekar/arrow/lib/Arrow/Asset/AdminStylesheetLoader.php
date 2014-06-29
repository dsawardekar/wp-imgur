<?php

namespace Arrow\Asset;

class AdminStylesheetLoader extends StylesheetLoader {

  public $pluginMeta;

  protected $didAdminLoad = false;

  function needs() {
    return array('pluginMeta');
  }

  function enqueueAction() {
    return 'admin_enqueue_scripts';
  }

  function load() {
    if ($this->didAdminLoad === true) {
      return parent::load();
    } else {
      add_action($this->startAction(), array($this, 'load'));
      $this->didAdminLoad = true;
    }
  }

  function startAction() {
    return 'load-settings_page_' . $this->pluginMeta->getSlug();
  }

}
