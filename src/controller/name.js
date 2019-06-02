//commonjs 规范
// module.exports = "zhaoqian"
module.exports = {
    name : "zhaoqian",
    getname : () => {
        return new Promise((resolve,reject) => {
            setTimeout(() => {
                resolve("mao")
            },3000)
        })
    }
}