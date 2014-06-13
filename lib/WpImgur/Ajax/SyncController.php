<?php

namespace WpImgur\Ajax;

class SyncController extends \Arrow\Ajax\Controller {

  public $container;
  public $attachmentPostType;
  public $imageUploader;

  function needs() {
    return array_merge(
      parent::needs(),
      array('attachmentPostType', 'imageUploader')
    );
  }

  function index() {
    $items = $this->attachmentPostType->findAll();
    //return array_slice($items, 0, 1);
    return array_slice($items, 0, 5);
    return $items;
  }

  function update() {
    $validator = $this->getValidator();
    $validator->rule('required', 'id');
    $validator->rule('integer', 'id');

    if ($validator->validate()) {
      $id        = $this->params['id'];
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
    } else {
      return $this->error($validator->errors());
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

  /* TODO: Does imgur do a redirect on existing images */
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
      $this->sendError("WP-Imgur Image Upload Failed: {$image->getUrl()} - " . $e->getMessage());
    }
  }

  function uploadImage($image) {
    if ($image->isUploadable()) {
      return $this->imageUploader->upload($image);
      //return array('id' => 'foo', 'link' => $image->getUrl());
    } else {
      return false;
    }
  }

}
