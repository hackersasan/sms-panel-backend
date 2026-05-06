const fs = require("fs").promises;
const express = require("express");
const cors = require("cors")
const path = require('path');
const multer = require('multer');
const crypto = require("crypto");

// const session = crypto.randomBytes(32).toString("hex");
const app = express()
app.use(express.json());
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });
async function openFile(){
    const jsondata = await fs.readFile("data.json","utf8");
    return jsondata
}

app.get("/images/:image" , (req , res)=>{
    const image = req.params.image
    const pathofimage = path.join(__dirname, 'images', image);
    res.sendFile(pathofimage)
})
app.get("/search" , (req , res)=>{
    const {q} = req.query;
    let results = [];
    openFile().then((data)=>{
        if (!data){
            res.send([]);
            data = '[]';
        }
        const json = JSON.parse(data).search;
        if (!json){
            res.send([]);
        }else{
            json.forEach(item => {
                if (item.name.toLowerCase().includes(q.toLowerCase())){
                     results.push(item);
                }
                    
            });
            const newresult = JSON.stringify(results)
            res.send(newresult ? newresult : []);
        }
    })

});

app.post("/upload" , upload.single("image") , (req , res)=>{
    if (!req.file){
        res.send({status:400 , error: "File Not Send!"});

    }else{
    const filebuffer = req.file.buffer;
    const filename = req.file.originalname;
    const unixtimestamp = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(filename);
    if (!ext.match("/\.(img|png|jpg|jpeg|ico)$/i")){
        res.send({status:405 , error: "Invalid File!"});
    }else{
    const newfilename = unixtimestamp + ext;
    fs.writeFileSync(`uploads/${newfilename}` , filebuffer);
    const message = "Sucessfuly To Upload File";
    res.send({
        status:200,
        sucess:true,
        message : message,
        path:`/uploads/${newfilename}`
    })
   }}
})
app.listen(8080 , ()=>{
    console.log("Listen in localhost:8080 Sucess...")
})