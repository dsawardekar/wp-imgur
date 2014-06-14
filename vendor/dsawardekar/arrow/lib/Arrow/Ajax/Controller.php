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
      'index', 'create', 'update', 'show', 'delete'
    );
  }

  /* not strictly REST to allow for older PHP */
  function actionMethods() {
    return array(
      'index'  => array('GET'),
      'create' => array('POST'),
      'update' => array('POST', 'PUT', 'PATCH'),
      'show'   => array('GET'),
      'delete' => array('GET', 'DELETE')
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
  function index() {

  }

  function create() {

  }

  function update() {

  }

  function show() {

  }

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
