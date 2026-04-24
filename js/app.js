const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
});




//Cargar datos desde APIs

async function obtenerMedicosAPI() {
    try{
        const response = await fetch("https://api.npoint.io/7f60b9b215db1d2758b9",{
            cache: "no-cache"
        });
        const data = await response.json();
        Toast.fire({
            icon: 'success',
            title: 'Datos cargados correctamente'
        });
        
        return data;
    } catch (error) {
        Toast.fire({
            icon: 'error',
            title: 'Error al cargar datos'
        });
        console.error("Error al cargar datos:", error);
        return [];
    }
}


async function obtenerTurnosAPI(){
    try{
        const response = await fetch("https://api.npoint.io/b3fbea70a626a9de9ec0",{
            cache: "no-cache"
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al cargar datos:", error);
        return [];
    }
}




//Chequear si el usuario esta logueado

const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

if(!usuarioActual){
    window.location.href = "login.html";
}


//Inicializar sistema
const sistema = new SistemaService(DB);




//Seleccionar elementos del DOM

const DOM = {
    btnVer: document.getElementById("btnVer"),
    resultadoDiv: document.getElementById("resultado"),
    btnReservar: document.getElementById("btnReservar"),
    
    btnLogout: document.getElementById("btnLogout"),
    userName: document.getElementById("userName")
}
DOM.btnReservar.disabled = true;
DOM.userName.textContent = usuarioActual.nombre;



//Inicializar la aplicación
async function init(){
    const medicos = await obtenerMedicosAPI();
    const turnosAPI = await obtenerTurnosAPI();

    const turnosLocal = JSON.parse(localStorage.getItem("turnos")) || [];

    const turnosFinal = turnosAPI.map(turnoAPI => {
        const turnoLocal = turnosLocal.find(t => t.id === turnoAPI.id);
        return{
            id: turnoAPI.id,
            fecha: turnoAPI.fecha,
            hora: turnoAPI.hora,
            medicoId: turnoAPI.medicoId,
            estado: turnoLocal? turnoLocal.estado : turnoAPI.estado || "disponible"
        }
    });

    sistema.medicos = medicos;
    sistema.turnos = turnosFinal;

    DOM.btnReservar.disabled = false;
}

init();


//Utils

function renderTexto(texto){
    DOM.resultadoDiv.innerHTML = texto;
}

function crearBoton(texto, onClick){
    const btn = document.createElement("button");
    btn.textContent = texto;
    btn.addEventListener("click", onClick);
    return btn;
}



//ver reservas

DOM.btnVer.addEventListener("click", () => {
    renderTexto("");
    const reservas = sistema.verReservas(usuarioActual.id);

    if(reservas.length === 0){
        renderTexto(`<p>No tienes reservas</p>`);
        return
    }

    const grid = document.createElement("div");
    grid.className = "bookings-grid";

    reservas.forEach(reserva => {
        const detalle = sistema.obtenerDetalleReserva(reserva.id);
        if(!detalle) return;

        const card = document.createElement("div");
        card.className = "booking-card animate__animated animate__fadeIn";

        const info = document.createElement("div");
        info.className = "booking-info";
        info.innerHTML = `
            <h4>${detalle.medico.especialidad}</h4>
            <p><strong>Médico:</strong> ${detalle.medico.nombre}</p>
            <p><strong>Fecha:</strong> ${detalle.turno.fecha}</p>
            <p><strong>Hora:</strong> ${detalle.turno.hora}</p>
            <p><strong>Consultorio:</strong> ${detalle.medico.consultorio}</p>
        `

        const actions = document.createElement("div");
        actions.className = "booking-actions";
            
        const btnCancelar = crearBoton("Cancelar", () => {
            cancelarReserva(reserva.id);
        });
        btnCancelar.className = "btn-cancel";

        const btnModificar = crearBoton("Modificar", () => {
            renderModificarReserva(reserva);
        });
        btnModificar.className = "btn-modify";

        actions.appendChild(btnCancelar);
        actions.appendChild(btnModificar);
        card.appendChild(info);
        card.appendChild(actions);
        grid.appendChild(card);
    });
    
    DOM.resultadoDiv.appendChild(grid);
});



//reservar

function crearReserva(turno){
    const ok = sistema.crearReserva(usuarioActual.id, turno);

    if(!ok){
        Swal.fire({
            icon: 'warning',
            title: 'Límite de reservas',
            text: 'Solo puedes tener 3 reservas activas a la vez.',
            confirmButtonColor: '#0ea5e9'
        });
        return;
    }

    localStorage.setItem("reservas", JSON.stringify(sistema.reservas));
    localStorage.setItem("turnos", JSON.stringify(sistema.turnos));
    Swal.fire({
        icon: 'success',
        title: '¡Reserva Confirmada!',
        text: `Turno agendado para el ${turno.fecha} a las ${turno.hora}`,
        confirmButtonColor: '#0ea5e9'
    }).then(() => {
        renderMedicos(); 
    });
}


function renderTurnos(medico) {
    const turnos = sistema.obtenerTurnosDelMedico(medico.id);

    renderTexto(`<h3>Turnos para ${medico.nombre}</h3>`);

    if (turnos.length === 0) {
        renderTexto(`<p>Lo sentimos, no hay turnos disponibles para este profesional.</p>`);
    } else {
        const slotsDiv = document.createElement("div");
        slotsDiv.className = "slots-container animate__animated animate__fadeIn";

        turnos.forEach(turno => {
            const fechaLoxun = luxon.DateTime.fromISO(turno.fecha).setLocale('es-AR');
            const fechaFormateada = fechaLoxun.toFormat('cccc, dd LLL');
            const btnTurno = crearBoton(`${fechaFormateada} - ${turno.hora} hs`, () => {
                crearReserva(turno);
            });
            btnTurno.className = "slot-button";
            slotsDiv.appendChild(btnTurno);
        });
        DOM.resultadoDiv.appendChild(slotsDiv);
    }

    const btnVolver = crearBoton("Volver a Médicos", () => renderMedicos());
    btnVolver.className = "btn-secondary btn-back";
    DOM.resultadoDiv.appendChild(btnVolver);
}



function renderMedicos(){
    renderTexto("<h3>Seleccione un médico</h3>");
    const medicos = sistema.obtenerMedicos();

    const grid = document.createElement("div");
    grid.className = "doctors-grid animate__animated animate__fadeIn";

    medicos.forEach(medico => {
        const card = document.createElement("div");
        card.className = "doctor-card";

        const iniciales = medico.nombre.split(' ').map(n => n[0]).join('');

        card.innerHTML = `
            <div class="doctor-avatar">${iniciales}</div>
            <h4>${medico.nombre}</h4>
            <span>${medico.especialidad}</span>
        `;
        const btn = crearBoton(`Ver turnos`, ()=>{
            renderTurnos(medico);
        });
        btn.className = "btn-full";
        card.appendChild(btn);
        DOM.resultadoDiv.appendChild(card);
    });

}


DOM.btnReservar.addEventListener("click", ()=>{
    renderMedicos();
})



//cancelar
function cancelarReserva(reservaId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, cancelar turno',
        cancelButtonText: 'Volver'
    }).then((result) => {
        if (result.isConfirmed) {
            const ok = sistema.cancelarReserva(reservaId);
            if (ok) {
                localStorage.setItem("reservas", JSON.stringify(sistema.reservas));
                localStorage.setItem("turnos", JSON.stringify(sistema.turnos));
                
                Toast.fire({
                    icon: 'success',
                    title: 'Reserva eliminada'
                });

                DOM.btnVer.click();
            }
        }
    });
}


