
const sistema = new SistemaService(DB);



const form = document.getElementById("registerForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const mensajeElement = document.getElementById("mensaje");


    const nombreError = validarNombre(nombre);
    const emailError = validarEmail(email);
    const passwordError = validarPassword(password);

    if(nombreError || emailError || passwordError) {
        mensajeElement.style.display = "block";
        mensajeElement.textContent = nombreError || emailError || passwordError;
        return;
    }

    if(sistema.usuarioExiste(email)){
        mensajeElement.style.display = "block";
        mensajeElement.textContent = "El usuario ya existe";
        return;
    }

    const usuario = sistema.crearUsuario(nombre, email, password);

    if(usuario){
        localStorage.setItem("usuarios", JSON.stringify(sistema.usuarios));
        mensajeElement.style.display = "block";
        mensajeElement.textContent = "Usuario creado correctamente";
    }
})




function validarNombre(nombre) {
    if(nombre === "") return "El nombre no puede estar vacío";
    
    if(nombre.length < 3) return "El nombre debe tener al menos 3 caracteres";

    if(!/^[a-zA-Z\s]+$/.test(nombre)) return "El nombre solo puede contener letras y espacios";

    return null;
}


function validarEmail(email) {
    if(email === "") return "El email no puede estar vacío";

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "El email no es válido";
    }

    return null;
}

function validarPassword(password) {
    if(password === "") return "La contraseña no puede estar vacía";


    if(password.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres";
    }

    return null;
}
