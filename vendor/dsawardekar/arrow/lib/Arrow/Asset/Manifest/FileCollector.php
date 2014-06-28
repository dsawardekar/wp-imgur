<?php

namespace Arrow\Asset\Manifest;

class FileCollector {

  public $files = array();

  function collect($dir, $toCollect) {
    if (is_array($toCollect)) {
      $this->files = array_merge($this->files, $toCollect);
    } else {
      array_push($this->files, $toCollect);
    }
  }

  function getFiles() {
    return $this->files;
  }

  function reset() {
    $this->files = array();
  }

}
