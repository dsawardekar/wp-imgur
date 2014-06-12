<?php

namespace WpImgur\Models;

class ImageStore {

  public $container;
  public $images;
  public $slug;
  public $sizes;

  function needs() {
    return array();
  }

  function hasImage($size) {

  }

  function addImage($size, $url) {

  }

  function removeImage($size, $url) {

  }

  function getImage($size) {

  }

  function save() {

  }

  function count() {
    return count($this->images);
  }

  function loadAttachment($id) {
    $images         = array();
    $attachmentMeta = wp_get_attachment_metadata($id);

    if ($attachmentMeta === false) {
      return $images;
    }

    $sizes  = $attachmentMeta['sizes'];
    $parent = $this->container->lookup('image');

    $attr = array(
      'width'  => $attachmentMeta['width'],
      'height' => $attachmentMeta['height'],
      'file'   => $attachmentMeta['file']
    );

    $parent->setKind('original');
    if (array_key_exists('image_meta', $attachmentMeta)) {
      $parent->setMeta($attachmentMeta['image_meta']);
    }

    $parent->setAttributes($attr);
    array_push($images, $parent);

    foreach ($sizes as $kind => $attr) {
      $image = $this->container->lookup('image');
      $image->setKind($kind);
      $image->setAttributes($attr);
      $image->setParent($parent);

      array_push($images, $image);
    }

    return $images;
  }


}
