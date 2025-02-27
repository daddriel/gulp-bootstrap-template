import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';
import cleanCSS from 'gulp-clean-css';
import terser from 'gulp-terser';
import concat from 'gulp-concat';
import cached from 'gulp-cached';
import remember from 'gulp-remember';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import browserSync from 'browser-sync';
import htmlreplace from 'gulp-html-replace';

// Configure SASS compiler
const sassCompiler = gulpSass(sass);

// File paths
const paths = {
  styles: {
    src: './sass/**/*.scss',
    devDest: './css',       // Destination for development
    buildDest: './dist/css' // Destination for production
  },
  scripts: {
    src: [
      './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
      './js/**/*.js',
    ],
    buildDest: './dist/js' // Destination for production
  },
  images: {
    src: './images/**/*',
    buildDest: './dist/images' // Destination for production
  },
  html: {
    src: './*.html',
    buildDest: './dist' // Destination for production
  },
  outputCSS: 'styles.min.css',
  outputJS: 'scripts.min.js'
};

// Development tasks

// Compile SASS for development (no minification)
const compileSassDev = () => {
  return gulp.src(paths.styles.src)
    // .pipe(cached('sass'))
    .pipe(sassCompiler().on('error', sassCompiler.logError))
    .pipe(remember('sass'))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(paths.styles.devDest))
    .pipe(browserSync.stream());
};

// Watch JS changes for live reload (no copying)
const watchJS = () => {
  return gulp.src(paths.scripts.src)
    .pipe(browserSync.stream());
};

// Watch HTML changes for live reload (no copying)
const watchHtml = () => {
  return gulp.src(paths.html.src)
    .pipe(browserSync.stream());
};

// Production tasks

// Compile and minify SASS for production
const compileSassBuild = () => {
  return gulp.src(paths.styles.src, { sourcemaps: true })
    .pipe(sassCompiler().on('error', sassCompiler.logError))
    .pipe(concat(paths.outputCSS))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.styles.buildDest, { sourcemaps: '.' }));
};

// Minify and concatenate JS for production
const minifyJSBuild = () => {
  return gulp.src(paths.scripts.src, { sourcemaps: true })
    .pipe(concat(paths.outputJS))
    .pipe(terser())
    .pipe(gulp.dest(paths.scripts.buildDest, { sourcemaps: '.' }));
};

// Optimize images for production
const optimizeImagesBuild = () => {
  return gulp.src(paths.images.src)
    .pipe(newer(paths.images.buildDest))
    .pipe(imagemin([
      gifsicle({ interlaced: true }),
      mozjpeg({ quality: 75, progressive: true }),
      optipng({ optimizationLevel: 5 }),
      svgo()
    ]))
    .pipe(gulp.dest(paths.images.buildDest));
};

// Process HTML for production (replace CSS/JS paths)
const processHtmlBuild = () => {
  return gulp.src(paths.html.src)
    .pipe(htmlreplace({
      css: `css/${paths.outputCSS}`,
      js: `js/${paths.outputJS}`
    }))
    .pipe(gulp.dest(paths.html.buildDest));
};

// Development server and watcher
const serve = () => {
  browserSync.init({
    server: {
      baseDir: './' // Serve from root for development
    }
  });

  gulp.watch(paths.styles.src, compileSassDev);
  gulp.watch(paths.scripts.src, watchJS);
  gulp.watch(paths.html.src, watchHtml);
};

// Full production build
const build = gulp.parallel(compileSassBuild, minifyJSBuild, optimizeImagesBuild, processHtmlBuild);

export {
  compileSassDev,
  watchJS,
  watchHtml,
  serve,
  compileSassBuild,
  minifyJSBuild,
  optimizeImagesBuild,
  processHtmlBuild,
  build as default
};