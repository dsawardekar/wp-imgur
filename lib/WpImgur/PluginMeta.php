<?php

namespace WpImgur;

class PluginMeta extends \Arrow\PluginMeta {

  function __construct($file) {
    parent::__construct($file);

    $this->version = Version::$version;
  }

  function getDefaultOptions() {
    return array(
      'accessToken'       => '',
      'refreshToken'      => '',
      'accessTokenExpiry' => strtotime('-1 hour'),
      'album'             => '',
      'uploadMode'        => 'push',
      'syncOnMediaUpload' => true,
      'syncOnMediaEdit'   => true
    );
  }

  function getOptionsContext() {
    $imgurAdapter = $this->container->lookup('imgurAdapter');
    $optionsStore = $this->container->lookup('optionsStore');

    return array(
      'authorized'        => $imgurAdapter->isAuthorized(),
      'authorizeUrl'      => $imgurAdapter->authorizeUrl(),
      'syncOnMediaUpload' => $optionsStore->getOption('syncOnMediaUpload'),
      'syncOnMediaEdit'   => $optionsStore->getOption('syncOnMediaEdit'),
      'uploadMode'        => $optionsStore->getOption('uploadMode'),
      'album'             => $optionsStore->getOption('album'),
      'siteUrl'           => site_url(),
    );
  }

  function localize() {
    $this->__('tab.sync');
    $this->__('tab.settings');
    $this->__('credits.tagline');

    $this->__('status.settings.saved');
    $this->__('status.settings.saving');

    $this->__('help.sync');
    $this->__('help.sync-active');

    $this->__('button.start-sync');
    $this->__('button.stop-sync');
    $this->__('status.sync.starting');
    $this->__('status.sync.stopped');

    $this->__('section.auth.title');
    $this->__('section.auth.verifypin');
    $this->__('section.auth.authorized');
    $this->__('section.auth.unauthorized');
    $this->__('button.reauthorize');

    $this->__('section.mediaintegration.title');
    $this->__('section.mediaintegration.help');
    $this->__('button.sync-on-upload');
    $this->__('button.sync-on-edit');
    $this->__('button.save-changes');

    $this->__('button.cleanup');
    $this->__('section.cleanup.title');
    $this->__('section.cleanup.help');
    $this->__('button.empty-album');
    $this->__('album');
    $this->__('button.cancel');

    $this->__('status.error');
    $this->__('status.sync.synchronizing');
    $this->__('status.sync.completed');

    $this->__('status.authorize.success');
    $this->__('status.cleanup.start');
    $this->__('status.cleanup.failed');
    $this->__('status.cleanup.success');
  }

}
