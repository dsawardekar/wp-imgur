<?php

namespace WpImgur\Image;

class Collection {

  public $container;
  public $imagePostType;
  public $didLoad = false;

  function needs() {
    return array('imagePostType');
  }

  function loaded() {
    return $this->didLoad;
  }

  function load($postNames) {
    if ($this->loaded()) {
      return;
    }

    $this->images  = $this->fetch($postNames);
    $this->didLoad = true;
  }

  function fetch($postNames) {
    $results = $this->imagePostType->findBy($postNames);
    $images  = array();

    foreach ($results as $result) {
      $images[$result->post_name] = json_decode($result->post_content, true);
    }

    return $images;
  }

  function count() {
    return count($this->images);
  }

  function hasImage($postName, $size) {
    $slug = $this->toSlug($postName);

    return array_key_exists($slug, $this->images) &&
      array_key_exists($size, $this->images[$slug]);
  }

  function getImageUrl($postName, $size) {
    $slug = $this->toSlug($postName);
    return $this->images[$slug][$size];
  }

  function toSlug($postName) {
    return $this->imagePostType->toSlug($postName);
  }

}
