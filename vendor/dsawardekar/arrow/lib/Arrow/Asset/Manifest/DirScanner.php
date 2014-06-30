<?php

namespace Arrow\Asset\Manifest;

class DirScanner {

  public $container;
  public $manifestFileCollector;
  public $manifestRanker;

  function needs() {
    return array('manifestFileCollector', 'manifestRanker');
  }

  function scan($dir, $extension, $recursive = true) {
    if ($recursive) {
      $this->scanSubDirs($dir, $extension);
    }

    $this->collectFiles($dir, $extension);
  }

  function scanSubDirs($dir, $extension) {
    $dirs = $this->manifestRanker->rank(
      $dir, $this->globForDirs($dir)
    );

    foreach ($dirs as $subdir) {
      $scanner = $this->getScanner();
      $scanner->scan($subdir, $extension, true);
    }
  }

  function collectFiles($dir, $extension) {
    $files = $this->manifestRanker->rank(
      $dir, $this->globForFiles($dir, $extension)
    );

    if ($files !== false) {
      $this->manifestFileCollector->collect(
        $dir, $files
      );
    }
  }

  function globForFiles($dir, $extension) {
    $pattern = "$dir/*.$extension";
    return glob($pattern);
  }

  function globForDirs($dir) {
    $pattern = "$dir/*";
    return glob($pattern, GLOB_ONLYDIR);
  }

  function getScanner() {
    return $this->container->lookup('manifestDirScanner');
  }

}
