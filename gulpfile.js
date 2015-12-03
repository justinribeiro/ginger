var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    del = require('del');

var SRCDIR = 'src';
var BUILDDIR = 'build';
var TMPDIR = 'tmp';
var GINGER = 'ginger.js';

// Remove BUILDDIR and TMPDIR.
gulp.task('clean', function() {
  return del([BUILDDIR + '/**/*', TMPDIR]);
});

// Copy all files in SRCDIR except for the javascript source.
gulp.task('copy', ['clean'], function() {
  return gulp.src([
    SRCDIR + '/**/*',
    '!' + SRCDIR + '/js/**/*'
  ]).pipe(gulp.dest(BUILDDIR));
});

// Concatenates all the javascript and places it into TMPDIR.
gulp.task('concat', ['clean'], function() {
  return gulp.src('src/js/**/*.js')
    .pipe(concat(GINGER))
    .pipe(gulp.dest(TMPDIR));
});

// Uglifies the concatenated javascript and copies it into the build.
gulp.task('uglify', ['copy', 'concat'], function() {
  return gulp.src(TMPDIR + '/' + GINGER)
    .pipe(uglify())
    .pipe(gulp.dest(BUILDDIR + '/js'));
});

// Basically the uglify task without the uglification.
gulp.task('prettify', ['copy', 'concat'], function() {
  return gulp.src(TMPDIR + '/' + GINGER)
    .pipe(gulp.dest(BUILDDIR + '/js'));
});

// Watch javascript source files and run the debug task when they change.
gulp.task('watch', ['debug'], function() {
  gulp.watch([
    SRCDIR + '/**/*'
  ], ['debug']);
});

gulp.task('debug', ['copy', 'prettify']);

gulp.task('default', ['copy', 'uglify']);
