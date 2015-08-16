var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var babelify = require('babelify');
var pkg = require(__dirname + '/package.json');
var path = require('path');

gulp.task('js', function() {
    return compile(false);
});

gulp.task('js', function() {
    return compile(true);
});

gulp.task('watchify', function() {
    return compile(false, true);
});

function compile(isUglify, isWatch) {
    var entries = pkg.browserify.entryScripts;

    entries.map( function(entry) {
        var extname = path.extname(entry);
        var output = path.basename(entry, extname) + '.js';
        var bundler = null;

        bundler = getBundler(entry, isWatch);
        function bundle() {
            return bundler.bundle()
                .on('error', handleError)
                .pipe(source(output))
                .pipe(buffer())
                .pipe($.sourcemaps.init({ loadMaps: true }))
                .pipe($.if(isUglify, $.uglify()))
                .pipe($.sourcemaps.write('.'))
                .pipe(gulp.dest("frontend/javascripts/build"));
        }
        bundler.on('update', bundle);
        return bundle();
    });
}

function getBundler(entry, isWatch) {
    var bundler = null;
    options = { debug: true };
    if (isWatch) {
        options.cache = {};
        options.packageCache = {};
    }
    bundler = browserify(entry, options);

    if (isWatch) {
        bundler = watchify(bundler);
    }

    bundler.transform(babelify);
    return bundler;
}

function handleError() {
    var notify = require('gulp-notify');
    var args = Array.prototype.slice.call(arguments);
    notify
        .onError({
            title: 'Task Error',
            message: "<%= error %>"
        })
        .apply(this, args);

    this.emit('end');
}
