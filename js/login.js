const sistema = new SistemaService(DB);

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
});


const form = document.getElementById("loginForm");
const errorElement = document.getElementById("error");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const usuario = sistema.login(email, password);

    if(usuario){
        localStorage.setItem("usuarioActual", JSON.stringify(usuario));
        Toast.fire({
            icon: 'success',
            title: '¡Bienvenido!'
        });

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    }else{
        Toast.fire({
            icon: 'error',
            title: 'Datos de acceso incorrectos'
        });
    }
})