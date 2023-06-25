window.addEventListener("load", function () {
    const retrograd = document.getElementsByClassName("promote");
    console.log(retrograd);
    for(let buton of retrograd){
        buton.addEventListener("click", function () {
            console.log("buton apasat");
            var id = buton.value;

            let utiliz = AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"], conditiiAnd:[`id=${id}`]});
            let rolActual = utiliz.rol;
            if(rolActual == "admin"){
                rolActual = "comun";
            }
            else if(rolActual == "comun"){
                rolActual = "admin";
            }

            AccesBD.getInstanta(Utilizator.tipConexiune).insert({tabel:Utilizator.tabel,
                campuri:{
                    rol: rolActual}
                }, function(err, rez){
                console.log("dupa insert: ", this.rol)
                if(err)
                    console.log(err);
                
            });
        });
    }
});