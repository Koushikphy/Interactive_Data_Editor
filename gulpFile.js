const gulp = require('gulp');
const rename = require('gulp-rename');
const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const uglify = composer(uglifyes, console);
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');



gulp.task('compressCombineJS', function () {
    return gulp.src(['./src/functions.js','./src/dataOp.js','./src/keyboardOp.js','./src/plotSetup.js'])
        .pipe(concat('funcs.js'))
        .pipe(uglify())
        .pipe(rename({suffix : '.min'}))
        .pipe(gulp.dest('./lib'))
});

gulp.task('compressJS', function() {
    return gulp.src(['./src/init.js', './src/viewer.js'])
        .pipe(uglify())
        .pipe(rename({suffix : '.min'}))
        .pipe(gulp.dest('./lib'))
})

gulp.task('compressCSS', function () {
    return gulp.src('src/style.css')
        .pipe(cleanCSS())
        .pipe(rename({suffix : '.min'}))
        .pipe(gulp.dest('./lib'))
});

gulp.task('default', gulp.parallel('compressJS', 'compressCSS','compressCombineJS'));

gulp.task('watch', function(){
    gulp.watch('./src/*.*', gulp.series('default')); 
})
