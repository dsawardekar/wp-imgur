<?php

namespace WpImgur\Ajax;

class ConfigController extends \Arrow\Ajax\Controller {

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

  function needs() {
    return array_merge(
      parent::needs(),
      array('optionsStore', 'imgurAdapter')
    );
  }

  function index() {
    $this->sendSuccess(
      array(
      'authorized' => $this->imgurAdapter->isAuthorized(),
      'authorizeUrl' => $this->imgurAdapter->authorizeUrl()
      )
    );
  }

  function verifyPin() {
    \Arrow\Options\Validator::loadStaticRules();
    $validator = new \Valitron\Validator($this->params);
    $validator->rule('required', 'pin');
    $validator->rule('safeText', 'pin');

    if ($validator->validate()) {
      $pin = $this->params['pin'];

      try {
        $result = $this->imgurAdapter->verifyPin($pin);
        $this->sendSuccess($result);
      } catch (\Imgur\Exception $error) {
        $this->sendError($error->getMessage());
      }
    } else {
      $this->sendError($validator->errors());
    }
  }

}
