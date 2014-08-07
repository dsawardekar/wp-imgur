<?php

namespace Arrow\Options;

class Controller extends \Arrow\Ajax\Controller {

  public $container;
  public $pluginMeta;
  public $optionsStore;
  public $optionsValidator;

  function needs() {
    return array_merge(
      parent::needs(),
      array('pluginMeta', 'optionsStore', 'optionsValidator')
    );
  }

  // By default only sends options that were whitelisted
  function all() {
    return $this->pluginMeta->getOptionsContext();
  }

  function patch() {
    $valid = $this->optionsValidator->validate($this->params);
    if (!$valid) {
      return $this->error($this->optionsValidator->errors());
    }

    $options = $this->pluginMeta->getDefaultOptions();
    foreach ($options as $key => $value) {
      $this->optionsStore->setOption(
        $key, $this->params[$key]
      );
    }

    $this->optionsStore->save();
    return $this->all();
  }

  function delete() {
    $this->optionsStore->clear();
    return $this->all();
  }

}
