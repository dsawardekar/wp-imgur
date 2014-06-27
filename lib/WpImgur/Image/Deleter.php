<?php

namespace WpImgur\Image;

class Deleter {

  public $container;
  public $imgurImageRepo;
  public $imagePostType;

  function needs() {
    return array('imgurImageRepo', 'imagePostType');
  }

  function delete($postId) {
    $images = $this->getImgurImages($postId);
    foreach ($images as $url) {
      $imageId = $this->getImageId($url);
      if ($imageId !== false) {
        $this->deleteImgurImage($imageId);
      }
    }

    return $this->imagePostType->delete($postId);
  }

  function getImgurImages($postId) {
    $post    = $this->imagePostType->findOne($postId);
    $content = $post->post_content;
    $json    = json_decode($content, true);
    $images  = array();

    if (is_array($json)) {
      foreach ($json as $key => $variant) {
        array_push($images, $variant);
      }
    }

    return $images;
  }

  function deleteImgurImage($imageId) {
    return $this->imgurImageRepo->delete($imageId);
  }

  function getImageId($url) {
    $urlParts = parse_url($url);

    if (array_key_exists('host', $urlParts) && strstr($urlParts['host'], 'imgur.com')) {
      $info = pathinfo($urlParts['path']);
      return $info['filename'];
    } else {
      return false;
    }
  }

}