//Modificar
function modificarReserva(reservaId,nuevoTurno){
    const ok = sistema.modificarReserva(reservaId,nuevoTurno);
    if(!ok){
        Swal.fire({
            icon: 'error',
            title: 'Error al modificar reserva',
            text: 'El turno seleccionado no está disponible.',
            confirmButtonColor: '#0ea5e9'
        });
        return;
    }
    localStorage.setItem("reservas", JSON.stringify(sistema.reservas));
    localStorage.setItem("turnos", JSON.stringify(sistema.turnos));

    Swal.fire({
        icon: 'success',
        title: '¡Reserva Modificada!',
        text: `Nuevo turno para el ${nuevoTurno.fecha} a las ${nuevoTurno.hora}`,
        confirmButtonColor: '#0ea5e9'
    });

    setTimeout(() => {
        DOM.btnVer.click();
    }, 1000);
    
}


function renderModificarReserva(reserva){
    renderTexto("<h3>Seleccione una reserva para modificar</h3>");
    
    const detalle = sistema.obtenerDetalleReserva(reserva.id);
    if(!detalle) return;
    
    const medico = detalle.medico;
    const turnos = sistema.obtenerTurnosDelMedico(medico.id);

    if(turnos.length === 0){
        renderTexto(`<p>No hay turnos disponibles para este médico</p>`);
        const btnVolver = crearBoton("Volver", ()=>{
            DOM.btnVer.click();
        });
        DOM.resultadoDiv.appendChild(btnVolver);
        return;
    }

    turnos.forEach(turno => {
        const fechaLuxon = luxon.DateTime.fromISO(turno.fecha).setLocale('es-AR');
        const fechaFormateada = fechaLuxon.toFormat('cccc, dd LLL');

        const btn = crearBoton(`${fechaFormateada} - ${turno.hora} hs`, ()=>{
            modificarReserva(reserva.id,turno);
        });
        DOM.resultadoDiv.appendChild(btn);
    });

}


// Logout
DOM.btnLogout.addEventListener("click", ()=>{
    Toast.fire({
        icon: 'info',
        title: 'Cerrando sesión',
        text: 'Hasta luego, ' + usuarioActual.nombre
    });
    setTimeout(() => { 
    localStorage.removeItem("usuarioActual");
    window.location.href = "login.html";
    }, 1500);
})

