<?php

namespace WpImgur\Image;

class Synchronizer {

  public $container;
  public $attachmentPostType;
  public $imageUploader;
  public $ajaxJsonPrinter;
  public $imgurAdapter;
  public $optionsStore;
  public $hookMode = false;

  function needs() {
    return array('attachmentPostType', 'imageUploader', 'ajaxJsonPrinter', 'optionsStore', 'imgurAdapter');
  }

  function enable() {
    if ($this->imgurAdapter->isAuthorized()) {
      add_action('added_post_meta', array($this, 'onAttachmentMetaChange'), 10, 4);
      add_action('updated_post_meta', array($this, 'onAttachmentMetaUpdate'), 10, 4);
    }
  }

  function onAttachmentMetaChange($metaId, $postId, $metaKey, $metaValue) {
    if ($metaKey === '_wp_attachment_metadata') {
      $this->hookMode = true;
      if ($this->optionsStore->getOption('syncOnMediaUpload')) {
        $this->sync($postId);
      }
    }
  }

  function onAttachmentMetaUpdate($metaId, $postId, $metaKey, $metaValue) {
    if ($metaKey === '_wp_attachment_metadata') {
      $this->hookMode = true;
      if ($this->optionsStore->getOption('syncOnMediaEdit')) {
        $this->sync($postId);
      }
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
      $error = "WP-Imgur Image Upload Failed: {$image->getUrl()} - " . $e->getMessage();

      if (!$this->hookMode) {
        $this->ajaxJsonPrinter->sendError($error);
      } elseif (!defined('PHPUNIT_RUNNER')) {
        /* errors inside hook mode are logged to avoid sending
         * invalid json.
         * TODO: Figure out a better solution
         */
        error_log($error);
      }
    }
  }

  function uploadImage($image) {
    if ($image->isUploadable()) {
      return $this->imageUploader->upload($image);
    } else {
      return false;
    }
  }

  /* helpers */
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

  function imageUrlExists($url) {
    try {
      $response = \Requests::head($url);
      return $response->status_code === 200 && $response->redirects === 0;
    } catch (\Exception $e) {
      return false;
    }
  }

}
