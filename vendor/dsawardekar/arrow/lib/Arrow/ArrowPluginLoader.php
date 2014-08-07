<?php


if (class_exists('ArrowPluginLoader') === false) {

  class ArrowPluginMeta {

    public $file;
    public $options;
    public $name         = null;
    public $requirements = null;
    public $arrowVersion = null;

    function __construct($file, $options = array()) {
      $this->file    = $file;
      $this->options = $options;
    }

    function getFile() {
      return $this->file;
    }

    function getOptions() {
      return $this->options;
    }

    function getName() {
      if (is_null($this->name)) {
        if (array_key_exists('name', $this->options)) {
          $this->name = $this->options['name'];
        } else {
          $this->name = basename($this->file, '.php');
        }
      }

      return $this->name;
    }

    function getRequirements() {
      if (is_null($this->requirements)) {
        if (array_key_exists('requirements', $this->options)) {
          $this->requirements = $this->options['requirements'];
        } else {
          $this->requirements = new WP_Min_Requirements();
        }
      }

      return $this->requirements;
    }

    function getArrowVersion() {
      if (is_null($this->arrowVersion)) {
        if (array_key_exists('arrowVersion', $this->options)) {
          $this->arrowVersion = $this->options['arrowVersion'];
        } else {
          $this->arrowVersion = '0.7.0';
        }
      }

      return $this->arrowVersion;
    }

    function getPlugin() {
      return $this->options['plugin'];
    }

  }

  class ArrowPluginBootstrap {

    public $pluginMeta;
    public $didFauxPlugin = false;
    public $didRegister   = false;

    function __construct($pluginMeta) {
      $this->pluginMeta = $pluginMeta;
    }

    function getPluginMeta() {
      return $this->pluginMeta;
    }

    function start() {
      $this->loadRequirements();
      $requirements = $this->pluginMeta->getRequirements();

      if ($requirements->satisfied()) {
        $this->register();
      } else {
        $this->runFauxPlugin();
      }
    }

    function register() {
      $loader = ArrowPluginLoader::getInstance();
      $loader->register($this);

      $this->didRegister = true;
    }

    function run() {
      try {
        $pluginClass = $this->pluginMeta->getPlugin();
        $plugin      = $pluginClass::create($this->pluginMeta->getFile());
        $name        = $this->pluginMeta->getName();

        $plugin->enable();

        $this->sendPluginEvent($name, 'ready');
        return $plugin;
      } catch (\Exception $e) {
        error_log($e->getMessage());
      }
    }

    function sendPluginEvent($name, $eventType) {
      $action = 'arrow-plugin-' . $name . "-$eventType";
      do_action($action);
    }

    function runFauxPlugin() {
      $plugin = new WP_Faux_Plugin(
        $this->pluginMeta->getName(),
        $this->pluginMeta->getRequirements()->getResults()
      );

      $this->didFauxPlugin = true;
      $plugin->activate($this->pluginMeta->getFile());

      return $plugin;
    }

    function getAutoloaderPath() {
      $dir = plugin_dir_path($this->pluginMeta->getFile());
      return $dir . 'vendor/autoload.php';
    }

    function autoload() {
      $this->requireFile($this->getAutoloaderPath());
    }

    function getRequirementsPath() {
      $dir = plugin_dir_path($this->pluginMeta->getFile());
      return $dir . 'vendor/dsawardekar/wp-requirements/lib/Requirements.php';
    }

    function loadRequirements() {
      $this->requireFile($this->getRequirementsPath());
    }

    function requireFile($path) {
      if (file_exists($path)) {
        if (!defined('PHPUNIT_RUNNER')) {
          require_once($path);
        } else {
          require($path);
        }
      }
    }

  }

  class ArrowPluginLoader {

    static public $instance = null;
    static public function getInstance() {
      if (is_null(self::$instance)) {
        self::$instance = new ArrowPluginLoader();
      }

      return self::$instance;
    }

    static public function load($file, $options) {
      $pluginMeta = new ArrowPluginMeta($file, $options);
      $bootstrap  = new ArrowPluginBootstrap($pluginMeta);

      $bootstrap->start();
    }

    public $plugins = array();
    public $loaded  = false;

    public function __construct() {
      add_action('plugins_loaded', array($this, 'loadPlugins'));
    }

    public function register($bootstrap) {
      $file = $bootstrap->getPluginMeta()->getFile();

      if ($this->isRegistered($bootstrap)) {
        return;
      }

      $this->plugins[$file] = $bootstrap;
    }

    function isRegistered($bootstrap) {
      $file = $bootstrap->getPluginMeta()->getFile();
      return array_key_exists($file, $this->plugins);
    }

    function loadPlugins() {
      if ($this->loaded) {
        return;
      }

      $sorted = $this->sortPlugins();

      foreach ($sorted as $plugin) {
        $plugin->autoload();
      }

      foreach ($sorted as $plugin) {
        $plugin->run();
      }

      $this->plugins = array();
      $this->loaded = true;
    }

    function sortPlugins() {
      $plugins = array_values($this->plugins);
      usort($plugins, array($this, 'comparePlugins'));

      return $plugins;
    }

    /* Ascending order, ensures default 'prepend-autoloader' works
     * out of the box */
    function comparePlugins(&$a, &$b) {
      $versionA = $a->getPluginMeta()->getArrowVersion();
      $versionB = $b->getPluginMeta()->getArrowVersion();

      if (version_compare($versionA, $versionB, '<')) {
        return -1;
      } elseif (version_compare($versionA, $versionB, '>')) {
        return 1;
      } else {
        return 0;
      }
    }

  }

}
