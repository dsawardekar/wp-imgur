=== wp-imgur ===
Contributors: dsawardekar
Donate link: http://pressing-matters.io/
Tags: imgur, CDN, Image CDN
Requires at least: 3.5.0
Tested up to: 3.9.2
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Stable tag: 0.7.1

CDN Plugin that serves your Media Library from Imgur.com.

== Description ==

WP-Imgur syncs your Media Library to [Imgur](http://imgur.com), and serves your images
from Imgur servers.


Features:

1. Syncs images from /wp-content to an Album on Imgur.
1. Auto Syncs new uploads.
1. Auto Syncs image edits.
1. Takes into account different image sizes.
1. Does not modify the Media Library, and is easily uninstallable.

== Installation ==

1. Click Plugins > Add New in the WordPress admin panel.
1. Search for "wp-imgur" and install.
1. After installation you will need to authorize the plugin to upload
images to your Imgur account.
1. Once authorized, Sync once to upload your existing Media Library.
1. That's it! All further uploads and edits are auto synced to the Imgur
servers. The images on your site are now being served from Imgur.com!

== Screenshots ==

1. Authorize WP-Imgur
2. Verify PIN
3. WP-Imgur Settings
4. WP-Imgur Sync
5. WP-Imgur Sync in Progress

== Credits ==

* Thanks to Alan Schaaf and the Imgur team.

== Upgrade Notice ==

* WP-Imgur requires PHP 5.3.2+

== Frequently Asked Questions ==

= Can I disable Auto-Sync? =

Yes. Auto-Sync can be disabled by unchecking the corresponding
checkboxes in the `Media Library Integration` section.

Note: You will need to manually sync if you disable Auto-Sync.

= Can I revert back to serving images from /wp-content? =

Yes. The plugin does not modify your Media Library in any manner. On
deactivation/uninstallation the image paths will immediately revert to the
/wp-content paths.

Additionally you may also empty the images synced to the Imgur Album by
using the `Cleanup` section.

== Changelog ==

= 0.7.1 =

* Updated default localizations.

= 0.7.0 =

* Switches to full handlebars for ember-i18n.

= 0.6.1 =

* Fixes build for missing `.coveralls.yml`

= 0.6.0 =

* First release or wordpress.org.

= 0.5.1 =

* Fixes media uploader settings save bug.

= 0.5.0 =

* Upgrades to Arrow 1.6.0.

= 0.4.2 =

* Adds optimized distribution. Does not include dev packages.

= 0.4.1 =

* Initial readme.txt.

= 0.4.0 =

* Initial Release on GitHub.
