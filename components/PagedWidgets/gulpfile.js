var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', function() {
    return gulp.src([
        'PagedWidget.js',
        'ModelPagedWidget.js',
        'CollectionPagedWidget.js'
    ])
        .pipe(concat('pagedWidgets.js'))
        .pipe(gulp.dest('build'));
});
