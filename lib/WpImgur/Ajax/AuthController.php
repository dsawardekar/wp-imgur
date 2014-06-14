<?php

namespace WpImgur\Ajax;

class AuthController extends \Arrow\Ajax\Controller {

  public $optionsStore;
  public $imgurAdapter;
  public $syncPreparer;

  function needs() {
    return array_merge(
      parent::needs(),
      array('optionsStore', 'imgurAdapter', 'syncPreparer')
    );
  }

  function adminActions() {
    return array_merge(
      parent::adminActions(),
      array('verifyPin')
    );
  }

  function actionMethods() {
    return array_merge(
      parent::actionMethods(),
      array(
        'verifyPin' => array('POST')
      )
    );
  }

  function index() {
    return array(
      'authorized' => $this->imgurAdapter->isAuthorized(),
      'authorizeUrl' => $this->imgurAdapter->authorizeUrl()
    );
  }

  function verifyPin() {
    $validator = $this->getValidator();
    $validator->rule('required', 'pin');
    $validator->rule('safeText', 'pin');

    if ($validator->validate()) {
      $pin = $this->params['pin'];

      try {
        $result = $this->imgurAdapter->verifyPin($pin);
        $this->syncPreparer->prepare();

        return $result;
      } catch (\Imgur\Exception $error) {
        return $this->error($error->getMessage());
      }
    } else {
      return $this->error($validator->errors());
    }
  }

}
