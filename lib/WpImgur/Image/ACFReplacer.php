<?php

namespace WpImgur\Image;

class ACFReplacer {

  public $imageCollection;
  public $imageSrcReplacer;

  function needs() {
    return array('imageCollection', 'imageSrcReplacer');
  }

  function enable() {
    add_filter('acf/format_value/type=image', array($this, 'replaceSingle'), 10, 3);
    add_filter('acf/format_value/type=gallery', array($this, 'replaceGallery'), 10, 3);
    add_filter('acf/format_value/type=wysiwyg', array($this->imageSrcReplacer, 'replace'), 10, 3);
  }

  function replaceSingle( $image, $post_id, $field ) {

    if ($field['return_format'] == 'url') {
      $image = $this->replacementForSrc( $image );

    } elseif ($field['return_format'] == 'array' && !empty($image)) {
      $image = $this->replacementForArray( $image );
    }
    return $image;
  }

  function replaceGallery( $images, $post_id, $field ) {

    foreach ($images as &$image) {
      $image = $this->replacementForArray( $image );
    }
    return $images;
  }

  function replacementForSrc( $src ) {

    $path = pathinfo($src);
    $slug = $path['basename'];
    $this->imageCollection->didLoad = false;
    $this->imageCollection->load( Array($slug) );
    return $this->imageCollection->getImageUrl( $slug, 'original' );
  }

  function replacementForArray( $imageArray ) {

    $slug = $imageArray['filename'];
    $this->imageCollection->didLoad = false;
    $this->imageCollection->load( Array($slug) );

    $imageArray['sizes'] = $this->getImageSizes( $slug, $imageArray['url'], $imageArray['sizes'] );
    $imageArray['url'] = $this->imageCollection->getImageUrl( $slug, 'original' );

    return $imageArray;
  }

  function getImageSizes( $slug, $originalSrc, $imageSizes ) {

    foreach ($imageSizes as $sizeName => &$src) {
    if ( is_numeric($src) ) continue;

      $size = $imageSizes[ $sizeName . '-width'] . 'x' . $imageSizes[ $sizeName . '-height'];
      $src = ($src == $originalSrc)
                                ? $this->imageCollection->getImageUrl( $slug, 'original' )
                                : $this->imageCollection->getImageUrl( $slug, $size );
    }
    return $imageSizes;
  }

}