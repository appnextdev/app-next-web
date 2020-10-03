const gulp = require('gulp'),
      rename = require('gulp-rename')

const folder = 
{
    core: '../app-next-core/'
}

gulp.task('copy-core-dist', () =>
{
    return gulp.src(folder.core + 'dist/*').pipe(gulp.dest('dist'))
})

gulp.task('copy-core-test', () =>
{
    const source = folder.core + 'test/',
          files = gulp.src([ source + 'base/**/*', source + '*.html' ])

    return files.pipe(rename(path =>
    {
        const isTest = path.extname == '.html'

        path.basename = (isTest ? 'core.' : '') + path.basename
        path.dirname = isTest ? '' : 'base'

    })).pipe(gulp.dest('test'))
})

gulp.task('copy-core-worker', () =>
{
    return gulp.src(folder.core + 'app-next-service-worker.js').pipe(gulp.dest('.'))
})

gulp.task('build', gulp.series('copy-core-dist', 'copy-core-test', 'copy-core-worker'))
