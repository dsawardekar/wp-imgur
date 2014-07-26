<?php

namespace Arrow\Options;

class Packager {

  public $container;
  public $autoEnable  = true;
  public $allowPublic = false;

  function needs() {
    return array();
  }

  function onInject($container) {
    if (!$container->contains('assetPackager')) {
      /* options brings in assets if not already present */
      $container->packager('assetPackager', 'Arrow\Asset\Packager');
    }

    if (!$container->contains('ajaxPackager')) {
      /* options brings in ajax if not already present */
      $container->packager('ajaxPackager', 'Arrow\Ajax\Packager');
    }

    $container
      ->singleton('optionsStore'      ,  'Arrow\Options\Store')
      ->singleton('optionsValidator'  ,  'Arrow\Options\Validator')
      ->singleton('optionsManifest'   ,  'Arrow\Options\Manifest')
      ->singleton('optionsPage'       ,  'Arrow\Options\Page')
      ->singleton('optionsController' ,  'Arrow\Options\Controller');

    if ($this->getAutoEnable()) {
      $this->enable();
    }
  }

  function lookup($key) {
    return $this->container->lookup($key);
  }

  function enable() {
    $this->lookup('ajaxRouter')->enable($this->getAllowPublic());
    $this->lookup('optionsPage')->enable();
  }

  function getAutoEnable() {
    return $this->autoEnable;
  }

  function getAllowPublic() {
    return $this->allowPublic;
  }

}
