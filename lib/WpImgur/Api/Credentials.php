<?php

namespace WpImgur\Api;

class Credentials extends \Imgur\Credentials {

  public $optionsStore;

  protected $clientId     = '1c354b6654a4a6d';
  protected $clientSecret = '48535b387a4b995b370d3cbbacaffca94b125da2';

  protected $didLoad      = false;

  function needs() {
    return array('optionsStore');
  }

  function loaded() {
    return $this->didLoad;
  }

  function load() {
    if ($this->loaded()) {
      return;
    }

    $this->optionsStore->load();
    $this->didLoad = true;
  }

  function save() {
    $this->optionsStore->save();
  }

  /* overridden to use credentials stored in options */
  function getAccessToken() {
    return $this->getOption('accessToken');
  }

  function setAccessToken($accessToken) {
    $this->setOption('accessToken', $accessToken);
  }

  function getAccessTokenExpiry() {
    return $this->getOption('accessTokenExpiry');
  }

  function setAccessTokenExpiry($expireIn) {
    $expiry   = strtotime("+{$expireIn} seconds");
    $this->setOption('accessTokenExpiry', $expiry);
  }

  function getRefreshToken() {
    return $this->getOption('refreshToken');
  }

  function setRefreshToken($refreshToken) {
    $this->setOption('refreshToken', $refreshToken);
  }

  /* helpers */
  function getOption($name) {
    return $this->optionsStore->getOption($name);
  }

  function setOption($name, $value) {
    $this->optionsStore->setOption($name, $value);
  }

}
