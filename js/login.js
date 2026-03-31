const sistema = new SistemaService(DB);



const form = document.getElementById("loginForm");
const errorElement = document.getElementById("error");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const usuario = sistema.login(email, password);

    if(usuario){
        localStorage.setItem("usuarioActual", JSON.stringify(usuario));
        window.location.href = "index.html";
    }else{
        errorElement.style.display = "block";
    }
})