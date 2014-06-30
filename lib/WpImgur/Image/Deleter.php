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
    $images  = array();
    $post    = $this->imagePostType->findOne($postId);
    if ($post === false) {
      return $images;
    }

    $content = $post->post_content;
    $json    = json_decode($content, true);

    if (is_array($json)) {
      foreach ($json as $key => $variant) {
        array_push($images, $variant);
      }
    }

    return $images;
  }

  function deleteImgurImage($imageId) {
    try {
      return $this->imgurImageRepo->delete($imageId);
    } catch (\Imgur\Exception $err) {
      if ($err->getMessage() === 'Image not found') {
        /* we'll ignore 404, assuming that image was already deleted */
        return true;
      } else {
        throw $err;
      }
    }
  }

  function getImageId($url) {
    $urlParts = parse_url($url);

    if ($urlParts !== false && array_key_exists('host', $urlParts) && strstr($urlParts['host'], 'imgur.com')) {
      $info = pathinfo($urlParts['path']);
      return $info['filename'];
    } else {
      return false;
    }
  }

}
