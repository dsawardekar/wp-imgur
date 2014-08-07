<?php

namespace Arrow\Asset;

class Packager {

  function onInject($container) {
    $container
      ->factory('script', 'Arrow\Asset\Script')
      ->factory('stylesheet', 'Arrow\Asset\Stylesheet')

      ->singleton('scriptLoader', 'Arrow\Asset\ScriptLoader')
      ->singleton('stylesheetLoader', 'Arrow\Asset\StylesheetLoader')

      ->singleton('adminScriptLoader', 'Arrow\Asset\AdminScriptLoader')
      ->singleton('adminStylesheetLoader', 'Arrow\Asset\AdminStylesheetLoader');
  }

}
