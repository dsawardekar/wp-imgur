<?php

namespace Arrow\Asset;

class StylesheetLoader extends AssetLoader {

  public function assetType() {
    return 'stylesheet';
  }

  /* we want to enqueue plugin styles alongside scripts */
  function enqueueAction() {
    return 'wp_enqueue_scripts';
  }

}
