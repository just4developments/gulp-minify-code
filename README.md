# gulp-minify-code
It's a gulp's plugin which to minify html, css, js files

# Installation
npm install --save-dev gulp-minify-code

## Usage

```javascript

var optimize = require('gulp-minify-code');

gulp.src(['www/index.html', 'www/templates/*.html'], {base: 'www'})
	.pipe(optimize.init({ // optimize module will scan all file javascript, css in the list html files
		done: function(files){ 
		  /*! files return list javascript, css files in the html file
		    FORMAT: {name: '', js: [], minjs: [], css: [], mincss: []}
		    name: html file name without extension
		    js, minjs: file with extension is .js or min.js
		    css, mincss: file with extension is .css or min.css
		  */
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
```

# Details
  Open file gulpfile.js in test folder
