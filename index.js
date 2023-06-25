const express = require("express");
const fs=require("fs");
const path=require('path');
const sharp = require("sharp");
const sass = require("sass");
const ejs = require("ejs");
const {Client} = require("pg");
const AccesBD = require("./module_proprii/accesbd.js");
const formidable=require("formidable");
const {Utilizator}=require("./module_proprii/utilizator.js")
const session=require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");
const QRCode= require('qrcode');
const puppeteer=require('puppeteer');
const mongodb=require('mongodb');
const helmet=require('helmet');
const xmljs=require('xml-js');

const request=require("request");


AccesBD.getInstanta().select({
    tabel:"produse", 
    campuri:["nume", "pret", "descriere"], 
    conditiiAnd: ["pret > 2000"]
    },
    function(err, rez){
        console.log(err);
        console.log(rez);
    }
)

var client= new Client({database:"f1_souvenir_shop",
        user:"ioan",
        password:"parola",
        host:"localhost",
        port:5432});
client.connect();

client.query("select * from produse", function(err, res){
    console.log("Eroare: ", err);
    console.log("rezultat: ", res.rows);
});

client.query("select * from unnest(enum_range(null::categ_produse))",function(err, rez){
    console.log(err);
    console.log(rez);
})



obGlobal = {
    obErori: null,
    obImagini: null,
    scssFolder: path.join(__dirname, "resurse/scss"),
    cssFolder: path.join(__dirname, "resurse/styles"),
    folerBackup: path.join(__dirname, "backup"),
    optiuniMeniu:[], 
    protocol:"http://",
    numeDomeniu:"localhost:8080",
    clientMongo:mongodb.MongoClient,
    bdMongo:null
}

client.query("select * from unnest(enum_range(null::tipuri_produse))",function(err, rezTipuri){
    if(err){
        console.log(err);
    }
    else{
        obGlobal.optiuniMeniu=rezTipuri.rows;
    }
})

app= express();
console.log("Folder proiect", __dirname);

var url = "mongodb://localhost:27017";//pentru versiuni mai vechi de Node
var url = "mongodb://0.0.0.0:27017";
 
obGlobal.clientMongo.connect(url, function(err, bd) {
    if (err) console.log(err);
    else{
        obGlobal.bdMongo = bd.db("proiect_web");
    }
});

app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));

vectorFoldere=["temp", "temp1", "backup", "poze_uploadate"]
for (let folder of vectorFoldere){
    //let caleFolder=__dirname+"/"+folder;
    let caleFolder=path.join(__dirname, folder)
    if (! fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }

}

