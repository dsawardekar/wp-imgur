<?php

namespace Arrow;

use Encase\Container;

class Plugin {

  static public $instances = array();
  static public function create($file) {
    $className = get_called_class();

    if (!array_key_exists($className, self::$instances)) {
      self::$instances[$className] = new $className($file);
    }

    return self::$instances[$className];
  }

  static public function getInstance() {
    $className = get_called_class();
    return self::$instances[$className];
  }

  public $container;

  public function __construct($file) {
    $this->container = new Container();
  }

  public function lookup($key) {
    return $this->container->lookup($key);
  }

}
