<?php

namespace WpImgur\Models;

class Image {

  static public $standardSizes = array(
    '90x90'     => 's',
    '160x160'   => 't',
    '320x320'   => 'm',
    '640x640'   => 'l',
    '1024x1024' => 'h'
  );

  function findAll($attachmentMeta) {
    $images = array();
    $sizes  = $attachmentMeta['sizes'];
    $image  = $this->container->lookup('image');

    $attr = array(
      'width'  => $attachmentMeta['width'],
      'height' => $attachmentMeta['height'],
      'file'   => $attachmentMeta['file']
    );

    $image->setKind('original');
    $image->setMeta($attachmentMeta['image_meta']);
    $image->setAttributes($attr);
    array_push($images, $image);

    foreach ($sizes as $kind => $attr) {
      $image = $this->container->lookup('image');
      $image->setAttributes($attr);

      array_push($images, $image);
    }

    return $images;
  }

  public $container;
  public $attributes;
  public $kind;
  public $parent = null;
  public $meta   = null;

  function needs() {
    return array();
  }

  function setAttributes($attributes) {
    $this->attributes = $attributes;
  }

  function getAttributes() {
    return $this->attributes;
  }

  function getAttribute($key) {
    if (array_key_exists($key, $this->attributes)) {
      return $this->attributes[$key];
    } else {
      return null;
    }
  }

  function setKind($kind) {
    $this->kind = $kind;
  }

  function getKind() {
    return $this->kind;
  }

  function getParent() {
    return $this->parent;
  }

  function setParent($parent) {
    $this->parent = $parent;
  }

  function getMeta() {
    return $this->meta;
  }

  function setMeta($meta) {
    $this->meta = $meta;
  }

  function getWidth() {
    return $this->getAttribute('width');
  }

  function getHeight() {
    return $this->getAttribute('height');
  }

  function getMimeType() {
    return $this->getAttribute('mime-type');
  }

  function getFilename() {
    return $this->getAttribute('file');
  }

  function getFilepath() {
    return $this->toImagePath('basedir');
  }

  function fileExists() {
    return file_exists($this->getFilepath());
  }

  function getUrl() {
    return $this->toImagePath('baseurl');
  }

  function toImagePath($key) {
    $uploads = wp_upload_dir();
    $basedir = $uploads[$key];

    if ($this->hasParent()){
      $parentFilename = $this->getParent()->getFilename();
      $dir            = dirname($parentFilename);

      if ($dir === '.') {
        return $basedir . '/' . $this->getFilename();
      } else {
        return $basedir . '/' . $dir . '/' . $this->getFilename();
      }
    } else {
      return $basedir . '/' . $this->getFilename();
    }
  }

  function isCustomSize() {
    $key = $this->getWidth() . 'x' . $this->getHeight();
    return array_key_exists($key, self::$standardSizes);
  }

  function isOriginal() {
    return $this->getKind() === 'original';
  }

  function hasParent() {
    return !is_null($this->getParent());
  }

}
