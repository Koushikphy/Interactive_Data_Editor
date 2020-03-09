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
    return src([
        './src/plotSetup.js',
        './src/functions.js',
        // './src/keyboardOp.js', 
        './src/notify.js'
        ])
        .pipe(concat('funcs.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./lib'))
}



function compressCombineDelayJS() {
    return src([
        './src/dataOp.js',
        './src/download.js',
        './src/numeric.js',
        './src/nav.js',
        './src/delayedKey.js',
        './src/delayedFunc.js'
        ])
        .pipe(concat('delay.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./lib'))
}




function compressCombineJSp() {
    return src(['./src/plotter.js','./src/download.js'])
        .pipe(concat('plot.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./lib'))
}


function compressJS() {
    return src(['./src/init.js', './src/plotter.js','./src/particles.js'])
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

function compressSpredSheetCSS() {
    return src(['src/style.css','./src/jexcel.css','./src/jsuites.css'])
        .pipe(concat('spreadsheet.css'))
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./lib'))
}

function compressCombineSheetJS() {
    return src(['./src/jexcel.js','./src/jsuites.js'])
        .pipe(concat('spreadsheet.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./lib'))
}

exports.all     = parallel(compressJS, compressCSS, compressCombineJS, compressCombineJSp, compressCombineDelayJS, compressSpredSheetCSS, compressCombineSheetJS);
exports.default = parallel(compressCombineJS,compressCombineDelayJS );

exports.watch = function () {
    watch('./src/*.*', parallel('all'));
}