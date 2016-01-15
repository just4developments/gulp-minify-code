var gulp = require('gulp'),
		uglify = require('gulp-uglify'),
		concat = require('gulp-concat'),
		minifyCSS = require('gulp-minify-css'),
		rename = require("gulp-rename"),
		minifyHTML = require('gulp-minify-html'),
		es = require('event-stream'),
		clean = require('gulp-clean'),
		optimize = require('../index');

gulp.task('_optimize', [], function(){
	return gulp.src(['www/index.html', 'www/templates/*.html'], {base: 'www'})
			.pipe(optimize.init({
				done: function(files){ //{name: '', js: [], minjs: [], css: [], mincss: []}					
					es.merge(
						gulp.src(files.js)
							.pipe(uglify())
							.pipe(gulp.dest('dist/js')),
						gulp.src(files.minjs)
							.pipe(gulp.dest('dist/js'))
					).pipe(concat(files.name + '.optz.js'))
					 .pipe(gulp.dest('dist/js'));
					es.merge(
						gulp.src(files.css)
							.pipe(minifyCSS())
							.pipe(gulp.dest('dist/css')),
						gulp.src(files.mincss)							
							.pipe(gulp.dest('dist/css'))
					).pipe(concat(files.name + '.optz.css'))
					 .pipe(gulp.dest('dist/css'));
				}
			}))
			.pipe(minifyHTML())
			.pipe(gulp.dest('dist'));
});

gulp.task('optimize', ['_optimize'], function(){
	return gulp.src(['dist/**/*.js', '!dist/**/*.optz.js', 'dist/**/*.css', '!dist/**/*.optz.css'])
		.pipe(clean());
});

gulp.task('default', ['optimize'], function(){

})