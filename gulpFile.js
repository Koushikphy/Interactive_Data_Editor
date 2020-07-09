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


function compressSpredSheetCSS() {
    return src(['./src/libscripts/jexcel.css','./src/libscripts/jsuites.css'])
        .pipe(concat('spreadsheet.css'))
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./src/css'))
}

function compressCombineSheetJS() {
    return src(['./src/libscripts/jexcel.js','./src/libscripts/jsuites.js'])
        .pipe(concat('spreadsheet.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./src/lib'))
}


function compressParticleJS() {
    return src(['./src/libscripts/particles.js'])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./src/lib'))
}


exports.all = parallel(compressCombineSheetJS, compressSpredSheetCSS, compressParticleJS)
exports.default = parallel(compressCombineSheetJS, compressSpredSheetCSS, compressParticleJS)


