var version = '1.5.6';

Package.describe({
  version: version,
  name: 'keplerjs:photos',
  summary: 'keplerjs plugin for manage photos',
  git: "https://github.com/Keplerjs/Kepler.git"
});

Npm.depends({
  'imagemagick': '0.1.3',
  'viewerjs': '1.3.0',
  //'gm': '1.23.1'
  ////https://github.com/CollectionFS/Meteor-cfs-graphicsmagick
  /////https://www.npmjs.com/package/gm
});

Package.onUse(function(api) {
  api.use([
    'keplerjs:core@'+version,
    'keplerjs:upload@'+version,
  ]);

  api.versionsFrom("1.5.1");

  api.addFiles([ 
    '.npm/package/node_modules/viewerjs/dist/viewer.js',
    '.npm/package/node_modules/viewerjs/dist/viewer.css',
  ],'client');

  api.addFiles([
    'plugin.js',
    'i18n/it.js',
    'i18n/en.js',
    'i18n/de.js',
    'i18n/es.js',
    'i18n/fr.js',	
    'i18n/sv.js', 
  ]);

  api.addFiles([
    'collections/photos.js'
  ]);

  api.addFiles([ 
    'client/views/panels.html',
    'client/views/panels.js',
    'client/views/markers.html',
    'client/stylesheets/lib.css',
    'client/stylesheets/main.css',
    //'client/router.js',
  ],'client');

  api.addFiles([
    //'server/gm.js',
    'server/photos.js',
    'server/profile.js',
    'server/places.js',
    'server/pubs.js',
  ],'server');

});
