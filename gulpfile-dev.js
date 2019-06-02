// const gulp = require("gulp")//老版的
const {src,dest,series,parallel,watch} = require("gulp")
const path = require("path")
const webpackStream = require("webpack-stream")
const gulpWebserver = require("gulp-webserver")
const gulpSass = require("gulp-sass")
const proxy = require("http-proxy-middleware")
const del = require("del")
//拷贝 index.html 到 dev
function copyhtml(){
    return src("./*.html")
    .pipe(dest("./dev"))
}

// gulp.task("copyhtml", (cb) => {
//     gulp.src("./index.html")
//     .pipe(gulp.dest("./dev"))
//     cb()
// })
//新版必须有返回值 或cb 调用cb 


//拷贝libs下的文件到dev
function copylibs(){
    return src("./src/libs/**/*")
    .pipe(dest("./dev/libs"))
}
function copyimages(){
    return src("./src/images/**/*")
    .pipe(dest("./dev/images"))
}
function copyicons(){
    return src("./src/icons/**/*")
    .pipe(dest("./dev/icons"))
}
//启动一个server
function webserver(){
    return src("./dev")
    .pipe(gulpWebserver({
        port:8000,
        livereload: true,
        middleware: [
            proxy("/api", {
                target: "'https://m.lagou.com" ,
                changeOrigin: true,//localhost代理别的域必须写
                pathRewrite: {
                    "^/api": ""
                } 
            })
        ]
    }))
}
//编译js模块 
function packJS(){
    return src("./src/**/*")
    .pipe(webpackStream({
        mode: "development",
        entry:{
            app: "./src/app.js"
        },
        output: {
            filename: "[name].js",//[name] == app
            path: path.resolve(__dirname,"./dev")
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
    .pipe(dest("./dev/scripts"))
}

function clear(target){
    return function(){
        return del(target)
    }
}
//编译css
function packCSS(){
    return src('./src/styles/app.scss')
    .pipe(gulpSass().on('error', gulpSass.logError))//抛出错误继续运行
    .pipe(dest('./dev/styles'))
}

//watcher任务
function watcher(){
    watch("./*.html",series(clear("./dev/*.html"),copyhtml))
    watch("./src/libs/**/*",series(clear("./dev/libs"),copylibs))
    watch("./src/images/**/*",series(clear("./dev/images"),copyimages))
    watch("./src/icons/**/*",series(clear("./dev/icons"),copyicons))
    watch("./src/styles/**/*",series(packCSS))
    watch(["./src/**/*","!src/icons/**/*","!src/images/**/*","!src/libs/**/*","!src/styles/**/*"],series(packJS))
}

// gulp.task("default", series(packjs, copyhtml, webserver))//串行
exports.default = series(parallel(packJS, packCSS, copylibs, copyimages, copyicons), copyhtml, webserver, watcher)