<?php

namespace Arrow\Ajax;

class Controller {

  public $container;
  public $ajaxJsonPrinter;
  public $params;
  public $didSuccess = false;
  public $didError   = false;

  function needs() {
    return array('ajaxJsonPrinter');
  }

  function publicActions() {
    return array();
  }

  function adminActions() {
    return array(
      'all', 'get', 'post', 'put', 'patch', 'delete'
    );
  }

  /* not strictly REST to allow for older PHP */
  function actionMethods() {
    return array(
      'all'  => array('GET'),
      'get'  => array('GET'),
      'post' => array('POST'),
      'put' => array('PUT', 'POST'),
      'patch' => array('PATCH', 'POST'),
      'delete' => array('DELETE', 'GET', 'POST')
    );
  }

  function capability() {
    return 'manage_options';
  }

  function sendSuccess($data, $statusCode = 200) {
    $this->didSuccess = true;
    return $this->ajaxJsonPrinter->sendSuccess($data, $statusCode);
  }

  function sendError($error, $statusCode = 403) {
    $this->didError = true;
    return $this->ajaxJsonPrinter->sendError($error, $statusCode);
  }

  function process($action, $params = array()) {
    if (method_exists($this, $action)) {
      $this->params = $params;

      try {
        $this->doAction($action);
      } catch (\Exception $e) {
        $this->sendError($e->getMessage(), 500);
      }
    } else {
      $this->sendError('invalid_action');
    }
  }

  function doAction($action) {
    $result = $this->$action();
    if (!($this->didSuccess || $this->didError)) {
      if (!($result instanceof ControllerError)) {
        $this->sendSuccess($result);
      } else {
        $this->sendError($result->error, $result->statusCode);
      }
    }
  }

  function error($error, $statusCode = 403) {
    return new ControllerError($error, $statusCode);
  }

  function getValidator() {
    \Arrow\Options\Validator::loadStaticRules();
    return new \Valitron\Validator($this->params);
  }

  /* abstract */
  // @codeCoverageIgnoreStart
  // api.get('foo') -> return all
  function all() {

  }

  // api.get('foo', params) -> return specific item
  function get() {

  }

  // api.post('foo', params) -> return new object
  function post() {

  }

  // api.put('foo', params) -> returns full object
  function put() {

  }

  // api.patch('foo', params) -> returns partial or just true
  function patch() {

  }

  // api.delete('foo', params)
  function delete() {

  }
  // @codeCoverageIgnoreEnd

}

class ControllerError {

  public $error;
  public $statusCode;

  function __construct($error, $statusCode) {
    $this->error = $error;
    $this->statusCode = $statusCode;
  }

}
