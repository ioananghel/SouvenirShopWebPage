let tema=localStorage.getItem("tema");
if(tema)
    document.body.classList.add(tema);
        
window.addEventListener("DOMContentLoaded", function(){
    document.getElementById("tema").onclick= function(){
        if(document.body.classList.contains("dark")){
            document.body.classList.remove("dark");
            localStorage.removeItem("tema");
            document.body.classList.add("winter");
            localStorage.setItem("tema","winter");
            tema=localStorage.getItem("tema");
        }
        else if(document.body.classList.contains("winter")){
            document.body.classList.remove("winter")
            localStorage.removeItem("tema");
        }
        else{
            document.body.classList.add("dark")
            localStorage.setItem("tema","dark");
        }
    }
});