<?php

namespace WpImgur\Attachment;

class PostType {

  public $container;

  function needs() {
    return array();
  }

  function getName() {
    return 'attachment';
  }

  function findAll() {
    global $wpdb;
    $sql = <<<SQL
    SELECT id from $wpdb->posts
    WHERE
      post_type = 'attachment' AND
      post_mime_type LIKE 'image/%';
SQL;

    $images = $wpdb->get_results($sql, ARRAY_N);
    $ids    = array();

    foreach ($images as $image) {
      array_push($ids, $image[0]);
    }

    return $ids;
  }

  function find($id) {
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
