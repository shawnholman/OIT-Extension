const gulp = require('gulp');
const webpack_stream = require('webpack-stream')
const webpack_config = require('./webpack.config.js');

gulp.task('webpack', function() {
  return webpack_stream(webpack_config)
        .pipe(gulp.dest(`extension/WebCheckout/`));
});