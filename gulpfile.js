'use strict';

/*******************************************************************************
DEPENDENCIES
*******************************************************************************/

    /* TOOLS DEPENDENCIES */
var gulp = require('gulp'),
    newer = require('gulp-newer'),
    notify = require('gulp-notify'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    fileinclude = require('gulp-file-include'),
    rename = require('gulp-rename');

    /* STYLES DEPENDENCIES */
var postcss = require('gulp-postcss'),
    reporter = require('postcss-reporter'),

    autoprefixer = require('autoprefixer'),
    colorFunction = require('postcss-color-function'),
    cssnano = require('cssnano'),
    lost = require('lost'),
    custommedia = require('postcss-custom-media'),
    cssvariables = require('postcss-css-variables'),
    postcssNested = require('postcss-nested'),
    pixrem = require('pixrem'),
    postcssImport = require('postcss-import'),
    postcssPosition = require('postcss-position'),
    postcssSize = require('postcss-size'),
    postcssUnprefix = require('postcss-unprefix'),
    postcssZindex = require('postcss-zindex'),
    pseudoEnter = require('postcss-pseudo-class-enter');

    /* JS DEPENDENCIES */
var uglify = require('gulp-uglify'),
	concat = require('gulp-concat');

    /* SVG SPRITES DEPENDENCIES */
var svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio');

/*******************************************************************************
VARS
*******************************************************************************/

var root_paths = {
    ressources   : './ressources/',
    build   : 'dist/',
    src     : 'src/'

};

var vendorsFiles = [
    './ressources/vendors/jquery/jquery-1.12.0.min.js',
];

var target = {
    main_postcss_src : root_paths.ressources + root_paths.src + 'postcss/styles.css',
    postcss_src : root_paths.ressources + root_paths.src + 'postcss/**/*.pcss', // all postcss files
    css_dest : root_paths.ressources + root_paths.build + './css', // where to put minified css

    js_src : root_paths.ressources + root_paths.src + 'js/*.js', // all js files
    js_dest : root_paths.ressources + root_paths.build + './js', // where to put minified js

    img_src : root_paths.ressources + root_paths.src + 'images/**/*.{png,jpg,gif}', // all img files
    img_dest : root_paths.ressources + root_paths.build + 'images/', // where to put minified img

    svg_src : root_paths.ressources + root_paths.src + 'images/svg/*.svg',
    svg_dest : root_paths.ressources + root_paths.build + 'svg/',
    svgsprite_dest : root_paths.ressources + root_paths.build + 'svg/svg-sprite'
};

var nanoOpts = {
    zindex: true
};

var lostOptions = {
    "gutter": "20px"
};

/*******************************************************************************
STYLES TASKS
*******************************************************************************/

gulp.task('styles', function() {
        var processors = [
          postcssImport(),
          postcssSize(),
          custommedia(),
          postcssUnprefix,
          postcssNested,
          pixrem,
          postcssPosition(),
          cssvariables,
          colorFunction,
          pseudoEnter,
          lost(lostOptions),
          autoprefixer({ browsers: ['last 2 versions', 'ie 9-11', 'Firefox > 20'] }),
          cssnano(nanoOpts),
          reporter()
        ];

    return gulp.src(target.main_postcss_src)
        .pipe(plumber(function(error){
           gutil.log(gutil.colors.red(error.message));
           this.emit('end');
        }))
        .pipe(postcss(processors))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(target.css_dest))
        .pipe(notify('👌 Styles task completed!'));
});

/*******************************************************************************
JS TASKS
*******************************************************************************/

gulp.task('scripts-internal', function() {
    return gulp.src(target.js_src)
    .pipe(plumber(function(error){
        gutil.log(gutil.colors.red(error.message));
        this.emit('end');
     }))
	.pipe(fileinclude())
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest(target.js_dest))
    .pipe(notify('👌 Internal scripts task completed'));
});

gulp.task('scripts-vendors', function() {
  return gulp.src(vendorsFiles)
	.pipe(fileinclude())
    .pipe(uglify())
    .pipe(concat('vendors.min.js'))
    .pipe(gulp.dest(target.js_dest))
    .pipe(notify('👌 Vendors scripts task completed'));
});

/*******************************************************************************
IMAGES TASKS
*******************************************************************************/

gulp.task('images', function() {
    return gulp.src(target.img_src)
        .pipe(plumber(function(error){
           gutil.log(gutil.colors.red(error.message));
            this.emit('end');
            }))
        .pipe(gulp.dest(target.img_dest));
});

/*******************************************************************************
SVG TASKS
*******************************************************************************/

gulp.task('svgstore', function() {
    return gulp.src(target.svg_src)
        .pipe(rename({ prefix: 'icon-' }))
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

gulp.task('svg',['svgstore','svgmin'], function() {
    console.log('👌 SVG task completed!');
});

/*******************************************************************************
DEFAULT TASKS
*******************************************************************************/

gulp.task('default', ['styles','scripts-internal','scripts-vendors', 'images', 'svg'], function() {
  console.log('Default Task executed');
});


/*******************************************************************************
WATCH TASKS
*******************************************************************************/
gulp.task('watch', function() {
    gulp.watch(target.main_postcss_src, ['styles']); // Watch .styles files
    gulp.watch(target.postcss_src, ['styles']); // Watch .styles files
    gulp.watch(target.img_src, ['images']); // Watch images files
    gulp.watch(target.js_src, ['scripts-internal']); // Watch .js files
    gulp.watch(target.js_vendor, ['scripts-vendors']); // Watch .js vendors files
});
