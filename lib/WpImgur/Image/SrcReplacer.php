<?php

namespace WpImgur\Image;

class SrcReplacer {

  public $container;
  public $imageCollection;

  public $variants   = array();
  public $prefix     = null;
  public $didReplace = false;

  public $srcPattern  = "/src=['\"]([^'\"]*?)['\"]/";
  public $hrefPattern = "/href=['\"]([^'\"]*?)['\"]/";

  function needs() {
    return array('imageCollection');
  }

  function enable() {
    add_filter('the_content', array($this, 'replace'), 90);
  }

  function replace($content) {
    $this->didReplace = false;
    $this->scan($content);

    if ($this->hasSlugs()) {
      $this->fetch($this->getSlugs());

      foreach ($this->variants as $src => $variant) {
        $size = $variant['size'];
        $slug = $variant['slug'];

        if ($this->imageCollection->hasImage($slug, $size)) {
          $replacement    = $this->imageCollection->getImageUrl($slug, $size);
          $content        = str_replace($src, $replacement, $content);
          $this->didReplace = true;
        }
      }
    }

    return $content;
  }

  function scan($content) {
    $this->variants  = array();

    $this->scanTag($content, 'img', $this->srcPattern);
    $this->scanTag($content, 'a', $this->hrefPattern);
  }

  function scanTag($content, $tag, $pattern) {
    $tagPattern = "/<{$tag}[^>]+>/";
    $result  = preg_match_all($tagPattern, $content, $matches);

    if ($result >= 1) {
      foreach ($matches[0] as $img) {
        $result = preg_match($pattern, $img, $match);

        if ($result === 1) {
          $src = $match[1];

          if ($this->replaceable($src)) {
            $this->variants[$src] = $this->variantFor($src);
          }
        }
      }
    }
  }

  function fetch($slugs) {
    $this->imageCollection->load($slugs);
  }

  function replaced() {
    return $this->didReplace;
  }

  /* helpers */
  function replaceablePrefix() {
    if (is_null($this->prefix)) {
      $uploads = wp_upload_dir();
      $this->prefix = $uploads['baseurl'];
    }

    return $this->prefix;
  }

  function replaceable($src) {
    return strpos($src, $this->replaceablePrefix()) === 0;
  }

  function getSlugs() {
    $slugs = array();

    foreach ($this->variants as $variant) {
      $slug         = $variant['slug'];
      $slugs[$slug] = true;
    }

    return array_keys($slugs);
  }

  function hasSlugs() {
    return count($this->variants) > 0;
  }

  function variantFor($src) {
    $info    = pathinfo($src);
    $base    = $info['basename'];
    $pattern = "/(\d+x\d+)\.[a-zA-Z]+$/";
    $result  = preg_match($pattern, $base, $match);
    $variant = array();

    if ($result === 1) {
      $size      = $match[1];
      $extension = $info['extension'];
      $slug      = str_replace("-{$size}.{$extension}", ".{$extension}", $base);
    } else {
      $slug = $base;
      $size = 'original';
    }

    $variant['slug'] = $slug;
    $variant['size'] = $size;

    return $variant;
  }

}
