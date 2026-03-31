const usuariosPredefinidos = JSON.parse(localStorage.getItem("usuarios")) || [{
    id: 1,
    nombre: "Emiliano Fioquetti",
    email: "emi@gmail.com",
    contraseña: "123456"
}];

//Base de datos
const DB = {
        usuarios: usuariosPredefinidos,
        reservas: JSON.parse(localStorage.getItem("reservas")) || [],
        medicos: [],
        turnos: []
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

SistemaService.prototype.obtenerMedicos = function(){
    return this.medicos;
}

SistemaService.prototype.obtenerTurnosDelMedico = function(medicoId){
    return this.turnos.filter(t => t.medicoId === medicoId && t.estado === "disponible");
}

SistemaService.prototype.usuarioExiste = function(email){
    return this.usuarios.some(u => u.email === email);
}

SistemaService.prototype.crearReserva = function(usuarioId, turno){

    if(turno.estado !== "disponible"){
        return false;
    }

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


SistemaService.prototype.obtenerDetalleReserva = function(reservaId){
    const reserva = this.reservas.find(r => r.id === reservaId);
    if(!reserva){
        return null;
    }
    const turno = this.turnos.find(t => t.id === reserva.turnoId);
    if(!turno){
        return null;
    }
    const medico = this.medicos.find(m => m.id === turno.medicoId);
    if(!medico){
        return null;
    }
    return {turno, medico};
}


SistemaService.prototype.modificarReserva = function(reservaId, nuevoTurno){
    const reserva = this.reservas.find(r => r.id === reservaId);
    if(!reserva){
        return false;
    }
    
    if(nuevoTurno.estado !== "disponible"){
        return false;
    }

    const turnoAnterior = this.turnos.find(t => t.id === reserva.turnoId);
    if(turnoAnterior){
        turnoAnterior.estado = "disponible";
    }
    reserva.turnoId = nuevoTurno.id;
    nuevoTurno.estado = "reservado";
    return true;
}