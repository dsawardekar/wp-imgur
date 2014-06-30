<?php

namespace WpImgur\Image;

class Collection {

  public $container;
  public $imagePostType;
  public $didLoad = false;
  public $images;

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
      $postName = $result[0];
      $postContent = $result[1];
      $images[$postName] = json_decode($postContent, true);
    }

    return $images;
  }

  function count() {
    return count($this->images);
  }

  function hasImage($postName, $size) {
    $slug = $this->toSlug($postName);

    /* for standard sizes, we only need to know if original
     * exists */
    if ($this->isStandardSize($size)) {
      $size = 'original';
    }

    return array_key_exists($slug, $this->images) &&
      array_key_exists($size, $this->images[$slug]);
  }

  function getImageUrl($postName, $size) {
    $slug = $this->toSlug($postName);

    if (!$this->isStandardSize($size)) {
      return $this->images[$slug][$size];
    } else {
      return $this->getStandardUrl($slug, $size);
    }
  }

  function getStandardUrl($slug, $size) {
    $original  = $this->images[$slug]['original'];
    $info      = pathinfo($original);
    $extension = $info['extension'];
    $suffix    = Image::$standardSizes[$size];

    return $info['dirname'] . '/' . $info['filename'] . $suffix . '.' . $extension;
  }

  function toSlug($postName) {
    return $this->imagePostType->toSlug($postName);
  }

  function isStandardSize($size) {
    return array_key_exists($size, Image::$standardSizes);
  }

}
