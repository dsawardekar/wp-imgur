<?php
/*
Plugin Name: wp-imgur
Description: Serves your Media Library from imgur.com.
Version: 0.7.1
Author: Darshan Sawardekar
Author URI: http://pressing-matters.io/
Plugin URI: http://wordpress.org/plugins/wp-imgur
License: GPLv2
*/

require_once(__DIR__ . '/vendor/dsawardekar/arrow/lib/Arrow/ArrowPluginLoader.php');

function wp_imgur_main() {
  $options = array(
    'plugin' => 'WpImgur\Plugin',
    'arrowVersion' => '1.8.0'
  );

  ArrowPluginLoader::load(__FILE__, $options);
}

wp_imgur_main();
