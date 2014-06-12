<?php

namespace WpImgur\Image;

class Store {

  public $container;
  public $imagePostType;

  public $images  = array();
  public $slug    = null;
  public $didLoad = false;
  public $id      = 0;

  function needs() {
    return array('imagePostType');
  }

  function hasImage($size) {
    return array_key_exists($size, $this->images);
  }

  function addImage($size, $url) {
    $this->images[$size] = $url;
  }

  function removeImage($size) {
    unset($this->images[$size]);
  }

  function count() {
    return count($this->images);
  }

  function getImageUrl($size) {
    return $this->images[$size];
  }

  function getSlug() {
    return $this->slug;
  }

  function setSlug($slug) {
    $this->slug = $slug;
  }

  function loaded() {
    return $this->didLoad;
  }

  function load() {
    if ($this->loaded()) {
      return;
    }

    $this->images  = $this->imagePostType->find($this->getSlug());
    $this->didLoad = true;
  }

  function exists() {
    return $this->id !== 0;
  }

  function save() {
    if ($this->exists()) {
      $result = $this->imagePostType->update(
        $this->id, $this->images
      );
    } else {
      $result = $this->imagePostType->create(
        $this->getSlug(), $this->images
      );

      if (!is_wp_error($result)) {
        $this->id = $result;
      }
    }

    if (is_wp_error($result)) {
      throw new \Exception($result->get_error_message());
    } else {
      return true;
    }
  }

}