function compileScss(scssPath, cssPath){
    if(!cssPath){
        // let vectorPath = scssPath.split("\\"); 
        // let fileName = vectorPath[vectorPath.length - 1];
        let fileName = path.basename(scssPath);
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

    let caleResBackup=path.join(obGlobal.folerBackup, "resurse/styles");
    if (!fs.existsSync(caleResBackup))
        fs.mkdirSync(caleResBackup, {recursive:true});

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

app.use("/*", function(req, res, next){
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;

    res.locals.Drepturi=Drepturi;
    if (req.session.utilizator){
        req.utilizator=res.locals.utilizator=new Utilizator(req.session.utilizator);
    }

    next();
})

app.use(["/produse_cos","/cumpara"],express.json({limit:'2mb'}));//obligatoriu de setat pt request body de tip json

app.use(["/contact"], express.urlencoded({extended:true}));

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

app.get(["/index", "/home", "/", "/login"], async function(req, res){

    let sir=req.session.mesajLogin;
    req.session.mesajLogin=null;

    client.query("select username, nume, prenume from utilizatori where id in (select distinct user_id from accesari where now()-data_accesare <= interval '5 minutes')",
        function(err, rez){
            let useriOnline=[];
            if(!err && rez.rowCount!=0)
                useriOnline=rez.rows
            console.log(useriOnline);

            /////////////// am adaugat aici:
            var evenimente=[]
            var locatie="";
            
            request('https://secure.geobytes.com/GetCityDetails?key=7c756203dbb38590a66e01a5a3e1ad96&fqcn=109.99.96.15', //se inlocuieste cu req.ip; se testeaza doar pe Heroku
                function (error, response, body) {
                    locatie="Nu se poate detecta pentru moment."
                if(error) {
                    
                    console.error('eroare geobytes:', error)
                }
                else{
                    var obiectLocatie=JSON.parse(body);
                    console.log(obiectLocatie);
                    locatie=obiectLocatie.geobytescountry+" "+obiectLocatie.geobytesregion
                }
    
                //generare evenimente random pentru calendar 
                
                var texteEvenimente=["Eveniment important", "Festivitate", "Prajituri gratis", "Zi cu soare", "Aniversare"];
                dataCurenta=new Date();
                for(i=0;i<texteEvenimente.length;i++){
                    evenimente.push({data: new Date(dataCurenta.getFullYear(), dataCurenta.getMonth(), Math.ceil(Math.random()*27) ), text:texteEvenimente[i]});
                }
                console.log(evenimente)
                console.log("inainte",req.session.mesajLogin);

                //////sfarsit zona adaugata:
                res.render("pages/index", {ip: req.ip, imagini:obGlobal.obImagini.imagini, succesLogin:sir, useriOnline:useriOnline, evenimente:evenimente, locatie:locatie});

        });

    //adaugat si inchidere functie:
    });

    res.render("./pages/index", {ip: req.ip, a:10, b:20, imagini: obGlobal.obImagini.images, mesajLogin: sir});
})

app.get("/produse",function(req, res){


    //TO DO query pentru a selecta toate produsele
    //TO DO se adauaga filtrarea dupa tipul produsului
    //TO DO se selecteaza si toate valorile din enum-ul categ_prajitura

    client.query("select * from unnest(enum_range(null::categ_produse))",function(err, rezCategorie){
        // console.log(err);
        // console.log(rez);
        let conditieWhere = ""
        if(req.query.tip)
            conditieWhere = ` where tip_produs = '${req.query.tip}'`;
        client.query("select * from unnest(enum_range(null::echipe))",function(err, rezEchipa){
            // console.log(req.query.echipa)
            if(req.query.echipa && conditieWhere != "")
                conditieWhere += ` and team = '${req.query.echipa}'`;
            else if(req.query.echipa)
                conditieWhere = ` where team = '${req.query.echipa}'`;
            client.query("select * from unnest(enum_range(null::soferi))",function(err, rezSoferi){
                if(req.query.sofer && conditieWhere != "")
                    conditieWhere += ` and driver = '${req.query.sofer}'`;
                else if(req.query.sofer)
                    conditieWhere = ` where driver = '${req.query.sofer}'`;
                
                client.query("select * from produse" + conditieWhere , function( err, rez){
                    console.log(300)
                    if(err){
                        console.log(err);
                        randeazaEroare(res, 2);
                    }
                    else
                        res.render("pages/produse", {produse:rez.rows, optiuni:rezCategorie.rows});
                });
            });
        });

    })
});


app.get("/produs/:id",function(req, res){
    console.log("CHECKINGGG", req.params.id);
   
    client.query(`select * from produse where id=${req.params.id}`, function( err, rezultat){
        if(err){
            console.log(err);
            randeazaEroare(res, 2);
        }
        else
            res.render("./pages/produs", {prod:rezultat.rows[0]});
    });
});

client.query("select * from unnest(enum_range(null::categ_produse))",function(err, rez){
    console.log(err);
    console.log(rez);
})

app.post("/produse_cos",function(req, res){
    console.log(req.body);
    if(req.body.ids_prod.length!=0){
        //TO DO : cerere catre AccesBD astfel incat query-ul sa fi `select nume, descriere, pret, gramaj, imagine from prajituri where id in (lista de id-uri)`
        AccesBD.getInstanta().select({tabel:"produse", campuri:"nume,descriere,pret,driver,an_fabricatie,imagine".split(","),conditiiAnd:[`id in (${req.body.ids_prod})`]},
        function(err, rez){
            if(err)
                res.send([]);
            else
                res.send(rez.rows); 
        });
}
    else{
        res.send([]);
    }
 
});


cale_qr=__dirname+"/resurse/imagini/qrcode";
if (fs.existsSync(cale_qr))
  fs.rmSync(cale_qr, {force:true, recursive:true});
fs.mkdirSync(cale_qr);
client.query("select id from produse", function(err, rez){
    for(let prod of rez.rows){
        let cale_prod=obGlobal.protocol+obGlobal.numeDomeniu+"/produs/"+prod.id;
        //console.log(cale_prod);
        QRCode.toFile(cale_qr+"/"+prod.id+".png",cale_prod);
    }
});

async function genereazaPdf(stringHTML,numeFis, callback) {
    const chrome = await puppeteer.launch();
    const document = await chrome.newPage();
    console.log("inainte load")
    await document.setContent(stringHTML, {waitUntil:"load"});
    
    console.log("dupa load")
    await document.pdf({path: numeFis, format: 'A4'});
    await chrome.close();
    if(callback)
        callback(numeFis);
}

app.post("/cumpara",function(req, res){
    console.log(req.body);
    console.log("Utilizator:", req?.utilizator);
    console.log("Utilizator:", req?.utilizator?.rol?.areDreptul?.(Drepturi.cumparareProduse));
    console.log("Drept:", req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse));
    if (req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse)){
        AccesBD.getInstanta().select({
            tabel:"produse",
            campuri:["*"],
            conditiiAnd:[`id in (${req.body.ids_prod})`]
        }, function(err, rez){
            if(!err  && rez.rowCount>0){
                console.log("produse:", rez.rows);
                let rezFactura= ejs.render(fs.readFileSync("./views/pages/factura.ejs").toString("utf-8"),{
                    protocol: obGlobal.protocol, 
                    domeniu: obGlobal.numeDomeniu,
                    utilizator: req.session.utilizator,
                    produse: rez.rows
                });
                // console.log(rezFactura);
                let numeFis=`./temp/factura${(new Date()).getTime()}.pdf`;
                genereazaPdf(rezFactura, numeFis, function (numeFis){
                    mesajText=`Stimate ${req.session.utilizator.username} aveti mai jos rezFactura.`;
                    mesajHTML=`<h2>Stimate ${req.session.utilizator.username},</h2> aveti mai jos rezFactura.`;
                    req.utilizator.trimiteMail("Factura", mesajText,mesajHTML,[{
                        filename:"factura.pdf",
                        content: fs.readFileSync(numeFis)
                    }] );
                    res.send("Totul e bine!");
                });
                rez.rows.forEach(function (elem){ elem.cantitate=1});
                let jsonFactura= {
                    data: new Date(),
                    username: req.session.utilizator.username,
                    produse:rez.rows
                }
                if(obGlobal.bdMongo){
                    obGlobal.bdMongo.collection("facturi").insertOne(jsonFactura, function (err, rezmongo){
                        if (err) console.log(err)
                        else console.log ("Am inserat factura in mongodb");

                        obGlobal.bdMongo.collection("facturi").find({}).toArray(
                            function (err, rezInserare){
                                if (err) console.log(err)
                                else console.log (rezInserare);
                        })
                    })
                }
            }
        })
    }
    else{
        res.send("Nu puteti cumpara daca nu sunteti logat sau nu aveti dreptul!");
    }
    
});

