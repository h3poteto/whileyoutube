var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var pkg = require(__dirname + '/package.json');
var path = require('path');
var es = require('event-stream');
var fs = require('fs-extra');
var browserSync = require('browser-sync').create();


gulp.task('js', function() {
    return compile(false);
});

gulp.task('js-release', function() {
    return compile(true);
});

gulp.task('watchify', function() {
    return compile(false, true);
});

gulp.task('watch', function() {
    gulp.watch('frontend/javascripts/src/*.js', ['js']);
});


function compile(isUglify, isWatch) {
    var entries = pkg.browserify.entryScripts;

    var tasks = entries.map( function(entry) {
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
                .pipe($.duration("compiled :" + entry))
                .pipe($.if(isUglify, $.uglify()))
                .pipe($.sourcemaps.write('.'))
                .pipe(gulp.dest("frontend/javascripts/build"))
                .pipe($.tap(function(){
                    fs.copySync("frontend/javascripts/build/" + output + ".map", "public/assets/" + output + ".map");
                }));
        }
        bundler.on('update', bundle);
        return bundle();
    });
    es.merge.apply(null, tasks);
}

function getBundler(entry, isWatch) {
    var bundler = null;
    var options = { debug: true };
    if (isWatch) {
        options.cache = {};
        options.packageCache = {};
        options.fullPaths = true;
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
