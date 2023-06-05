const express = require("express");
const fs=require("fs");
const path=require('path');
const sharp = require("sharp");
const sass = require("sass");
const ejs = require("ejs");
const {Client} = require("pg");

var client= new Client({database:"f1_souvenir_shop",
        user:"ioan",
        password:"parola",
        host:"localhost",
        port:5432});
client.connect();

client.query("select * from lab8_10", function(err, res){
    console.log("Eroare: ", err);
    console.log("rezultat: ", res.rows);
});

obGlobal = {
    obErori: null,
    obImagini: null,
    scssFolder: path.join(__dirname, "resurse/scss"),
    cssFolder: path.join(__dirname, "resurse/styles"),
    folerBackup: path.join(__dirname, "backup")
}

app= express();
console.log("Folder proiect", __dirname);

vectorFoldere=["temp", "temp1", "backup"]
for (let folder of vectorFoldere){
    //let caleFolder=__dirname+"/"+folder;
    let caleFolder=path.join(__dirname, folder)
    if (! fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }

}

function compileScss(scssPath, cssPath){
    if(!cssPath){
        let vectorPath = scssPath.split("\\"); 
        let fileName = vectorPath[vectorPath.length - 1];
        fileName = fileName.split(".")[0];

        cssPath = fileName + ".css";
    }

    if(!path.isAbsolute(scssPath)){
        scssPath = path.join(obGlobal.scssFolder, scssPath)
    }
    if(!path.isAbsolute(cssPath)){
        cssPath = path.join(obGlobal.cssFolder, cssPath)
    }
    // in acest punct, avem cai absolute in cale scss si in styles
    let vectorPath = cssPath.split("\\");
    let cssFileName = vectorPath[vectorPath.length - 1];

    if(fs.existsSync(cssPath)){
        fs.copyFileSync(cssPath, path.join(obGlobal.folerBackup, cssFileName.split(".")[0] + (new Date()).getTime() + cssFileName.split(".")[1]));
    }

    rez = sass.compile(scssPath, {"sourceMap": true});
    fs.writeFileSync(cssPath, rez.css);
    // console.log("Compilare scss", rez);
}
// compileScss("a.scss");

fileVector = fs.readdirSync(obGlobal.scssFolder);
for (let fileName of fileVector){
    if(path.extname(fileName) == ".scss"){
        compileScss(fileName);
    }
}

fs.watch(obGlobal.scssFolder, function(event, fileName){ 
    // console.log(event, fileName);
    if(event == "rename" || event == "rename"){
        let completePath = path.join(obGlobal.scssFolder, fileName);
        if(fs.existsSync(completePath)){
            compileScss(completePath);
        }
    }
});

app.set("view engine", "ejs")

app.use("/resurse", express.static(__dirname+"/resurse"))
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.use(/^\/resurse(\/[a-zA-Z0-9]*)*$/, function(req,res){
    randeazaEroare(res,403);
});

app.get("/favicon.ico", function(req,res){
    res.sendFile(__dirname+"/resurse/imagini/favicon.ico");
})

app.get("/ceva", function(req, res){
    console.log("cale: ", req.url)
    res.send("<h1>yessir</h1> ip: "+req.ip);
})

app.get(["/index", "/home", "/"], function(req, res){
    res.render("./pages/index", {ip: req.ip, a:10, b:20, imagini: obGlobal.obImagini.images});
})

app.get("*/galerie-animata.css",function(req, res){

    var sirScss=fs.readFileSync(__dirname+"/resurse/scss_ejs/galerie_animata.scss").toString("utf8");
    var culori=["navy","black","purple","grey"];
    var indiceAleator=Math.floor(Math.random()*culori.length);
    var culoareAleatoare=culori[indiceAleator]; 
    rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
    console.log(rezScss);
    var caleScss=__dirname+"/temp/galerie_animata.scss"
    fs.writeFileSync(caleScss,rezScss);
    try {
        rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
        var caleCss=__dirname+"/temp/galerie_animata.css";
        fs.writeFileSync(caleCss,rezCompilare.css);
        res.setHeader("Content-Type","text/css");
        res.sendFile(caleCss);
    }
    catch (err){
        console.log(err);
        res.send("Eroare");
    }
});

app.get("*/galerie-animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
});

app.get("/*.ejs",function(req, res){
    afisareEroare(res,400);
})

app.get(["/despre"], function(req, res){
    res.render("./pages/despre");
})

app.get("/*", function(req, res){
    console.log("cale: ", req.url)
    res.render("./pages" + req.url, function(err, rezRandare){
        console.log("Eroare: ", err);
        console.log("rezultat randare: ", rezRandare);
        if(err){
            console.log(err);
            if(err.message.startsWith("Failed to lookup view"))
                randeazaEroare(res, 404);
            else
                randeazaEroare(res);
        }
        else{
            res.send(rezRandare);
        }
    });
})

function initializeazaErori(){
    var continut = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf-8");
    console.log(continut);

    var obiectErori = JSON.parse(continut);
    // for (let i = 0; i < obiectErori.info_erori.length; i++){
    //     console.log(obiectErori.info_erori[i].imagine);
    // }

    for(let eroare of obiectErori.info_erori){
        eroare.imagine = "/" + obiectErori.cale_baza + "/" + eroare.imagine;
    }

    obGlobal.obErori = obiectErori;
}
initializeazaErori();

function initImagini(){
    var continut= fs.readFileSync(__dirname+"/resurse/json/grid_pictures.json").toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.images;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.picture_path);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.picture_path, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    const seasons = ["winter", "spring", "summer", "autumn"];

    const d = new Date();
    let month = d.getMonth(); //0...11 but december is in 11th place
    month = month + 1; //1...12
    month = month % 12; // 0..11, but in order this time
    month = month / 3; // 0..3
    let currentSeason = seasons[month]

    let index = 0;
    const copyImageVect = []

    for(let imag of obGlobal.obImagini.images){
        if(imag.season == currentSeason){
            copyImageVect[index] = imag;
            index++;
        }
    }

    obGlobal.obImagini.images = copyImageVect

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        if(imag.season == currentSeason){
            [numeFis, ext]=imag.file_path.split(".");
            let caleFisAbs=path.join(caleAbs,imag.file_path);
            let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
            sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
            imag.fisier_mediu=path.join("/", obGlobal.obImagini.picture_path, "mediu",numeFis+".webp" )
            imag.file_path=path.join("/", obGlobal.obImagini.picture_path, imag.file_path )
            //eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
        }
    }
}
initImagini();

function randeazaEroare(res, identificator, titlu, text, imagine){
    let eroare = obGlobal.obErori.info_erori.find(function(elemErr){ return elemErr.identificator == identificator });

    if(eroare){
        titlu = titlu || eroare.titlu;
        text = text || eroare.text;
        imagine = imagine || eroare.imagine;
        if(eroare.status)
            res.status(eroare.identificator).render("pages/eroare", {titlu: titlu, text: text, imagine: imagine});
        else
            res.render("pages/eroare", {titlu: titlu, text: text, imagine: imagine});
    }
    else{
        res.render("pages/eroare", {titlu: obGlobal.obErori.eroare_default.titlu, text: obGlobal.obErori.eroare_default.text, imagine: obGlobal.obErori.eroare_default.imagine});
    }
}

app.listen(8080);
console.log("Serverul a pornit");