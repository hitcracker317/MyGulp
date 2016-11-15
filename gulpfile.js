var gulp = require('gulp');

//sassコンパイル
var sass = require("gulp-sass");

//ベンダープレフィックス
var autoprefixer = require("gulp-autoprefixer");

//js圧縮
var uglify = require("gulp-uglify");

//css圧縮
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');

var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var browser = require("browser-sync");


//sass compile & css minifiy
gulp.task("sass", function() {
    gulp.src(["sass/**/*.scss"])
        .pipe(plumber({
        	errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest("./css/min"))
        .pipe(browser.reload({stream:true}));
});

//js minify
gulp.task("js", function() {
    gulp.src(["js/**/*.js","!js/min/**/*.js"])
        .pipe(plumber({
          errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest("./js/min"))
        .pipe(browser.reload({stream:true}));
});

// watch
gulp.task('watch', function(){
  gulp.watch(['./**/*.html', './**/*.htm'], ['browser-reload']);
  gulp.watch("sass/**/*.scss",["sass"]);
  gulp.watch("js/**/*.js",["js"]);
});

// browser-reload
gulp.task('browser-reload', function(){
  browser.reload();
});

//server
gulp.task("server", function(){
	browser({
		server: {
			baseDir: './',
      		directory: true
		},
		open: "external"
	});
});

gulp.task("default",['sass','watch','server','js']);
