
// email: emi@gmail.com
// contraseña: 123456







//Base de datos
const DB = {
        usuarios: [
            {id: 1, 
            nombre: "Emiliano Fioquetti", 
            email: "emi@gmail.com", 
            contraseña: "123456"}
        ],
        reservas: [],
        medicos: [
            {
                id: 1,
                nombre: "Dr. Juan Pérez",
                especialidad: "Cardiología",
                consultorio: "101"
            },
            {
                id: 2,
                nombre: "Dra. María García",
                especialidad: "Neurología",
                consultorio: "102"
            },
            {
                id: 3,
                nombre: "Dr. Carlos López",
                especialidad: "Pediatría",
                consultorio: "103"
            }
        ],
        turnos: [
            {
                id: 1,
                medicoId: 1,
                fecha: "2025-10-15",
                hora: "10:00",
                estado: "disponible"
            },
            {
                id: 2,
                medicoId: 2,
                fecha: "2025-10-15",
                hora: "11:00",
                estado: "disponible"
            },
            {
                id: 3,
                medicoId: 3,
                fecha: "2025-10-15",
                hora: "12:00",
                estado: "disponible"
            },
            {
                id: 4,
                medicoId: 1,
                fecha: "2025-10-15",
                hora: "13:00",
                estado: "disponible"
            },
            {
                id: 5,
                medicoId: 2,
                fecha: "2025-10-15",
                hora: "14:00",
                estado: "disponible"
            },
            {
                id: 6,
                medicoId: 3,
                fecha: "2025-10-15",
                hora: "15:00",
                estado: "disponible"
            }
    ]
}

//Funciones contructoras

function Usuario(id, nombre, email, contraseña) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.contraseña = contraseña;
}

function Reservas(id, usuarioId, turno){
    this.id = id;
    this.usuarioId = usuarioId;
    this.turnoId = turno.id;
    this.estado = "reservado";
}


function SistemaService(DB){
    this.usuarios = DB.usuarios;
    this.reservas = DB.reservas;
    this.medicos = DB.medicos;
    this.turnos = DB.turnos;
}


SistemaService.prototype.crearUsuario  = function(nombre,email,contraseña){
    const id = this.usuarios.length + 1;
    const usuario = new Usuario(id, nombre, email, contraseña);
    this.usuarios.push(usuario);
    return usuario;
}

SistemaService.prototype.login = function(email,contraseña){
    const usuario = this.usuarios.find(u => u.email === email && u.contraseña === contraseña);
    return usuario;
}

SistemaService.prototype.ObtenerMedicos = function(){
    return this.medicos;
}

SistemaService.prototype.ObtenerTurnosDelMedico = function(medicoId){
    return this.turnos.filter(t => t.medicoId === medicoId && t.estado === "disponible");
}

SistemaService.prototype.crearReserva = function(usuarioId, turno){
    const reservaUsuario = this.reservas.filter(r => r.usuarioId === usuarioId && r.estado === "reservado");
    if(reservaUsuario.length >= 3){
        return false;
    }

    const reserva = new Reservas(this.reservas.length + 1, usuarioId,turno);
    this.reservas.push(reserva);
    turno.estado = "reservado";
    return true;
}

SistemaService.prototype.verReservas = function(usuarioId){
    return this.reservas.filter(r => r.usuarioId === usuarioId && r.estado === "reservado");
}
    
SistemaService.prototype.cancelarReserva = function(reservaId){
    const reserva = this.reservas.find(r => r.id === reservaId);
    if(!reserva){
        return false;
    }
    reserva.estado = "cancelado";

    const turno = this.turnos.find(t => t.id === reserva.turnoId);

    if(turno){
        turno.estado = "disponible";
    }
    return true;
}


function Sistema(){
    this.service = new SistemaService(DB);
}

Sistema.prototype.validarNombre = function(){
    while(true){
        const input = prompt("Ingrese su nombre: ");
        if(!input ){
            alert("El nombre es obligatorio");
            continue;
        } 

        const nombre = input.trim();
        if(nombre.length < 3){
            alert("El nombre debe tener al menos 3 caracteres");
            continue;
        }

        return nombre;
    }
}

Sistema.prototype.validarEmail = function(){
    while(true){
        const input = prompt("Ingrese su email: ");

        if(!input){
            alert("El email es obligatorio");
            continue;
        }

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)){
            alert("El email no es valido");
            continue;
        } 

        const email = input.trim().toLowerCase();
        
        const usuarioExistente = this.service.usuarios.find(u => u.email === email);
        if(usuarioExistente){
            alert("El email ya esta registrado");
            continue;
        }
        
        return email;
    }
}

Sistema.prototype.validarContraseña = function(){
    while(true){
        const contraseña = prompt("Ingrese su contraseña: ");

        if(!contraseña){
            alert("La contraseña es obligatoria");
            continue;
        }

        if(contraseña.length < 6){
            alert("La contraseña debe tener al menos 6 caracteres");
            continue;
        }

        return contraseña;
    }
}


Sistema.prototype.crearUsuario = function(){
    const nombre = this.validarNombre();
    const email = this.validarEmail();
    const contraseña = this.validarContraseña();
    
    this.service.crearUsuario(nombre, email, contraseña);
}

