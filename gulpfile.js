/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

var gulp = require('gulp');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var del = require('del');
var vulcanize = require('gulp-vulcanize');
var merge = require('merge-stream');
var glob = require('glob');
var crypto = require('crypto');
var rename = require('gulp-rename');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var concat = require('gulp-concat');
var minifyHTML = require('gulp-minify-html');
var minifyInline = require('gulp-minify-inline');
var packageJson = require('./package.json');

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('copy', ['clean'], function() {
  var app = gulp.src([
      'app/static/**/*',
      '!app/static/index.html',
      '!app/static/scripts/**/*',
      '!app/static/elements/**/*',
      '!app/static/bower_components/**/*'
    ])
    .pipe(gulp.dest('dist/static'));

  var bower = gulp.src([
    'app/static/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill,three.js,clipboard}/**/*'
  ])
  .pipe(gulp.dest('dist/static/bower_components'));

  return merge(app, bower);
});

gulp.task('html', ['clean'], function() {
  return gulp.src('app/static/index.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulp.dest('dist/static'));
});

gulp.task('concat', ['clean'], function() {
  return gulp.src('app/static/index.html')
    .pipe(useref())
    .pipe(gulpif('*.js', concat('scripts/app.js')))
    .pipe(gulp.dest('tmp/static'))
    .pipe(gulp.dest('dist/static'));
});

gulp.task('vulcanize', ['copy'], function() {
  return gulp.src('app/static/elements/elements.html')
      .pipe(vulcanize({
        stripComments: true,
        inlineScripts: true
      }))
      // .pipe(crisper({
      //   scriptInHead: true,
      //   onlySplit: false
      // }))
      .pipe(gulp.dest('dist/static/elements'));
});

gulp.task('html:compress', ['html', 'copy'], function() {
  return gulp.src('tmp/static/index.html')
    .pipe(useref())
    .pipe(minifyInline({js: false}))
    .pipe(minifyHTML())
    .pipe(gulp.dest('dist/static'));
});

// Generate config data for the <sw-precache-cache> element.
// This include a list of files that should be precached, as well as a (hopefully unique) cache
// id that ensure that multiple PSK projects don't share the same Cache Storage.
// This task does not run by default, but if you are interested in using service worker caching
// in your project, please enable it within the 'default' task.
// See https://github.com/PolymerElements/polymer-starter-kit#enable-service-worker-support
// for more context.
gulp.task('cache-config', ['copy'], function(callback) {
  var dir = 'dist/static';
  var config = {
    cacheId: packageJson.name,
    disabled: false
  };

  glob('{model,scripts,images}/**/*.*', {cwd: dir}, function(error, files) {
    if (error) {
      callback(error);
    } else {
      files.push(
        '/',
        'bower_components/webcomponentsjs/webcomponents-lite.min.js',
        'bower_components/three.js/three.min.js',
        'bower_components/clipboard/dist/clipboard.min.js',
        'elements/elements.html'
      );
      config.precache = files;

      var md5 = crypto.createHash('md5');
      md5.update(JSON.stringify(config.precache) + new Date().getTime().toString());
      config.precacheFingerprint = md5.digest('hex');

      var configPath = path.join(dir, 'cache-config.json');
      fs.writeFile(configPath, JSON.stringify(config), callback);
    }
  });
});

gulp.task('watch', ['dev'], function() {
  gulp.watch([
      'app/static/index.html',
      'app/static/favicon.ico',
      'app/static/{scripts,elements,styles}/**/*',
      'content/content/blog/**/*'
    ], ['dev']);
});

gulp.task('dev', ['clean', 'concat', 'vulcanize']);

gulp.task('default', ['clean', 'html', 'html:compress', 'vulcanize', 'cache-config']);
