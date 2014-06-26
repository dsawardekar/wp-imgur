<?php

namespace WpImgur\Ajax;

class ConfigController extends \Arrow\Ajax\Controller {

  public $optionsStore;

  function needs() {
    return array_merge(
      parent::needs(),
      array('optionsStore')
    );
  }

  function patch() {
    $validator = $this->getValidator();
    $validator->rule('required', 'syncOnMediaUpload');
    $validator->rule('integer', 'syncOnMediaUpload');

    $validator->rule('required', 'syncOnMediaEdit');
    $validator->rule('integer', 'syncOnMediaEdit');

    if ($validator->validate()) {
      $syncOnMediaUpload = $this->params['syncOnMediaUpload'];
      $syncOnMediaEdit   = $this->params['syncOnMediaEdit'];

      $this->optionsStore->setOption('syncOnMediaUpload', $syncOnMediaUpload);
      $this->optionsStore->setOption('syncOnMediaEdit', $syncOnMediaEdit);

      return $this->optionsStore->save();
    } else {
      return $this->error($validator->errors());
    }
  }

}
