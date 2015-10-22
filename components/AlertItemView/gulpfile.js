var gulp = require('gulp');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');
var streamqueue = require('streamqueue');
var html2jsobject = require('gulp-html2jsobject');

var styles = ['alertItemView.css'];
var scripts = ['AlertItemView.js'];
var templates = ['expanded.html', 'collapsed.html'];
var images = ['class0.png', 'class1.png', 'class2.png', 'class3.png'];

gulp.task('default', function() {
    var sourcesStream = gulp.src(scripts);

    var templatesStream = gulp.src(templates)
        .pipe(html2jsobject('nsGmx.Templates.AlertItemView'))
        .pipe(concat('templates.js'))
        .pipe(header('nsGmx.Templates.AlertItemView = {};\n'))
        .pipe(header('nsGmx.Templates = nsGmx.Templates || {};'))
        .pipe(header('var nsGmx = nsGmx || {};'));

    var cssStream = gulp.src(styles)
        .pipe(concat('alertItemView.css'));

    var imgStream = gulp.src(images);

    var jsStream = streamqueue({
            objectMode: true
        }, templatesStream, sourcesStream)
        .pipe(footer(';'))
        .pipe(concat('alertItemView.js'));

    var finalStream = streamqueue({
            objectMode: true
        }, jsStream, cssStream, imgStream)
        .pipe(gulp.dest('build'));
});

gulp.task('watch', ['default'], function() {
    console.log([].concat(styles, scripts, templates));
    gulp.watch([].concat(styles, scripts, templates), ['default']);
});