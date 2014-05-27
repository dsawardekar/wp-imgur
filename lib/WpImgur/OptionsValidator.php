<?php

namespace WpImgur;

class OptionsValidator extends \Arrow\OptionsManager\OptionsValidator {

  function loadRules($validator) {
    $validator->rule('required', 'pin');
    $validator->rule('safeText', 'pin');
  }

}
