<?php

namespace WpImgur;

class ImagePostType {

  function register() {
    register_post_type(
      $this->getName(), $this->getOptions()
    );
  }

  function getName() {
    return 'imgur_image';
  }

  function getOptions() {
    return array(
      'public'              => false,
      'exclude_from_search' => true,
      'publicly_queryable'  => false,
      'show_ui'             => false,
      'hierarchical'        => false,
      'rewrite'             => false,
      'query_var'           => false,
      'can_export'          => true
    );
  }

}
