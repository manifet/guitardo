const {src, dest, task, series, watch, parallel} = require("gulp");
const rm = require("gulp-rm");
const sass = require('gulp-sass')(require('sass'));
const gcmq = require("gulp-group-css-media-queries");
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
sass.compiler = require("node-sass");
const sassGlob = require("gulp-sass-glob");
const pug = require("gulp-pug");
const gulpif = require("gulp-if");
const reload = browserSync.reload;
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");

const {SRC_PATH, DIST_PATH} = require("./gulp.config.js");

const env = process.env.NODE_ENV;

task("clean", () => {
    return src(`${DIST_PATH}/**/*`, {read: false}).pipe(rm());
});

task("copy:images", () => {
    return src(`${SRC_PATH}/images/**/*`)
        .pipe(dest(`${DIST_PATH}/images`))
        .pipe(reload({stream: true}));
});

task("copy:fonts", () => {
    return src(`${SRC_PATH}/fonts/**/*`)
        .pipe(
            rename(function (path) {
                path.basename = `${path.basename.toLowerCase()}`;
            })
        )
        .pipe(dest(`${DIST_PATH}/fonts`))
        .pipe(reload({stream: true}));
});

task("html", () => {
    return src(`${SRC_PATH}/pug/*.pug`)
        .pipe(pug({pretty: true}))
        .pipe(dest(`${DIST_PATH}`))
        .pipe(reload({stream: true}));
});

task("styles", () => {
    return src([`${SRC_PATH}/sass/pages/*.scss`])
        .pipe(gulpif(env === "dev", sourcemaps.init()))
        .pipe(sassGlob())
        .pipe(sass().on("error", sass.logError))
        .pipe(gulpif(env === "prod", gcmq()))
        .pipe(gulpif(env === "prod", cleanCSS()))
        .pipe(gulpif(env === "prod", autoprefixer()))
        .pipe(gulpif(env === "dev", sourcemaps.write()))
        .pipe(dest(`${DIST_PATH}/css`))
        .pipe(reload({stream: true}));
});

task("server", () => {
    browserSync.init({
        server: {
            baseDir: `${DIST_PATH}`
        }
    });
});
task("watch", () => {
    watch(`${SRC_PATH}/images/**`, series("copy:images")).on("change", reload);
    watch(`${SRC_PATH}/fonts/**`, series("copy:fonts")).on("change", reload);
    watch(`${SRC_PATH}/pug/**/*.pug`, series("html")).on("change", reload);
    watch(`${SRC_PATH}/sass/**/*.scss`, series("styles")).on("change", reload);
});
task(
    "default",
    series(
        "clean",
        parallel("copy:images", "copy:fonts", "html", "styles"),
        parallel("watch", "server")
    )
);
