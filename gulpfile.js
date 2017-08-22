/* Titan Gulp Tasker Version: 2.0 ------------------------------------------ */
/*                                                                           */
/* IMPORTANT: Please install all dependencies by running:                    */
/* "$ npm install" : Installs all required node modules                      */
/* "$ bower install" : Installs all required project dependencies            */
/*                                                                           */
/* In addition, you can update your project dependencies by running:         */
/* "$ bower update" : Installs all required project dependencies             */
/*                                                                           */
/* The following tasks are available to you after dependency intallation:    */
/* gulp : Spools up a server for static HTML files                           */
/* gulp --proxy [yourproject.dev] : Proxy against your build against your    */
/*                                  local Wordpress project.                 */
/* ------------------------------------------------------------------------- */

/* Imports Node Modules ---------------------------------------------------- */
var browserSync = require('browser-sync').create(),
    htmlInjector = require('bs-html-injector'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    bootlint = require('gulp-bootlint'),
    stylish = require('jshint-stylish'),
    plumber = require('gulp-plumber'),
    jshint = require('gulp-jshint'),
    rimraf = require('gulp-rimraf'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    args = require('yargs').argv,
    utils = require('gulp-util'),
    sass = require('gulp-sass'),
    gulp = require('gulp');

/* Clean Task -------------------------------------------------------------- */
gulp.task('clean', function() {
    return gulp.src(['css', 'js'], {
            read: false
        })
        .pipe(rimraf());
});

/* Images Task ------------------------------------------------------------- */
gulp.task('images', function() {
    return gulp.src('./images/**/*')
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true,
            multipass: true
        }))
        .pipe(gulp.dest('./images'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* JavaScript Task --------------------------------------------------------- */
gulp.task('javascript', function() {
    return gulp.src('src/js/scripts.js')
        .pipe(plumber(function(error) {
            utils.log(utils.colors.red(error.message));
            this.emit('end');
        }))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(concat('scripts.js'))
        .pipe(uglify({
            mangle: true,
            compress: true
        }))
        .pipe(gulp.dest('./js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* Sass Task --------------------------------------------------------------- */
gulp.task('sass', function() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(plumber(function(error) {
            utils.log(utils.colors.red(error.message));
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.stream({
            match: '**/*.css'
        }));
});

/* Bootlint Task --------------------------------------------------------------- */
gulp.task('bootlint', function() {
    return gulp.src('./src/_html/index.html')
        .pipe(bootlint({
            stoponerror: true,
            stoponwarning: true,
            loglevel: 'debug',
            disabledIds: ['W009', 'E007'],
            reportFn: function(file, lint, isError, isWarning, errorLocation) {
                var message = (isError) ? "ERROR! - " : "WARN! - ";
                if (errorLocation) {
                    message += file.path + ' (line:' + (errorLocation.line + 1) + ', col:' + (errorLocation.column + 1) + ') [' + lint.id + '] ' + lint.message;
                } else {
                    message += file.path + ': ' + lint.id + ' ' + lint.message;
                }
                console.log(message);
            },
            summaryReportFn: function(file, errorCount, warningCount) {
                if (errorCount > 0 || warningCount > 0) {
                    console.log("please fix the " + errorCount + " errors and " + warningCount + " warnings in " + file.path);
                } else {
                    console.log("No problems found in " + file.path);
                }
            }
        }));
});

/* Default Gulp Task ------------------------------------------------------- */
gulp.task('default', ['clean'], function() {
    gulp.start('javascript');
    gulp.start('images');
    gulp.start('sass');
    gulp.start('bootlint');

    gulp.watch('src/js/**/*.js', ['javascript']);
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/_html/*.html', ['bootlint']);

    browserSync.use(htmlInjector, {
        files: 'src/_html/**/*.html'
    });

    if (args.proxy) {
        browserSync.init({
            logFileChanges: false,
            injectChanges: true,
            proxy: args.proxy,
            port: 8010
        });
    } else {
        browserSync.init({
            server: {
                baseDir: './',
                directory: true
            },
            logFileChanges: false,
            injectChanges: true,
            port: 8010
        });
    }
});
