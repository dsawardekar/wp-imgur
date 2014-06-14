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

  function update($id, $content) {
    $post = array(
      'ID'           => $id,
      'post_content' => $this->toJSON($content)
    );

    return wp_update_post($post, true);
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
      $post    = $posts[0];
      $content = $post->post_content;
      return $this->toImages($content);
    } else {
      return false;
    }
  }

  function findBy($postNames, $pageNum = 1, $pageSize = 25) {
    global $wpdb;

    $inClause = $this->inClauseFor('post_name', $postNames);
    $sql = <<<SQL
    SELECT post_name, post_content
    From $wpdb->posts
    WHERE
      post_type = 'imgur_image'
SQL;

    if ($inClause !== '') {
      $sql .= "AND $inClause;";
    }

    return $wpdb->get_results($sql, ARRAY_N);
  }

  function inClauseFor($column, $items) {
    global $wpdb;

    $n = count($items);
    if ($n === 0) {
      return '';
    }

    $sql = $column . ' IN (';

    for ($i = 0; $i < $n; $i++) {
      $item = $this->toSlug($items[$i]);
      $sql .= $wpdb->prepare('%s', $item);

      if ($i < ($n - 1)) {
        $sql .= ',';
      }
    }

    $sql .= ')';

    return $sql;
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
      'can_export'          => true,
      'delete_with_user'    => false
    );
  }

  /* helpers */
  function toSlug($postName) {
    return sanitize_title_with_dashes($postName, null, 'save');
  }

  function toJSON($content) {
    return json_encode($content);
  }

  function toImages($content) {
    $images = json_decode($content, true);
    if (is_array($images)) {
      return $images;
    } else {
      return array();
    }
  }

}