Sistema.prototype.login = function(){
    for(let i = 3; i > 0; i--){
        const email = prompt("Ingreser su email: ").trim().toLowerCase();
        const contraseña = prompt("Ingrese su contraseña: ");

        const usuario = this.service.login(email, contraseña);
        if(usuario){
            alert("Login exitoso");
            return usuario;
        }
        
        alert(`Email o contraseña incorrecto. Te quedan ${i - 1} intentos`);
    }
    
    alert("Has agotado todos los intentos. Por favor, intenta nuevamente más tarde.");
    return null;
}

//Turnos

Sistema.prototype.seleccionarMedico = function(){

    const medicos = this.service.ObtenerMedicos();

    const opciones = medicos.map((medico,index) => `${index + 1}. ${medico.nombre} - ${medico.especialidad}`).join(`\n`);

    const seleccion = parseInt(prompt(`Seleccione un médico:\n${opciones}`));


    if(!seleccion || seleccion < 1 || seleccion > medicos.length){
        alert("Selección inválida");
        return null;
    }

    return medicos[seleccion - 1];
    
    
}

Sistema.prototype.seleccionarTurno = function(medico){
    const turnos = this.service.ObtenerTurnosDelMedico(medico.id);

    if(turnos.length === 0){
        alert("No hay turnos disponibles para este médico");
        return null;
    }

    const opciones = turnos.map((turno,index) => `${index + 1}. Dia: ${turno.fecha} - Hora: ${turno.hora}`).join(`\n`);

    const seleccion = parseInt(prompt(`Seleccione un turno:\n${opciones}`));

    if(!seleccion || seleccion < 1 || seleccion > turnos.length){
        alert("Selección inválida");
        return null;
    }

    return turnos[seleccion - 1];
}

Sistema.prototype.crearReserva = function(usuario,turno){
    const reserva = this.service.crearReserva(usuario.id, turno);
    if(!reserva){
        alert("Se ha excedido el límite de reservas (máximo 3)");
        return;
    }

    alert("Reserva creada exitosamente");
}

Sistema.prototype.verReservas = function(usuario){
    const reservasUsuario = this.service.verReservas(usuario.id);
    if(reservasUsuario.length === 0){
        alert("No tienes reservas");
        return;
    }

    const mensaje = reservasUsuario.map((reserva,index)=>{

        const turno = this.service.turnos.find(t => t.id === reserva.turnoId);

        if(!turno){
            return `${index + 1}. Turno no encontrado`;
        }

        const medico = this.service.medicos.find(m => m.id === turno.medicoId);

        return(`${index + 1}. Médico: ${medico.nombre} - Especialidad: ${medico.especialidad} - Fecha: ${turno.fecha} - Hora: ${turno.hora} - Consultorio: ${medico.consultorio}`);
    })
    
    alert(mensaje.join(`\n`));
}


Sistema.prototype.cancelarReserva = function(usuario){
    const reservasUsuario = this.service.verReservas(usuario.id);

    if(reservasUsuario.length === 0){
        alert("No tienes reservas");
        return;
    }

    const mensaje = reservasUsuario.map((reserva,index) => {
        const turno = this.service.turnos.find(t => t.id === reserva.turnoId);
        const medico = this.service.medicos.find(m => m.id === turno.medicoId);
        return `${index + 1}. Médico: ${medico.nombre} - Especialidad: ${medico.especialidad} - Fecha: ${turno.fecha} - Hora: ${turno.hora} - Consultorio: ${medico.consultorio}`;
    })

    const opcion = parseInt(prompt(`Seleccione una reserva para cancelar:\n${mensaje.join(`\n`)}`));

    if(isNaN(opcion) || opcion < 1 || opcion > reservasUsuario.length){
        alert("Selección inválida");
        return;
    }

    const reserva = reservasUsuario[opcion - 1];
    
    const result = this.service.cancelarReserva(reserva.id);
    
    if(result){
        alert("Reserva cancelada exitosamente");
    } else {
        alert("Error al cancelar la reserva");
    }
    
}

//Menu

Sistema.prototype.subMenu = function(usuario){
    while(true){
        const opcion = parseInt(prompt("Selecciona una opcion:\n1. Hacer una reserva\n2. Ver mis reservas\n3. Cancelar una reserva\n4. Volver al inicio"));
        if(isNaN(opcion)){
            alert("Por favor, ingresa un número válido");
            continue;
        }

        if(opcion === 4){
            break;
        }

        if(opcion === 1){
            const medico = this.seleccionarMedico();
            if(!medico) continue;
            
            const turno = this.seleccionarTurno(medico);
            if(!turno) continue;
            
            this.crearReserva(usuario, turno);

        }else if(opcion === 2){
            this.verReservas(usuario);
        }else if(opcion === 3){
            this.cancelarReserva(usuario);
        }else{
            alert("Opción inválida");
        }
    }
}

Sistema.prototype.inicio = function(){
    alert("Bienvenido al sistema de turnos");
    while(true){
        const opcion = parseInt(prompt("Selecciona una opcion:\n1. Iniciar sesion\n2. Registrarse\n3. Salir"));
        if(isNaN(opcion)){
            alert("Por favor, ingresa un número válido");
            continue;
        }
        if(opcion === 1){

            const usuario = this.login();
            if(!usuario) break;
            this.subMenu(usuario);

        }else if(opcion === 2){
            this.crearUsuario();
        }else if(opcion === 3){
            alert("Adios")
            break;
        }else{
            alert("Opción inválida");
        }
    }
}

const menu = new Sistema();
menu.inicio();
