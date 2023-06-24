function levenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = [];
  
    for (let i = 0; i <= m; i++) {
      dp[i] = [];
      dp[i][0] = i;
    }
  
    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }
  
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1, // substituție
            dp[i][j - 1] + 1, // inserare
            dp[i - 1][j] + 1 // ștergere
          );
        }
      }
    }
    console.log("distance", dp[m][n]);
  
    return dp[m][n];
  }

var pinned = [];
var not_shown = [];
var hidden = [];

window.addEventListener("load",function() {

    const pinButton = document.getElementsByClassName('pin');
    const noShowButton = document.getElementsByClassName('no_show');
    const hideButton = document.getElementsByClassName('hide');
    var produse=document.getElementsByClassName("produs");

    hidden = sessionStorage.getItem("hidden");
    if(hidden)
        hidden = hidden.split(",");
    else
        hidden = [];
    for(let elem of hideButton){
        elem.addEventListener('click', function() {
            if(elem.checked == true){
                let id = elem.value;
                console.log(id);
                hidden.push(id);

                sessionStorage.setItem("hidden", hidden);
            }
            else{
                let id = elem.value;
                console.log(id);
                index = hidden.indexOf(id);
                hidden.splice(index, 1);

                sessionStorage.setItem("hidden", hidden);
            }

            var local_hidden = sessionStorage.getItem("hidden");
            if(local_hidden){
                local_hidden = local_hidden.split(",");
                for(let index of local_hidden){
                    console.log(index);
                    for(let prod of produse){
                        let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;

                        if(local_hidden.includes(id_prod)){
                            prod.style.display = "none";
                        }
                    }
                }
            } 
        });
    }

    var local_hidden = sessionStorage.getItem("hidden");
    if(local_hidden){
        local_hidden = local_hidden.split(",");
        for(let index of local_hidden){
            console.log(index);
            for(let prod of produse){
                let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;

                if(local_hidden.includes(id_prod)){
                    prod.style.display = "none";
                }
            }
        }
    }  

    for(let pin of pinButton){
        pin.addEventListener('click', function() {
            let id = pin.value;
            console.log(id);
            let found = false;
            for(let ids of pinned){
                if(ids == id){
                    found = true;
                }
            }

            if(found && pin.checked == false){
                index = pinned.indexOf(id);
                pinned.splice(index, 1);
            }
            else if(!found && pin.checked == true){
                pinned.push(id);
                console.log(pinned)
            }
        });
    }

    for(let noShow of noShowButton){
        noShow.addEventListener('click', function() {
            let id = noShow.value;
            let found = false;
            for(let ids of not_shown){
                if(ids == id){
                    found = true;
                }
            }
            if(found && noShow.checked == false){
                index = not_shown.indexOf(id);
                not_shown.splice(index, 1);
                for(let prod of produse){
                    let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;

                    if(id_prod == id)
                        prod.style.display = "block";
                }
            }
            else if(!found && noShow.checked == true){
                not_shown.push(id);
                console.log(not_shown)
                for(let prod of produse){
                    let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;

                    if(id_prod == id)
                        prod.style.display = "none";
                }
            }
        });
    }

    document.getElementById("filtrare").onclick= function(){

        let val_nume=document.getElementById("inp-nume").value.toLowerCase();
        let val_radio1 = document.getElementById("i_rad1");
        let val_radio2 = document.getElementById("i_rad2");
        let val_radio3 = document.getElementById("i_rad3");
        let val_dropdown = document.getElementById("inp-categorie").value
        var val_slider = document.getElementById("inp-pret").value
        var team_list = document.getElementsByClassName("team_check");
        var driver_list = document.getElementsByClassName("driver_check");

        val_slider = Number(val_slider)
        // console.log(val_dropdown)
        // console.log("haida")
        // console.log(val_slider)
    
        // if(val_nume.trim() == ''){
        //     document.getElementById("inp-nume").classList.add('is-invalid');
        //     document.getElementById("inp-nume").classList.add('is-invalid');
        // }
        // else{
        //     document.getElementById("inp-nume").classList.remove('is-invalid');
        //     document.getElementById("inp-nume").classList.remove('is-invalid');
        // }

        // var produse=document.getElementsByClassName("produs");

        if(val_dropdown != "toate"){
            for(let prod of produse){
                let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;
                if(!pinned.includes(id_prod) || !sessionStorage.getItem("hidden").includes(id_prod)){
                    prod.style.display="none";
                    let categ=prod.getElementsByClassName("val-categorie")[0].innerHTML;
                    if(val_dropdown == categ){
                        prod.style.display="block";
                    }
                }
            }
        }
        else{
            for(let prod of produse){
                prod.style.display = "block";
            }
        }

        if(val_radio1.checked){
            for(let prod of produse){
                let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;
                if(!pinned.includes(id_prod)  || !sessionStorage.getItem("hidden").includes(id_prod)){
                    if(prod.style.display == "block"){
                        prod.style.display="none";
                        let an=prod.getElementsByClassName("val-an")[0].innerHTML;
                        if(an <= 1990){
                            prod.style.display="block";
                        }
                    }
                }
            }
        }
        if(val_radio2.checked){
            for(let prod of produse){
                let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;
                if(!pinned.includes(id_prod)  || !sessionStorage.getItem("hidden").includes(id_prod)){
                    if(prod.style.display == "block"){
                        prod.style.display="none";
                        let an=prod.getElementsByClassName("val-an")[0].innerHTML;
                        if(an >= 1990 && an <= 2010){
                            prod.style.display="block";
                        }
                    }
                }
            }
        }
        if(val_radio3.checked){
            for(let prod of produse){
                let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;
                if(!pinned.includes(id_prod) || !sessionStorage.getItem("hidden").includes(id_prod)){
                    if(prod.style.display == "block"){
                        prod.style.display="none";
                        let an=prod.getElementsByClassName("val-an")[0].innerHTML;
                        if(an >= 2010){
                            prod.style.display="block";
                        }
                    }
                }
            }
        }
        
        for(let prod of produse){
            let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;
            if(!pinned.includes(id_prod) || !sessionStorage.getItem("hidden").includes(id_prod)){
                if(prod.style.display == "block"){
                    prod.style.display="none";
                    let pret=prod.getElementsByClassName("val-pret")[0].innerHTML;
                    pret = Number(pret);
                    if(pret <= val_slider){
                    prod.style.display="block";
                    }
                }
            }
        }
        
        if(val_nume){
            val_num = val_nume.toLowerCase();
            const max_diff = 2;
            for (let prod of produse){
                let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;
                if(!pinned.includes(id_prod) || !sessionStorage.getItem("hidden").includes(id_prod)){
                    prod.style.display="none";
                    let nume=prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();

                    const similarity = levenshteinDistance(val_num, nume);
            
                    let cond1= (nume.startsWith(val_nume) || similarity <= max_diff);
            
                    if(cond1){
                        prod.style.display="block";
                    }
                }
            }
        }

        for(let team of team_list){
            let elem = document.getElementById(team.id);
            
            if(elem.checked){
                for(let prod of produse){
                    let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;
                    if(!pinned.includes(id_prod) || !sessionStorage.getItem("hidden").includes(id_prod)){
                        let echipa=prod.getElementsByClassName("val-echipa")[0].innerHTML;
                        if(team.id == echipa && prod.style.display == "block"){
                                prod.style.display="block";
                        }
                    }
                }
            }
            else{
                for(let prod of produse){
                    let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;
                    if(!pinned.includes(id_prod) || !sessionStorage.getItem("hidden").includes(id_prod)){
                        let echipa=prod.getElementsByClassName("val-echipa")[0].innerHTML;
                        if(team.id == echipa && prod.style.display == "block"){
                                prod.style.display="none";
                        }
                    }
                }
            }
        }

        for(let driver of driver_list){
            let elem = document.getElementById(driver.id);
            if(elem.checked){
                for(let prod of produse){
                    let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;
                    if(!pinned.includes(id_prod) || !sessionStorage.getItem("hidden").includes(id_prod)){
                        let sofer=prod.getElementsByClassName("val-sofer")[0].innerHTML;
                        if(driver.id == sofer && prod.style.display == "block"){
                                prod.style.display="block";
                        }
                    }
                }
            }
            else{
                for(let prod of produse){
                    let id_prod = prod.getElementsByClassName("val-id")[0].innerHTML;
                    if(!pinned.includes(id_prod) || !sessionStorage.getItem("hidden").includes(id_prod)){
                        let sofer=prod.getElementsByClassName("val-sofer")[0].innerHTML;
                        if(driver.id == sofer && prod.style.display == "block"){
                                prod.style.display="none";
                        }
                    }
                }
            }
        }
    }

    document.getElementById("resetare").onclick= function(){

        const confirmare = confirm("Esti sigur ca vrei sa resetezi filtrele?");
        if(confirmare){
            document.getElementById("inp-nume").value="";
            
            document.getElementById("inp-pret").value=document.getElementById("inp-pret").max;
            document.getElementById("inp-categorie").value="toate";
            document.getElementById("i_rad4").checked=true;
            let team_list = document.getElementsByClassName("team_check");
            for(let team of team_list){
                team.checked=true;
            }
            let driver_list = document.getElementsByClassName("driver_check");
            for(let driver of driver_list){
                driver.checked=true;
            }
            var produse=document.getElementsByClassName("produs");
            document.getElementById("infoRange").innerHTML="(0)";
            for (let prod of produse){
                prod.style.display="block";
            }
        }
    }

    function sortare (semn){
        var produse=document.getElementsByClassName("produs");
        var v_produse= Array.from(produse);
        v_produse.sort(function (a,b){
            let pret_a=parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pret_b=parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if(pret_a==pret_b){
                let nume_a=a.getElementsByClassName("val-nume")[0].innerHTML;
                let nume_b=b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn*nume_a.localeCompare(nume_b);
            }
            return semn*(pret_a-pret_b);
        });
        for(let prod of v_produse){
            prod.parentElement.appendChild(prod);
        }
    }
    document.getElementById("sortCrescNume").onclick=function(){
        sortare(1);
    }
    document.getElementById("sortDescrescNume").onclick=function(){
        sortare(-1);
    }

    window.onkeydown= function(e){
        if (e.key=="c" && e.altKey){
            if(document.getElementById("info-suma"))
                return;
            var produse=document.getElementsByClassName("produs");
            let suma=0;
            for (let prod of produse){
                if(prod.style.display!="none")
                {
                    let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                    suma+=pret;
                }
            }
            
            let p=document.createElement("p");
            p.innerHTML=suma;
            p.id="info-suma";
            ps=document.getElementById("p-suma");
            container = ps.parentNode;
            frate=ps.nextElementSibling
            container.insertBefore(p, frate);
            setTimeout(function(){
                let info=document.getElementById("info-suma");
                if(info)
                    info.remove();
            }, 2000)
        }
    }
})