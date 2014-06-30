<?php

namespace Arrow\Ajax;

class Sentry extends \Arrow\Sentry {

  public $public         = false;
  public $hasValidParams = false;
  public $params         = null;
  public $didParams      = false;

  public $pluginMeta;
  public $ajaxJsonPrinter;

  function needs() {
    return array_merge(
      parent::needs(),
      array('pluginMeta', 'ajaxJsonPrinter')
    );
  }

  function authorize($params = null) {
    $this->public = $this->isPublicRequest();
    return $this->doAuthorize();
  }

  function authorizePublic() {
    $this->public = true;
    return $this->doAuthorize();
  }

  function doAuthorize() {
    if (!$this->isValidController()) {
      return $this->deny('invalid_controller');
    }

    if (!$this->isValidAction()) {
      return $this->deny('invalid_action');
    }

    if (!$this->isValidMethod()) {
      return $this->deny('invalid_method');
    }

    if (!$this->isValidParams()) {
      return $this->deny('invalid_params');
    }

    if (!$this->public) {
      if (!$this->isValidNonce()) {
        return $this->deny('invalid_nonce');
      }

      if (!$this->isValidReferer()) {
        return $this->deny('invalid_referer');
      }

      if (!$this->isValidLoggedIn()) {
        return $this->deny('not_logged_in');
      }

      if (!$this->hasValidPermissions()) {
        return $this->deny('invalid_permissions');
      }
    }

    return true;
  }

  function deny($reason) {
    $this->didDeny = true;
    $this->denyReason = $reason;
    $this->ajaxJsonPrinter->sendError($reason);

    return false;
  }

  /* only allow requests from options page */
  function getValidReferer() {
    if ($this->public) {
      return '';
    } else {
      return $this->pluginMeta->getOptionsUrl();
    }
  }

  /* only allow logged in users for admin */
  /* for public always allow */
  function getValidLoggedIn() {
    if ($this->public) {
      return false;
    } else {
      return true;
    }
  }

  /* controller */
  function getController() {
    if (array_key_exists('controller', $_GET)) {
      return $_GET['controller'];
    } else {
      return '';
    }
  }

  function isValidController() {
    $controller = $this->getController();

    if ($controller !== '') {
      return $this->container->contains($controller . 'Controller');
    } else {
      return false;
    }
  }

  /* action */
  /* using operation to avoid conflict with WordPress's action parameter */
  function getAction() {
    if (array_key_exists('operation', $_GET)) {
      return $_GET['operation'];
    } else {
      return '';
    }
  }

  function isValidAction() {
    $action        = $this->getAction();
    $controller    = $this->getController() . 'Controller';
    $hasController = $this->container->contains($controller);

    if ($hasController && $action !== '') {
      $controller     = $this->container->lookup($controller);
      $allowedActions = $this->getAllowedActions($controller);

      if (in_array($action, $allowedActions)) {
        return method_exists($controller, $action);
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function getAllowedActions($controller) {
    if ($this->public) {
      return $controller->publicActions();
    } else {
      return $controller->adminActions();
    }
  }

  /* request method */
  function isJsonMethod() {
    $method = $this->getMethod();
    $jsonMethods = array('POST', 'PUT', 'PATCH');

    if (in_array($method, $jsonMethods)) {
      return true;
    } else {
      return false;
    }
  }

  function isValidMethod() {
    $controller    = $this->container->lookup($this->getController() . 'Controller');
    $actionMethods = $controller->actionMethods();
    $action        = $this->getAction();
    $method        = $this->getMethod();

    if (array_key_exists($action, $actionMethods)) {
      if (in_array($method, $actionMethods[$action])) {
        return true;
      } else {
        return false;
      }

    } else {
      return $method === 'GET';
    }
  }

  /* params */
  function getParams($input = null) {
    if ($this->didParams) {
      return $this->params;
    }

    if (is_null($input)) {
      if ($this->isJsonMethod()) {
        $input  = file_get_contents('php://input');
        $params = $this->toParams($input);
      } else {
        $params = $_GET;
        $this->hasValidParams = true;
      }
    } else {
      $params = $this->toParams($input);
    }

    $this->params    = $params;
    $this->didParams = true;

    return $params;
  }

  function toParams($input) {
    if ($input === '') {
      $this->hasValidParams = false;
      return array();
    }

    $json = json_decode($input, true);

    /* php5.5 so/q?18239405 */
    /* default PHP 5.5 does not have complete json apis */
    /* need to install php5-json separately */
    if (function_exists('json_last_error')) {
      if (json_last_error() === JSON_ERROR_NONE) {
        $this->hasValidParams = true;
        return $json;
      } else {
        $this->hasValidParams = false;
        return array();
      }
    } else {
      $this->hasValidParams = is_array($json);
      return $json;
    }
  }

  function isValidParams() {
    $this->getParams();
    return $this->hasValidParams;
  }

  /* nonce */
  function getNonceName() {
    return $this->pluginMeta->getSlug();
  }

  function getNonceValue() {
    if (array_key_exists('nonce', $_GET)) {
      return $_GET['nonce'];
    } else {
      return '';
    }
  }

  function isValidNonce() {
    if ($this->public) {
      return true;
    } else {
      return parent::isValidNonce();
    }
  }

  /* permissions */
  function hasValidPermissions() {
    $controller = $this->container->lookup($this->getController() . 'Controller');
    $capability = $controller->capability();

    if ($capability !== '') {
      return current_user_can($capability);
    } else {
      return true;
    }
  }

  /* admin flag */
  function isAdminRequest() {
    return array_key_exists('admin', $_GET) && $_GET['admin'] === '1';
  }

  function isPublicRequest() {
    return !$this->isAdminRequest();
  }

}
