<?php

namespace Arrow\Twig;

class Compiler {

  public $twigEnvironment;

  function needs() {
    return array('twigEnvironment');
  }

  function compile($sourceDirs) {
    foreach ($sourceDirs as $sourceDir) {
      $this->compileDir($sourceDir);
    }
  }

  function compileDir($sourceDir) {
    $templates = $this->templateNamesInDir($sourceDir);

    foreach ($templates as $template) {
      $this->compileTemplate($template);
    }
  }

  function compileTemplate($templateName) {
    $this->twigEnvironment->loadTemplate($templateName);
  }

  function templateNamesInDir($dir) {
    $templates = $this->templatesInDir($dir);
    return array_map(array($this, 'templateNameFor'), $templates);
  }

  function templatesInDir($dir) {
    return glob($this->globForDir($dir));
  }

  function templateNameFor($filepath) {
    return basename($filepath);
  }

  function globForDir($dir) {
    return "$dir/*.twig";
  }

}
