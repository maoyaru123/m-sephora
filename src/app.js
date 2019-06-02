const Name = require("./controller/name")
const art = require("./views/aa.art");
const newstr = template.render(art,{title:"bbb"})
console.log(newstr)

async function getname(){
    console.log(Name.name);
    let name = await Name.getname();
    console.log(name);
    console.log(name);
}
getname();