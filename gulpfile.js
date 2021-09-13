const gulp = require("gulp");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const autoprefixer = require("gulp-autoprefixer");
const cleanCss = require("gulp-clean-css");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const svgSprite = require("gulp-svg-sprite");
const cheerio = require("gulp-cheerio");
const svgmin = require("gulp-svgmin");
const replace = require("gulp-replace");
const stylelint = require("gulp-stylelint");
const eslint = require("gulp-eslint");
const spritesmith = require("gulp.spritesmith");
const buffer = require("vinyl-buffer");
const merge = require("merge-stream");
const include = require("gulp-include");
const del = require("del");
const browserSync = require("browser-sync").create();
const rollup = require("gulp-better-rollup");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

let isBuild = false;

function setMode(value) {
  return (cb) => {
    isBuild = value;
    cb();
  };
}

function clean() {
  return del("dist");
}

function pug2html() {
  return gulp
    .src("dev/pug/pages/*.pug")
    .pipe(plumber())
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(plumber.stop())
    .pipe(gulp.dest("dist"))
    .pipe(browserSync.stream());
}

function fonts() {
  return gulp
    .src("dev/static/fonts/**/*.*")
    .pipe(gulp.dest("dist/static/fonts/"));
}

function scssLinter() {
  return gulp
    .src("dev/static/styles/**/*.scss")
    .pipe(
      stylelint({
        fix: true,
        reporters: [{ formatter: "string", console: true }],
      })
    )
    .pipe(gulp.dest("dev/static/styles/"));
}
function scss2css() {
  return gulp
    .src("dev/static/styles/styles.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(
      cleanCss({
        level: 2,
      })
    )
    .pipe(plumber.stop())
    .pipe(gulp.dest("dist/static/css/"))
    .pipe(browserSync.stream());
}

function javascript() {
  return gulp
    .src("dev/static/js/*.js")
    .pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, "umd"))
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest("dist/static/js/"))
    .pipe(browserSync.stream());
}

function jsLinter() {
  return gulp
    .src("dev/static/js/*.js")
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function imageMinify() {
  return gulp
    .src([
      "dev/static/img/**/*.{png,svg,jpg,gif,webp}",
      "!dev/static/img/sprite/**/*.{png,svg}",
    ])
    .pipe(buffer())
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(gulp.dest("dist/static/img/"));
}

function jsVendors() {
  return gulp
    .src(["node_modules/svg4everybody/dist/svg4everybody.min.js"])
    .pipe(concat("libs.js"))
    .pipe(gulp.dest("dist/static/js/vendors/"));
}

function pngSprite() {
  const spriteData = gulp.src("dev/static/img/sprite/png/*.png").pipe(
    spritesmith({
      imgName: "sprite.png",
      imgPath: "../img/sprite/sprite.png",
      cssName: "sprite.css",
    })
  );

  const imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest("dist/static/img/sprite/"));

  const cssStream = spriteData.css
    .pipe(cleanCss())
    .pipe(gulp.dest("dist/static/css/"));

  return merge(imgStream, cssStream);
}

function svgSpriteFunc() {
  return gulp
    .src("dev/static/img/sprite/svg/*.svg")
    .pipe(
      svgmin({
        js2svg: {
          pretty: true,
        },
      })
    )
    .pipe(
      cheerio({
        run: function ($) {
          $("[fill]").removeAttr("fill");
          $("[stroke]").removeAttr("stroke");
          $("[style]").removeAttr("style");
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(replace("&gt;", ">"))
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: "sprite.svg",
          },
        },
      })
    )
    .pipe(gulp.dest("dist/static/img/sprite/"));
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
  });

  gulp.watch("dev/pug/**/*.pug", pug2html);
  gulp.watch(
    [
      "dev/static/img/**/*.{png,svg,jpg,gif,webp}",
      "!dev/static/img/sprite/**/*.{png,svg}",
    ],
    imageMinify
  );

  gulp.watch("dev/static/img/sprite/svg/*.svg", svgSpriteFunc);
  gulp.watch("dev/static/img/sprite/png/*.png", pngSprite);
  gulp.watch("dev/static/styles/**/*.scss", scss2css);
  gulp.watch("dev/static/js/main.js", javascript);
  gulp.watch("dev/static/js/*.js", javascript);
}

const devTasks = gulp.parallel(
  fonts,
  pug2html,
  scss2css,
  javascript,
  jsVendors,
  imageMinify,
  svgSpriteFunc,
  pngSprite
);

exports.default = gulp.series(setMode(false), clean, devTasks, watch);
exports.build = gulp.series(setMode(true), clean, devTasks, watch);

exports.testScss = gulp.parallel(scssLinter);
exports.testJS = gulp.parallel(jsLinter);