app.get("/grafice", function(req,res){
    if (! (req?.session?.utilizator && req.utilizator.areDreptul(Drepturi.vizualizareGrafice))){
        afisEroare(res, 403);
        return;
    }
    res.render("pages/grafice");

})

app.get("/update_grafice",function(req,res){
    obGlobal.bdMongo.collection("facturi").find({}).toArray(function(err, rezultat) {
        res.send(JSON.stringify(rezultat));
    });
})

app.post("/inregistrare",function(req, res){
    var username;
    var poza;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){//4
        console.log("Inregistrare:",campuriText);

        console.log(campuriFisier);
        var eroare="";

        var utilizNou=new Utilizator();
        try{
            utilizNou.setareNume=campuriText.nume;
            utilizNou.setareUsername=campuriText.username;
            utilizNou.email=campuriText.email
            utilizNou.prenume=campuriText.prenume
            
            utilizNou.parola=campuriText.parola;
            utilizNou.culoare_chat=campuriText.culoare_chat;
            utilizNou.poza= poza;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(u, parametru ,eroareUser ){
                if (eroareUser==-1){//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else{
                    eroare+="Mai exista username-ul";
                }

                if(!eroare){
                    res.render("pages/inregistrare", {raspuns:"Inregistrare cu succes!"})
                    
                }
                else
                    res.render("pages/inregistrare", {err: "Eroare: "+eroare});
            })
            

        }
        catch(e){ 
            console.log(e);
            eroare+= "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pages/inregistrare", {err: "Eroare: "+eroare})
        }
    



    });
    formular.on("field", function(nume,val){  // 1 
	
        console.log(`--- ${nume}=${val}`);
		
        if(nume=="username")
            username=val;
    }) 
    formular.on("fileBegin", function(nume,fisier){ //2
        console.log("fileBegin");
		
        console.log(nume,fisier);
		//TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser=path.join(__dirname, "poze_uploadate",username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath=path.join(folderUser, fisier.originalFilename)
        poza=fisier.originalFilename
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

    })    
    formular.on("file", function(nume,fisier){//3
        console.log("file");
        console.log(nume,fisier);
    }); 
});


