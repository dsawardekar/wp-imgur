<?php

namespace Arrow\Twig;

class Packager {

  public $pluginMeta;

  function needs() {
    return array('pluginMeta');
  }

  function onInject($container) {
    $container
      ->object('twigOptions'     , array($this, 'getTwigOptions'))
      ->object('twigLoader'      , array($this, 'getTwigLoader'))
      ->object('twigEnvironment' , array($this, 'getTwigEnvironment'))
      ->singleton('templateRenderer', 'Arrow\Twig\Renderer');
  }

  /* initializers */
  function getTwigLoader($container) {
    $twigLoader = new \Twig_Loader_Filesystem($this->getTemplateDirs());
    return $twigLoader;
  }

  function getTwigEnvironment($container) {
    $twigEnvironment = new \Twig_Environment(
      $container->lookup('twigLoader'),
      $container->lookup('twigOptions')
    );

    return $twigEnvironment;
  }

  function getTwigOptions() {
    $options = array();

    if ($this->getCacheEnabled()) {
      $options['cache'] = $this->getCacheDir();
    } else {
      $options['cache'] = false;
    }

    return $options;
  }

  /* templates dir */
  function getTemplateDirs() {
    $dirs = array();
    if ($this->hasCustomTemplatesDir()) {
      array_push($dirs, $this->getCustomTemplatesDir());
    } else {
      array_push($dirs, $this->getTemplatesDir());
    }

    return $dirs;
  }

  function getTemplatesDir() {
    return $this->pluginMeta->getDir() . '/templates';
  }

  function getCacheDir() {
    if ($this->hasCustomCacheDir()) {
      return $this->getCustomCacheDir();
    } else {
      return $this->pluginMeta->getDir() . '/dist/templates';
    }
  }

  /* custom templates dir inside current theme */
  function getCustomTemplatesDir() {
    return get_stylesheet_directory() . '/' . $this->pluginMeta->getSlug() . '/templates';
  }

  function hasCustomTemplatesDir() {
    return $this->dirExists($this->getCustomTemplatesDir());
  }

  /* custom cache dir inside current theme */
  function getCustomCacheDir() {
    return get_stylesheet_directory() . '/' . $this->pluginMeta->getSlug() . '/dist/templates';
  }

  function hasCustomCacheDir() {
    return $this->dirExists($this->getCustomCacheDir());
  }

  function getCacheEnabled() {
    return $this->dirExists($this->getCacheDir());
  }

  function dirExists($dir) {
    return $dir !== false && is_dir($dir);
  }

}
