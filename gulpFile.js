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
    return src(['./src/plotter.js','./src/download.js'])
        .pipe(concat('plot.js'))
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

// function compressSpredSheetCSS() {
//     return src(['src/style.css','./src/jexcel.css','./src/jsuites.css'])
//         .pipe(concat('spreadsheet.css'))
//         .pipe(cleanCSS())
//         .pipe(rename({
//             suffix: '.min'
//         }))
//         .pipe(dest('./lib'))
// }

// function compressCombineJS() {
//     return src(['./src/jexcel.js','./src/jsuites.js'])
//         .pipe(concat('spreadsheet.js'))
//         .pipe(uglify())
//         .pipe(rename({
//             suffix: '.min'
//         }))
//         .pipe(dest('./lib'))
// }

// exports.spread =  parallel(compressSpredSheetCSS, compressCombineJS)
// exports.default = parallel(compressJS, compressCSS, compressCombineJS, compressCombineJSp);
exports.default = parallel(compressJS, compressCombineJS, compressCombineJSp, compressCSS);

exports.watch = function () {
    watch('./src/*.*', parallel('default'));
}