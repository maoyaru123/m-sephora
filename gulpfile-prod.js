// const gulp = require("gulp")//老版的
const {src,dest,series,parallel,watch} = require("gulp")
const path = require("path")
const rev = require("gulp-rev")
const revCollector = require("gulp-rev-collector")
const webpackStream = require("webpack-stream")
const gulpSass = require("gulp-sass")
//拷贝 index.html 到 dist
function copyhtml(){
    return src("./*.html")
    .pipe(dest("./dist"))
}

//拷贝libs下的文件到dist
function copylibs(){
    return src("./src/libs/**/*")
    .pipe(dest("./dist/libs"))
}
function copyimages(){
    return src("./src/images/**/*")
    .pipe(dest("./dist/images"))
}
function copyicons(){
    return src("./src/icons/**/*")
    .pipe(dest("./dist/icons"))
}

//编译js模块 
function packJS(){
    return src("./src/**/*")
    .pipe(webpackStream({
        mode: "production",
        entry:{
            app: "./src/app.js"
        },
        output: {
            filename: "[name].js",//[name] == app
            path: path.resolve(__dirname,"./dist")
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            plugins: ['@babel/plugin-transform-runtime']
                        }
                    }
                },
                {
                    test: /\.art$/,
                    loader: "string-loader"
                }
            ]
        }
    }))
    .pipe(rev())
    .pipe(dest("./dist/scripts"))
    .pipe(rev.manifest())
    .pipe(dest("./rev/scripts"))
}

function revColl(){
    return src(["./rev/**/*.json","./dist/*.html"])
    .pipe(revCollector())
    .pipe(dest("./dist"))
}

//编译css
function packCSS(){
    return src('./src/styles/app.scss')
    .pipe(gulpSass().on('error', gulpSass.logError))//抛出错误继续运行
    .pipe(rev())
    .pipe(dest("./dist/styles"))
    .pipe(rev.manifest())
    .pipe(dest("./rev/styles"))
}



// gulp.task("default", series(packjs, copyhtml, webserver))//串行
exports.default = series(parallel(packJS, packCSS, copylibs, copyimages, copyicons), copyhtml,revColl)