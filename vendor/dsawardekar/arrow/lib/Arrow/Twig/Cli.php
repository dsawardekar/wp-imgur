<?php

namespace Arrow\Twig;

use Encase\Container;

class Cli {

  public $container;
  public $opts;
  public $sourceDirs = null;
  public $outputDir  = null;


  function __construct() {
    $this->container = new Container();
    $this->container
      ->packager('twigCliPackager', 'Arrow\Twig\CliPackager')
      ->singleton('twigCompiler', 'Arrow\Twig\Compiler');
  }

  function lookup($key) {
    return $this->container->lookup($key);
  }

  function run() {
    $this->loadOpts();

    $packager = $this->lookup('twigCliPackager');
    $packager->setSourceDirs($this->getSourceDirs());
    $packager->setOutputDir($this->getOutputDir());

    $compiler = $this->lookup('twigCompiler');
    $compiler->compile($this->getSourceDirs());
  }

  function getSourceDirs() {
    if (is_null($this->sourceDirs)) {
      $sourceDirs       = $this->opts['s'];
      $this->sourceDirs = explode(',', $sourceDirs);
    }

    return $this->sourceDirs;
  }

  function getOutputDir() {
    if (is_null($this->outputDir)) {
      $this->outputDir = $this->opts['o'];
    }

    return $this->outputDir;
  }

  function loadOpts() {
    if (!is_null($this->opts)) {
      return;
    }

    $opts = "";
    $opts .= "s:";
    $opts .= "o:";

    $this->opts = getopt($opts);
  }

}
