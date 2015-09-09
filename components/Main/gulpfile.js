var gulp = require('gulp');
var iife = require('gulp-iife');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');
var streamqueue = require('streamqueue');
var html2jsobject = require('gulp-html2jsobject');

var styles = ['main.css'];
var scripts = ['NewsLayersManager.js', 'core.js', 'map.js', 'layers.js', 'widgets.js', 'tail.js'];
var images = ['tiny-grid.png'];
var templates = ['main.html'];

gulp.task('default', function() {
    var sourcesStream = gulp.src(scripts);

    var templatesStream = gulp.src(templates)
        .pipe(html2jsobject('nsGmx.Templates.Main'))
        .pipe(concat('templates.js'))
        .pipe(header('nsGmx.Templates.Main = {};\n'))
        .pipe(header('nsGmx.Templates = window.nsGmx.Templates || {};'))
        .pipe(header('var nsGmx = window.nsGmx || {};'));

    var cssStream = gulp.src(styles)

    var imgStream = gulp.src(images);

    var jsStream = streamqueue({
            objectMode: true
        }, templatesStream, sourcesStream)
        .pipe(footer(';'))
        .pipe(concat('main.js'))
        .pipe(iife());

    var finalStream = streamqueue({
            objectMode: true
        }, jsStream, cssStream, imgStream)
        .pipe(gulp.dest('build'));
});

gulp.task('watch', ['default'], function() {
    console.log([].concat(styles, scripts, templates));
    gulp.watch([].concat(styles, scripts, templates), ['default']);
});
