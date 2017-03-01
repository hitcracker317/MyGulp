var gulp = require("gulp");

//ejs
var ejs = require("gulp-ejs");

//css
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var cssmin = require("gulp-cssmin");
var rename = require("gulp-rename");
var spritesmith = require("gulp.spritesmith");

//js
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");

//画像
var imagemin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");

//その他
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var browserSync = require("browser-sync");
var runSequence = require("run-sequence");

//ディレクトリを取得
var fs = require("fs");
var path = require("path");

var getFolders = function(dir_path) {
  return fs.readdirSync(dir_path).filter(function(file) {
    return fs.statSync(path.join(dir_path, file)).isDirectory();
  });
};


//ディレクトリ
var srcPath = "src/";
var src = {
  ejs: srcPath + "ejs/",
  sass: srcPath + "sass/",
  js: srcPath + "js/",
  img: srcPath + "img/",
  sprite: srcPath + "img/sprite/"
}

var destPath = "dest/";
var dest = {
  css: destPath + "asset/css/",
  cssmin: destPath + "asset/cssmin/",
  js: destPath + "asset/js/",
  jsmin: destPath + "asset/jsmin/",
  img: destPath + "asset/img/",
  sprite: destPath + "asset/img/sprite/"
}


/* ------------------------
ejs
------------------------ */
gulp.task("ejs", function() {
  console.log("---------- ejsをHTMLに変換 ----------");
  gulp.src(src.ejs + "**/*.ejs")
  .pipe(plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(ejs('', {"ext": ".html"}))
  .pipe(rename("index.html"))
  .pipe(gulp.dest(destPath))
  .pipe(browserSync.reload({stream:true}));
});


/* ------------------------
sass
------------------------ */
gulp.task("sass", function(callback) {
  console.log("---------- sassをcssに変換 ----------");
  return runSequence("sass-compile","css-min",callback);
});

//sassをcssにコンパイル
gulp.task("sass-compile", function() {
  return gulp.src(src.sass + "**/*.scss")
  .pipe(plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(sass())
  .pipe(autoprefixer())
  .pipe(gulp.dest(dest.css));
});

//css圧縮
gulp.task("css-min", function() {
  return gulp.src(dest.css + "**/*.css")
  .pipe(plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(cssmin())
  .pipe(rename({ extname: ".min.css" }))
  .pipe(gulp.dest(dest.cssmin))
  .pipe(browserSync.reload({stream:true}));
});


/* ------------------------
js
------------------------ */
gulp.task("js", function(callback) {
  console.log("---------- jsをスマートに ----------");
  return runSequence("js-concat","js-min",callback);
});

//結合
gulp.task("js-concat", function() {
  gulp.src(src.js + "**/*.js")
  .pipe(plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(concat("script.js"))
  .pipe(gulp.dest(dest.js));
});

//圧縮
gulp.task("js-min", function() {
  gulp.src(dest.js + "**/*.js")
  .pipe(plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(uglify())
  .pipe(rename({ extname: ".min.js" }))
  .pipe(gulp.dest(dest.jsmin))
  .pipe(browserSync.reload({stream:true}));
});


/* ------------------------
img
------------------------ */
gulp.task("imagemin", function(){
  console.log("---------- 画像を圧縮 ----------");
  return gulp.src(src.img + "/**/*.+(jpg|jpeg|png|gif)")
  .pipe(imagemin({
    progressive: true,
    use: [pngquant({quality: "65-80", speed: 1})]
  }))
  .pipe(gulp.dest(dest.img));
});


/* ------------------------
css sprite
------------------------ */
gulp.task("sprite", function(callback) {
  console.log("---------- スプライト画像を作成 ----------");
  return runSequence("spriteIcon","sass",["css-min","sprite-min"],callback);
});

//スプライト画像生成
gulp.task("spriteIcon", function () {
  var spriteFolders = getFolders(src.sprite);
  spriteFolders.forEach(function(folderName){
    var spriteData = gulp.src(src.sprite + folderName + "/**/*.+(jpg|jpeg|png|gif)")
    .pipe(spritesmith({
      imgName: folderName + ".png",
      cssName: "_" + folderName + ".scss",
      imgPath: "../img/sprite/" + folderName + ".png",
      cssFormat: "scss",
      cssVarMap: function(sprite) {
        sprite.name = "icon-" + sprite.name;
      }
    }));
    spriteData.img.pipe(gulp.dest(src.sprite));
    spriteData.css.pipe(gulp.dest(src.sass + "_sprite/"));
  });
});

//スプライト画像圧縮
gulp.task("sprite-min", function() {
  return gulp.src(src.sprite + "/**/*.+(jpg|jpeg|png|gif)")
  .pipe(plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(imagemin({
    progressive: true,
    use: [pngquant({quality: "65-80", speed: 1})]
  }))
  .pipe(gulp.dest(dest.sprite));
});


//監視
gulp.task("watch", function(){
  gulp.watch(src.ejs + "./**/*.ejs", ["ejs"]);
  gulp.watch(src.sass + "/**/*.scss",["sass"]);
  gulp.watch(src.js + "/**/*.js",["js"]);
  gulp.watch(src.img + "/**/*.+(jpg|jpeg|png|gif)",["imagemin"]);
  gulp.watch(src.sprite + "/**/*.+(jpg|jpeg|png|gif)",["sprite"]);
});

//ローカルサーバー
gulp.task("browser-sync", function(){
  browserSync({
    server: {
      baseDir: "./",
      directory: true
    },
    open: "external"
  });
});

gulp.task("default",["ejs","sass","js","imagemin","sprite","watch","browser-sync"]);
