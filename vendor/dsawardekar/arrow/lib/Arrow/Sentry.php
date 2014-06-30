<?php

namespace Arrow;

class Sentry {

  public $container;

  public $nonceName        = null;
  public $validReferer     = null;
  public $validPermissions = null;
  public $validMethod      = null;
  public $validLoggedIn    = null;

  public $didQuit     = false;
  public $didDeny     = false;
  public $denyReason  = false;

  function needs() {
    return array();
  }

  function authorize($params = null) {
    if (!$this->isValidMethod()) {
      return $this->deny('invalid_method');
    }

    if (!$this->isValidReferer()) {
      return $this->deny('invalid_referer');
    }

    if (!$this->isValidNonce()) {
      return $this->deny('invalid_nonce');
    }

    if (!$this->isValidLoggedIn()) {
      return $this->deny('not_logged_in');
    }

    if (!$this->hasValidPermissions()) {
      return $this->deny('invalid_permissions');
    }

    return true;
  }

  function deny($reason) {
    $this->denyReason = $reason;
    $this->didDeny    = true;

    $this->quit($reason);
    return false;
  }

  function quit($reason = 'You do not have sufficient permissions to access this page.') {
    $this->didQuit = true;
    if (!$this->isPHPUnit()) {
      wp_die($reason);
    }
  }

  /* params */
  function getRequestParams() {
    $method = $this->getValidMethod();
    if ($method === 'GET') {
      return $_GET;
    } else {
      return $_POST;
    }
  }

  /* permissions */
  function setValidPermissions($validPermissions) {
    $this->validPermissions = $validPermissions;
  }

  function getValidPermissions() {
    return $this->validPermissions;
  }

  function hasValidPermissions() {
    return current_user_can($this->getValidPermissions());
  }

  /* logged in */
  function setValidLoggedIn($validLoggedIn) {
    $this->validLoggedIn = $validLoggedIn;
  }

  function getValidLoggedIn() {
    return $this->validLoggedIn;
  }

  function isValidLoggedIn() {
    if ($this->getValidLoggedIn()) {
      return is_user_logged_in();
    } else {
      return true;
    }
  }

  /* nonce */
  function setNonceName($nonceName) {
    $this->nonceName = $nonceName;
  }

  function getNonceName() {
    return $this->nonceName;
  }

  function getNonceValue() {
    if (array_key_exists('nonce', $_GET)) {
      return $_GET['nonce'];
    } else {
      return '';
    }
  }

  function isValidNonce() {
    return wp_verify_nonce(
      $this->getNonceValue(), $this->getNonceName()
    ) !== false;
  }

  /* referer */
  function setValidReferer($validReferer) {
    $this->validReferer = $validReferer;
  }

  function getValidReferer() {
    return $this->validReferer;
  }

  function getReferer() {
    if (array_key_exists('HTTP_REFERER', $_SERVER)) {
      return $_SERVER['HTTP_REFERER'];
    } else {
      return '';
    }
  }

  function isValidReferer() {
    return $this->getReferer() === $this->getValidReferer();
  }

  /* request method */
  function setValidMethod($validMethod) {
    $this->validMethod = $validMethod;
  }

  function getValidMethod() {
    return $this->validMethod;
  }

  function getMethod() {
    if (array_key_exists('REQUEST_METHOD', $_SERVER)) {
      return $_SERVER['REQUEST_METHOD'];
    } else {
      return false;
    }
  }

  function isValidMethod() {
    return $this->getMethod() === $this->getValidMethod();
  }

  /* helpers */
  function isPHPUnit() {
    return defined('PHPUNIT_RUNNER');
  }

}
