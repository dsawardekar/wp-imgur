<?php

namespace Arrow\Ajax;

class Packager {

  function onInject($container) {
    $container
      ->singleton('ajaxJsonPrinter' , 'Arrow\Ajax\JsonPrinter')
      ->singleton('ajaxSentry'      , 'Arrow\Ajax\Sentry')
      ->singleton('ajaxRouter'      , 'Arrow\Ajax\Router');
  }

}
