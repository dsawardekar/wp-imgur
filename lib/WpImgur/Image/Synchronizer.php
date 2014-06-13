<?php

namespace WpImgur\Image;

class Synchronizer {

  public $container;
  public $attachmentPostType;
  public $imageUploader;

  function needs() {
    return array('attachmentPostType', 'imageUploader', 'ajaxJsonPrinter');
  }

  function enable() {
    add_action('added_post_meta', array($this, 'onAttachmentMetaChange'), 10, 4);
  }

  function onAttachmentMetaChange($metaId, $postId, $metaKey, $metaValue) {
    if ($metaKey === '_wp_attachment_metadata') {
      $this->sync($postId);
    }
  }

  function sync($id) {
    $images    = $this->imagesForAttachment($id);
    $thumbnail = '';
    $name      = '';

    if (count($images) > 0) {
      $image      = $images[0];
      $slug       = $this->slugForImage($image);
      $imageStore = $this->imageStoreFor($slug);
      $name       = basename($image->getFilename());

      foreach ($images as $image) {
        $link = $this->syncImage($image, $imageStore);
        if ($image->getKind() === 'thumbnail') {
          $thumbnail = $link;
        }
      }

      $imageStore->save();
    } else {
      $name = "Skipped $id";
    }

    return array(
      'id' => $id,
      'name' => $name,
      'thumbnail' => $thumbnail
    );
  }

  function imagesForAttachment($id) {
    return $this->attachmentPostType->find($id);
  }

  function slugForImage($image) {
    return basename($image->getFilename());
  }

  function imageStoreFor($slug) {
    $imageStore = $this->container->lookup('imageStore');
    $imageStore->setSlug($slug);
    $imageStore->load();

    return $imageStore;
  }

  function syncImage($image, $imageStore) {
    $size = $image->getSize();

    if (!$imageStore->hasImage($size)) {
      return $this->uploadAndSave($image, $imageStore);
    } elseif (!$this->imageUrlExists($imageStore->getImageUrl($size))) {
      return $this->uploadAndSave($image, $imageStore);
    } else {
      return $imageStore->getImageUrl($size);
    }
  }

  function imageUrlExists($url) {
    $response = \Requests::head($url);
    return $response->status_code === 200 && $response->redirects === 0;
  }

  function uploadAndSave($image, $imageStore) {
    try {
      $uploadedImage = $this->uploadImage($image);
      if ($uploadedImage !== false) {
        $link = $uploadedImage['link'];
        $imageStore->addImage($image->getSize(), $link);

        return $link;
      } else {
        return null;
      }
    } catch (\Imgur\Exception $e) {
      $this->ajaxJsonPrinter->sendError("WP-Imgur Image Upload Failed: {$image->getUrl()} - " . $e->getMessage());
    }
  }

  function uploadImage($image) {
    if ($image->isUploadable()) {
      //return $this->imageUploader->upload($image);
      return array('id' => 'foo', 'link' => $image->getUrl());
    } else {
      return false;
    }
  }
}
