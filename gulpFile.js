const {
    src,
    dest,
    parallel,
    watch
} = require('gulp');
const rename = require('gulp-rename');
const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const uglify = composer(uglifyes, console);
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');



function compressCombineJS() {
    return src(['./src/functions.js','./src/download.js', './src/dataOp.js', './src/keyboardOp.js', './src/nav.js','./src/plotSetup.js','./src/numeric.js' , './src/notify.js'])
        .pipe(concat('funcs.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./lib'))
}

function compressCombineJSp() {
    return src(['./src/download.js','./src/plotter.js'])
        .pipe(concat('plotter.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./lib'))
}


function compressJS() {
    return src(['./src/init.js', './src/plotter.js'])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./lib'))
}



function compressCSS() {
    return src('src/style.css')
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./lib'))
}




exports.default = parallel(compressJS, compressCSS, compressCombineJS, compressCombineJSp);

exports.watch = function () {
    watch('./src/*.*', parallel('default'));
}