<?php

namespace Arrow\Asset\Manifest;

class Packager {

  function onInject($container) {
    $container
      ->singleton('manifestFileCollector', 'Arrow\Asset\Manifest\FileCollector')
      ->singleton('manifestDirScanner', 'Arrow\Asset\Manifest\DirScanner')
      ->singleton('manifestRanker', 'Arrow\Asset\Manifest\Ranker')
      ->singleton('appManifest', 'Arrow\Asset\Manifest\AppManifest');
  }

}
