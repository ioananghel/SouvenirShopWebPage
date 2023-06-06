window.onload=function() {

    document.getElementById("filtrare").onclick= function(){
        let val_nume=document.getElementById("inp-nume").value;
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

        var produse=document.getElementsByClassName("produs");

        if(val_dropdown != "toate"){
            for(let prod of produse){
                prod.style.display="none";
                let categ=prod.getElementsByClassName("val-categorie")[0].innerHTML;
                if(val_dropdown == categ){
                    prod.style.display="block";
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
                if(prod.style.display == "block"){
                    prod.style.display="none";
                    let an=prod.getElementsByClassName("val-an")[0].innerHTML;
                    if(an <= 1990){
                        prod.style.display="block";
                    }
                }
            }
        }
        if(val_radio2.checked){
            for(let prod of produse){
                if(prod.style.display == "block"){
                    prod.style.display="none";
                    let an=prod.getElementsByClassName("val-an")[0].innerHTML;
                    if(an >= 1990 && an <= 2010){
                        prod.style.display="block";
                    }
                }
            }
        }
        if(val_radio3.checked){
            for(let prod of produse){
                if(prod.style.display == "block"){
                    prod.style.display="none";
                    let an=prod.getElementsByClassName("val-an")[0].innerHTML;
                    if(an >= 2010){
                        prod.style.display="block";
                    }
                }
            }
        }
        
        for(let prod of produse){
            if(prod.style.display == "block"){
                prod.style.display="none";
                let pret=prod.getElementsByClassName("val-pret")[0].innerHTML;
                pret = Number(pret);
                if(pret <= val_slider){
                   prod.style.display="block";
                }
            }
        }
        
        if(val_nume){
            for (let prod of produse){
                prod.style.display="none";
                let nume=prod.getElementsByClassName("val-nume")[0].innerHTML;
        
                let cond1= (val_nume==nume);
        
        
                if(cond1){
                    prod.style.display="block";
                }
            }
        }

        for(let team of team_list){
            let elem = document.getElementById(team.id);
            
            if(elem.checked){
                for(let prod of produse){
                    let echipa=prod.getElementsByClassName("val-echipa")[0].innerHTML;
                    if(team.id == echipa && prod.style.display == "block"){
                            prod.style.display="block";
                    }
                }
            }
            else{
                for(let prod of produse){
                    let echipa=prod.getElementsByClassName("val-echipa")[0].innerHTML;
                    if(team.id == echipa && prod.style.display == "block"){
                            prod.style.display="none";
                    }
                }
            }
        }

        for(let driver of driver_list){
            let elem = document.getElementById(driver.id);
            if(elem.checked){
                for(let prod of produse){
                    let sofer=prod.getElementsByClassName("val-sofer")[0].innerHTML;
                    if(driver.id == sofer && prod.style.display == "block"){
                            prod.style.display="block";
                    }
                }
            }
            else{
                for(let prod of produse){
                    let sofer=prod.getElementsByClassName("val-sofer")[0].innerHTML;
                    if(driver.id == sofer && prod.style.display == "block"){
                            prod.style.display="none";
                    }
                }
            }
        }
    }
}