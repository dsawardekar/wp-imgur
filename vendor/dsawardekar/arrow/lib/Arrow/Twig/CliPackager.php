<?php

namespace Arrow\Twig;

class CliPackager extends Packager {

  public $sourceDirs;
  public $outputDir;

  function needs() {
    /* does not need plugin meta */
    return array();
  }

  function getCacheDir() {
    return $this->getOutputDir();
  }

  function getCacheEnabled() {
    return true;
  }

  function getTemplateDirs() {
    return $this->getSourceDirs();
  }

  function getSourceDirs() {
    return $this->sourceDirs;
  }

  function setSourceDirs($dirs) {
    $this->sourceDirs = $dirs;
  }

  function setOutputDir($dir) {
    $this->outputDir = $dir;
  }

  function getOutputDir() {
    return $this->outputDir;
  }

}
