<?php

namespace Arrow\Asset\Manifest;

class Ranker {

  function rank($dir, $items) {
    $loadOrder = $this->loadOrderFor($dir);
    $ranks     = array();
    $total     = count($items);

    for ($i = 0; $i < $total; $i++) {
      $item     = $items[$i];
      $info     = pathinfo($item);
      $filename = $info['filename'];
      $result   = array_search($filename, $loadOrder);

      /* if file is ahead in the load order, it's rank is higher */
      if ($result !== false) {
        $rank = 100000 - $result;
      } else {
        $rank = 10000 - $i;
      }

      $ranks[$rank] = $item;
    }

    krsort($ranks);

    return array_values($ranks);
  }

  function hasLoader($dir) {
    return file_exists($this->loaderPathFor($dir));
  }

  function loaderPathFor($dir) {
    return "$dir/.loader";
  }

  function loadOrderFor($dir) {
    if ($this->hasLoader($dir)) {
      return file($this->loaderPathFor($dir), FILE_IGNORE_NEW_LINES);
    } else {
      return array();
    }
  }

}
