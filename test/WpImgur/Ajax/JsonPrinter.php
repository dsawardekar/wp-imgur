<?php

namespace WpImgur\Ajax;

class JsonPrinter {

  public $success;
  public $error;

  function sendSuccess($data, $statusCode = 200) {
    $this->success = $data;
  }

  function sendError($data, $statusCode = 404) {
    $this->error = $data;
  }

}
