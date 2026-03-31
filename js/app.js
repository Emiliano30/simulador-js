

//Cargar datos desde APIs

async function obtenerMedicosAPI() {
    try{
        const response = await fetch("https://api.npoint.io/7f60b9b215db1d2758b9",{
            cache: "no-cache"
        });
        const data = await response.json();
        return data;
    } catch (error) {
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
        renderTexto(`<p>Maximo 3 reservas por usuario</p>`);
        const btn = crearBoton("Volver", ()=>{
            renderMedicos();
        });
        DOM.resultadoDiv.appendChild(btn);
        return;
    }

    localStorage.setItem("reservas", JSON.stringify(sistema.reservas));
    localStorage.setItem("turnos", JSON.stringify(sistema.turnos));
    renderTexto(`<p>Reserva creada correctamente</p>`);

    const btn = crearBoton("Volver a reservar", ()=>{
        renderMedicos();
    });

    DOM.resultadoDiv.appendChild(btn);
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
            const btnTurno = crearBoton(`${turno.fecha} - ${turno.hora}`, () => {
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
function cancelarReserva(reservaId){
    const ok = sistema.cancelarReserva(reservaId);
    if(!ok){
        renderTexto(`<p>Error al cancelar la reserva</p>`);
        return;
    }
    localStorage.setItem("reservas", JSON.stringify(sistema.reservas));
    localStorage.setItem("turnos", JSON.stringify(sistema.turnos));

    renderTexto(`<p>Reserva cancelada correctamente</p>`);

    setTimeout(() => {
        DOM.btnVer.click();
    }, 1000);
    
}

//Modificar
function modificarReserva(reservaId,nuevoTurno){
    const ok = sistema.modificarReserva(reservaId,nuevoTurno);
    if(!ok){
        renderTexto(`<p>Error al modificar la reserva</p>`);
        return;
    }
    localStorage.setItem("reservas", JSON.stringify(sistema.reservas));
    localStorage.setItem("turnos", JSON.stringify(sistema.turnos));

    renderTexto(`<p>Reserva modificada correctamente</p>`);

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
        const btn = crearBoton(`${turno.fecha} - ${turno.hora}`, ()=>{
            modificarReserva(reserva.id,turno);
        });
        DOM.resultadoDiv.appendChild(btn);
    });

}


// Logout
DOM.btnLogout.addEventListener("click", ()=>{
    localStorage.removeItem("usuarioActual");
    window.location.href = "login.html";
})

