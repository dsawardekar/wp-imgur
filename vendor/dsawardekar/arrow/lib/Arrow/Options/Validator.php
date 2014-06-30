<?php

namespace Arrow\Options;

class Validator {

  static $staticRulesLoaded = false;

  static function loadStaticRules() {
    if (self::$staticRulesLoaded) {
      return;
    }

    \Valitron\Validator::addRule(
      'safeText', array('Arrow\Options\Validator', 'isSafeText')
    );

    self::$staticRulesLoaded = true;
  }

  static function isSafeText($field, $value, $params) {
    return sanitize_text_field($value) === $value;
  }

  public $validator;
  public $params;
  public $pluginMeta;

  function needs() {
    return array('pluginMeta');
  }

  function build() {
    $this->loadCustomRules();

    $this->validator = new \Valitron\Validator($this->params);
    $this->loadRules($this->validator);
  }

  function validate($params = null) {
    if (is_null($params)) {
      $params = $_POST;
    }

    $this->params = $params;
    $this->build();

    return $this->validator->validate();
  }

  function errors() {
    return $this->validator->errors();
  }

  /* abstract */
  function loadRules($validator) {
  }

  function loadCustomRules() {
    if (!self::$staticRulesLoaded) {
      self::loadStaticRules();
    }
  }


}