app.post("/login",function(req, res){
    var username;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){
        Utilizator.getUtilizDupaUsername (campuriText.username,{
            req:req,
            res:res,
            parola:campuriText.parola
        }, function(u, obparam ){
            let parolaCriptata=Utilizator.criptareParola(obparam.parola);
            if(u.parola==parolaCriptata && u.confirmat_mail ){
                u.poza=u.poza?path.join("poze_uploadate",u.username, u.poza):"";
                obparam.req.session.utilizator=u;
                
                obparam.req.session.mesajLogin="Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                //obparam.res.render("/login");
            }
            else{
                console.log("Eroare logare")
                obparam.req.session.mesajLogin="Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});


app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        randeazaEroare(res,403,)
        res.render("pages/eroare_generala",{text:"Nu sunteti logat."});
        return;
    }
    var formular= new formidable.IncomingForm();
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },  
        AccesBD.getInstanta().updateParametrizat(
            {tabel:"utilizatori",
            campuri:["nume","prenume","email","culoare_chat", "poza"],
            valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`, `${campuriText.poza}`],
            conditiiAnd:[`username='${campuriText.username}'`, `parola='${parolaCriptata}'`]
        },          
        function(err, rez){
            if(err){
                console.log(err);
                randeazaEroare(res,2);
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pages/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{            
                //actualizare sesiune
                console.log("ceva");
                req.session.utilizator.nume= campuriText.nume;
                req.session.utilizator.prenume= campuriText.prenume;
                req.session.utilizator.email= campuriText.email;
                req.session.utilizator.culoare_chat= campuriText.culoare_chat;
                res.locals.utilizator=req.session.utilizator;
            }
 
 
            res.render("pages/profil",{mesaj:"Update-ul s-a realizat cu succes."});
 
        });
       
 
    });
});



/******************Administrare utilizatori */
app.get("/useri", function(req, res){
   
    if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
        AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){
            console.log(err);
            res.render("pages/useri", {useri: rezQuery.rows});
        });
    }
    else{
        randeazaEroare(res, 403);
    }
});


app.post("/sterge_utiliz", function(req, res){
    if(req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)){
        var formular= new formidable.IncomingForm();
 
        formular.parse(req,function(err, campuriText, campuriFile){
           
                AccesBD.getInstanta().delete({tabel:"utilizatori", conditiiAnd:[`id=${campuriText.id_utiliz}`]}, function(err, rezQuery){
                console.log(err);
                res.redirect("/useri");
            });
        });
    }else{
        randeazaEroare(res,403);
    }
})


app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pages/logout");
});

app.get("/cod/:username/:token",function(req,res){
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username,{res:res,token:req.params.token} ,function(u,obparam){
            AccesBD.getInstanta().update(
                {tabel:"utilizatori",
                campuri:{confirmat_mail:'true'}, 
                conditiiAnd:[`cod='${obparam.token}'`]}, 
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        randeazaEroare(res,3);
                    }
                    else{
                        res.render("pages/confirmare.ejs");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        randeazaEroare(res,2);
    }
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
    randeazaEroare(res,400);
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
        eroare.imagine = "./" + obiectErori.cale_baza + "/" + eroare.imagine;
        console.log("eroare: ", eroare.imagine)
    }

    obiectErori.eroare_default.imagine = "./" + obiectErori.cale_baza + "/" + obiectErori.eroare_default.imagine;
    console.log("default: ", obiectErori.eroare_default.imagine);

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
            res.status(eroare.identificator).render("pages/eroare.ejs", {titlu: titlu, text: text, imagine: imagine});
        else
            res.render("pages/eroare.ejs", {titlu: titlu, text: text, imagine: imagine});
    }
    else{
        res.render("pages/eroare.ejs", {titlu: obGlobal.obErori.eroare_default.titlu, text: obGlobal.obErori.eroare_default.text, imagine: obGlobal.obErori.eroare_default.imagine});
    }
}

app.listen(8080);
console.log("Serverul a pornit");