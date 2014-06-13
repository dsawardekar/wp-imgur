<?php

namespace WpImgur\Attachment;

class Packager {

  function onInject($container) {
    $container
      ->singleton('attachmentPostType', 'WpImgur\Attachment\PostType');
  }

}
