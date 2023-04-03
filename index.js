const express = require("express");
const fs=require("fs");

obGlobal = {
    obErori: null,
    obImagini: null
}

app= express();
console.log("Folder proiect", __dirname);

app.set("view engine", "ejs")

app.use("/resurse", express.static(__dirname+"/resurse"))

app.get("/ceva", function(req, res){
    console.log("cale: ", req.url)
    res.send("<h1>yessir</h1> ip: "+req.ip);
})

app.get(["/index", "/home", "/"], function(req, res){
    res.render("./pages/index", {ip: req.ip, a:10, b:20});
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