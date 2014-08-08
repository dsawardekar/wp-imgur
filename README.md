# WP Imgur

WP-Imgur syncs your Media Library to [Imgur](http://imgur.com), and serves your images
from Imgur servers.

[![Build Status](https://travis-ci.org/dsawardekar/wp-imgur.svg?branch=develop)](https://travis-ci.org/dsawardekar/wp-imgur)
[![Code Coverage](https://coveralls.io/repos/dsawardekar/wp-imgur/badge.png?branch=develop)](https://coveralls.io/r/dsawardekar/wp-imgur?branch=develop)
[![Code Quality](https://scrutinizer-ci.com/g/dsawardekar/wp-imgur/badges/quality-score.png?b=develop)](https://scrutinizer-ci.com/g/dsawardekar/wp-imgur/?branch=develop)

## Features

1. Syncs images from /wp-content to an Album on Imgur.
1. Auto Syncs new uploads.
1. Auto Syncs image edits.
1. Takes into account different image sizes.
1. Does not modify the Media Library, and is easily uninstallable.

## Installation

Note: WP-Imgur requires PHP 5.3.2+

1. Click Plugins > Add New in the WordPress admin panel.
1. Search for "wp-imgur" and install.
1. After installation you will need to authorize the plugin to upload
images to your Imgur account.
1. Once authorized, Sync once to upload your existing Media Library.
1. That's it! All further uploads and edits are auto synced to the Imgur
servers. The images on your site are now being served from Imgur.com!

## Screenshots

Authorize
![Authorize WP-Imgur](https://i.imgur.com/c5PajHb.png)

Verify Pin
![Verify PIN](https://i.imgur.com/k9f4Tqg.png)

Settings
![WP-Imgur Settings](https://i.imgur.com/MkFEEgM.png)

Sync
![WP-Imgur Sync](https://i.imgur.com/LMbb4zL.png)

Sync in Progress
![WP-Imgur Sync in Progress](https://i.imgur.com/OjZWicH.png)


## Frequently Asked Questions

* Can I disable Auto-Sync?

Yes. Auto-Sync can be disabled by unchecking the corresponding
checkboxes in the `Media Library Integration` section.

Note: You will need to manually sync if you disable Auto-Sync.

* Can I revert back to serving images from /wp-content?

Yes. The plugin does not modify your Media Library in any manner. On
deactivation/uninstallation the image paths will immediately revert to the
/wp-content paths.

Additionally you may also empty the images synced to the Imgur Album by
using the `Cleanup` section.

