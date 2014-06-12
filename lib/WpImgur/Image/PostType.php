<?php

namespace WpImgur\Image;

class PostType {

  function register() {
    register_post_type(
      $this->getName(), $this->getOptions()
    );
  }

  function create($postName, $content) {
    $post = array(
      'post_type'    => $this->getName(),
      'post_name'    => $this->toSlug($postName),
      'post_content' => $this->toJSON($content),
      'post_status'  => 'publish'
    );

    return wp_insert_post($post, true);
  }

  function find($postName) {
    $options = array(
      'post_type'      => $this->getName(),
      'name'           => $this->toSlug($postName),
      'paged'          => 1,
      'posts_per_page' => 1
    );

    $query = new \WP_Query($options);
    $posts = $query->get_posts();

    if (count($posts) === 1) {
      return $posts[0];
    } else {
      return false;
    }
  }

  function findBy($postNames, $pageNum = 1, $pageSize = 25) {
    $slugs = array_map(
      array($this, 'toSlug'), $postNames
    );

    $options = array(
      'post_type'      => $this->getName(),
      'names'          => $slugs,
      'paged'          => $pageNum,
      'posts_per_page' => $pageSize
    );

    $query = new \WP_Query($options);
    return $query->get_posts();
  }

  function findImages() {
    global $wpdb;
    $sql = <<<SQL
    SELECT id from $wpdb->posts
    WHERE
      post_type = 'attachment' AND
      post_mime_type LIKE 'image/%';
SQL;

    $images = $wpdb->get_results($sql, ARRAY_N);
    $ids = array();

    foreach ($images as $image) {
      array_push($ids, $image[0]);
    }

    return $ids;
  }

  function findImage($id) {
    return wp_get_attachment_metadata($id, true);
    $options = array(
      'post_type'      => 'attachment',
      'p'              => intval($id),
      'paged'          => 1,
      'posts_per_page' => 1
    );

    $query = new \WP_Query($options);
    $posts = $query->get_posts();

    if (count($posts) === 1) {
      return $posts[0];
    } else {
      return false;
    }
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

  /* helpers */
  function toSlug($postName) {
    return sanitize_title_with_dashes($postName, null, 'save');
  }

  function toJSON($content) {
    return json_encode($content);
  }

}
