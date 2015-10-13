'use strict';

/*******************************************************************************
DEPENDENCIES
*******************************************************************************/

var gulp = require('gulp'),
    notify = require('gulp-notify'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync'),
    reload  = browserSync.reload,



    /* PERFORMANCE */
    psi = require('psi'),
    site = 'http://postcss.dev/', /* ENTER YOUR DEV URL */
    siteStage = '',
    key = '', // pagespeed key if used a lot better



    /* STYLES DEPENDENCIES */
    postcss = require('gulp-postcss'),
    postcssImport = require('postcss-import'),
    postcssMixins = require('postcss-mixins'),
    postcssNested = require('postcss-nested'),
    sourcemaps = require('gulp-sourcemaps'),

    // post css
    lost = require('lost'),
    autoprefixer = require('autoprefixer'),
    zIndex = require('postcss-zindex'),
    postcssFocus = require('postcss-focus'),
    postcssCalc = require('postcss-calc'),
    postcssSize = require('postcss-size'),
    postcssBrandColors = require('postcss-brand-colors'),

    postcssSimpleVars = require('postcss-simple-vars'),
    map = require('postcss-map'),
    mediaMinmax = require('postcss-media-minmax'),
    postcssEasings = require('postcss-easings'),
    bemLinter = require('postcss-bem-linter'),
    postcssnot = require('postcss-selector-not'),

    postcssPalette = require('postcss-color-palette'),
    // a better palette mrmrs(http://clrs.cc/) is used by default, you can use FlatUI or Material


    cmq = require('gulp-combine-media-queries'),

    /* JS DEPENDENCIES */
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    stylish = require('jshint-stylish'),
    stripDebug = require('gulp-strip-debug'),



    /* IMAGES MINIFICATION DEPENDENCIES */
    imageOptim = require('gulp-imageoptim'),



    /* SVG SPRITES DEPENDENCIES */
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin'),
    rename = require('gulp-rename'),
    cheerio = require('gulp-cheerio'),



    /* COOL TOOLS */
    Pageres = require('pageres');





/*******************************************************************************
FILE DESTINATIONS (RELATIVE TO ASSSETS FOLDER)
*******************************************************************************/

var root_paths = {

    assets : './assets/',
    src : './src/'

};

var target = {

    main_postcss_src : root_paths.src + 'postcss/styles.css',
    postcss_src : root_paths.src + 'postcss/**/*.css',               // all postcss files
    css_dest : root_paths.assets + 'css',                           // where to put minified css

    js_src : root_paths.src + 'js/*.js',                            // all js files
    js_dest : root_paths.assets + 'js/min',                         // where to put minified js

    img_src : root_paths.src + 'images/**/*.{png,jpg,gif}',       // all img files
    img_dest : root_paths.assets + 'images',                     // where to put minified img

    svg_src : root_paths.src + 'images/svg/*.svg',
    svg_dest : root_paths.assets + 'images/svg/svg-sprites/',
    svgsprite_dest : root_paths.assets + 'images/svg/svg-sprites/'

};





/*******************************************************************************
POSTCSS CONFIG
*******************************************************************************/

var AUTOPREFIXER_BROWSERS = [
    'last 2 versions',
    'ie >= 9'
];

var PALETTECOLOR = [
    'mrmrs'
];


// variables settings (colors, fonts, etc)
var vars = {
    basePath: './src/postcss/configs/',
    maps: [ 'colors.yml', 'fonts.yml', 'breakpoints.yml' ]
};



/*******************************************************************************
CSS TASKS
*******************************************************************************/

gulp.task('styles', function() {
        var processors = [
              postcssImport(),
              postcssMixins(),
              postcssSimpleVars({
                    variables: vars
                }),
              postcssnot(),
              map(opts),
              lost(),
              postcssCalc(),
              postcssFocus(),
              postcssSize(),
              mediaMinmax(),
              postcssNested(),
              postcssEasings(),
              postcssBrandColors(),
              postcssPalette(PALETTECOLOR),
              autoprefixer(AUTOPREFIXER_BROWSERS),
              zIndex()
        ];

    return gulp.src(target.main_postcss_src)
        .pipe(plumber(function(error){
           gutil.log(gutil.colors.red(error.message));
            this.emit('end');
            }))
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(cmq({
            log: true
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(target.css_dest))
        .pipe(reload({stream:true}))
        .pipe(notify('POSTCSS task completed'));
});





/*******************************************************************************
JS TASK
*******************************************************************************/

gulp.task('scripts', function() {
    return gulp.src(target.js_src)
        .pipe(plumber(function(error){
           gutil.log(gutil.colors.red(error.message));
            this.emit('end');
            }))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(target.js_dest))
        .pipe(notify('Scripts task completed'));
});


// redundancy here maybe change this thing
gulp.task('scriptsprod', function() {
    return gulp.src(target.js_src)
        .pipe(plumber(function(error){
           gutil.log(gutil.colors.red(error.message));
            this.emit('end');
            }))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(stripDebug())
        .pipe(gulp.dest(target.js_dest))
        .pipe(notify('Scripts task completed'));
});





/*******************************************************************************
IMAGES TASK
*******************************************************************************/

gulp.task('images', function() {
    return gulp.src(target.img_src)
        .pipe(plumber(function(error){
           gutil.log(gutil.colors.red(error.message));
            this.emit('end');
            }))
        .pipe(gulp.dest(target.img_dest));
});


gulp.task('imagesprod', function() {
    return gulp.src(target.img_src)
        .pipe(plumber(function(error){
           gutil.log(gutil.colors.red(error.message));
            this.emit('end');
            }))
        .pipe(imageOptim.optimize({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(target.img_dest));
});




/*******************************************************************************
SVG TASKS
*******************************************************************************/

gulp.task('svgstore', function() {
    return gulp.src(target.svg_src)
        .pipe(rename({ prefix: 'icon-' }))
        .pipe(svgmin())
        .pipe(svgstore({ inlineSvg: true }))
        .pipe(cheerio(function ($) {
            $('svg').attr('style',  'display:none');
        }))
        .pipe(gulp.dest(target.svgsprite_dest));
});

gulp.task('svgmin', function() {
    return gulp.src(target.svg_src)
    .pipe(svgmin())
    .pipe(gulp.dest(target.svg_dest));
});




/*******************************************************************************
PERFORMANCE TASK
*******************************************************************************/

// Please feel free to use the `nokey` option to try out PageSpeed
// Insights as part of your build process. For more frequent use,
// we recommend registering for your own API key. For more info:
// https://developers.google.com/speed/docs/insights/v1/getting_started

gulp.task('mobile', function () {
    return psi(siteStage, {
        // key: key
        nokey: 'true',
        strategy: 'mobile',
    }, function (err, data) {
        console.log(data.score);
        console.log(data.pageStats);
    });
});

gulp.task('desktop', function () {
    return psi(siteStage, {
        nokey: 'true',
        // key: key,
        strategy: 'desktop',
    }, function (err, data) {
        console.log(data.score);
        console.log(data.pageStats);
    });
});





/*******************************************************************************
COOL TASKS
*******************************************************************************/

gulp.task('shoot', function () {

    var pageres = new Pageres({delay: 2})
        .src(site, ['w3counter'], {filename:' <%= url %> - <%= date %> -  <%= time %> - <%= size %>'})
        .dest('./pageres');

    pageres.run(function (err) {
        if (err) {
            throw err;
        }

        console.log('Shooting of ' + site + ' terminé!');
    });
});





/*******************************************************************************
DEFAULT TASK
*******************************************************************************/

gulp.task('default', ['styles','scripts','images','svgstore', 'svgmin'], function() {

});

gulp.task('prod', ['styles','scriptsprod','imagesprod','svgstore', 'svgmin', 'shoot'], function() {

});


gulp.task('browser-sync', function() {
    browserSync({
        proxy: site,
        port: 3001,
        ui: {
            port: 3008
        },
        tunnel: false // set true for online access
    });
});





/*******************************************************************************
WATCH TASK
*******************************************************************************/

gulp.task('watch', ['browser-sync'], function() {

    gulp.watch(target.postcss_src, ['styles']);               // Watch .styl files
    gulp.watch(target.img_src, ['images']);                  // Watch images files
    gulp.watch(target.svg_src, ['svgstore', 'svgmin']);     // Watch svg files
    gulp.watch(target.js_src, ['scripts']);                // Watch .js files

});
