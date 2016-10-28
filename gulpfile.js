var gulp = require('gulp');
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var uglify = require("gulp-uglify");

var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var browser = require("browser-sync");


//sass compile
gulp.task("sass", function() {
    gulp.src(["sass/**/*.scss"])
        .pipe(plumber({
        	errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest("./css"))
        .pipe(browser.reload({stream:true}));
});

//use css only
gulp.task("css", function() {
  gulp.src(["css/**/*.css"])
      .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
      }))
      .pipe(autoprefixer())
      .pipe(browser.reload({stream:true}));
});

//js minify
gulp.task("js", function() {
    gulp.src(["js/**/*.js","!js/min/**/*.js"])
        .pipe(plumber({
          errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(uglify())
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
