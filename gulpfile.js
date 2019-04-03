const gulp = require('gulp');
const zip = require('gulp-zip');
var fs = require('fs');

gulp.task('compress', () => {
    var { version } = JSON.parse(fs.readFileSync('./extension/manifest.json'));         
    gulp.src('extension/*')
        .pipe(zip(`extension-${version}.zip`))
        .pipe(gulp.dest('zipped'))
});