# 🏥 Portal Médico - Sistema de Gestión de Turnos

Este proyecto consiste en un **Simulador Interactivo de Turnos Médicos** desarrollado para la diplomatura de JavaScript. La aplicación permite gestionar el flujo completo de un paciente, desde su registro hasta la confirmación y modificación de citas médicas, priorizando la experiencia de usuario (UX) y la persistencia de datos.

## 🔐 Credenciales de Acceso (Prueba Rápida)
Para facilitar la corrección y cumplir con las sugerencias de la consigna de evitar registros manuales, se ha precargado una cuenta de prueba:
- **Usuario:** `emi@gmail.com`
- **Contraseña:** `123456`

## 🚀 Funcionalidades Principales

- **Sistema de Autenticación:** Registro de nuevos usuarios y Login con validaciones de seguridad y persistencia en LocalStorage.
- **Reserva de Turnos:** Visualización dinámica de médicos por especialidad y horarios disponibles.
- **Lógica de Negocio:** - Límite de hasta 3 reservas simultáneas por usuario.
  - Validación de disponibilidad de turnos en tiempo real.
  - Capacidad de modificar o cancelar reservas existentes.
- **Interfaz Dinámica:** Manipulación del DOM para crear una experiencia fluida sin recargas de página.

## 🛠️ Tecnologías y Librerías

Para cumplir con los estándares de desarrollo moderno, se integraron:

1. **SweetAlert2:** Para todas las interacciones de confirmación, alertas de error y mensajes de éxito.
2. **Luxon:** Utilizada para el manejo avanzado de fechas y formatos amigables.
3. **Animate.css:** Para fluidez visual y transiciones.
4. **Fetch API:** Para la carga asíncrona de datos desde archivos locales y APIs externas (npoint).

## 📁 Estructura del Proyecto

```text
/
├── index.html          # Dashboard principal
├── login.html          # Formulario de acceso
├── register.html       # Formulario de registro
├── css/
│   └── main.css        # Estilos y diseño responsivo
├── js/
│   ├── core.js         # Lógica central y clases
│   ├── app.js          # Lógica del dashboard y eventos (Aquí se configuran las URLs de npoint)
│   ├── login.js        # Manejo de sesión
│   └── register.js     # Manejo de registro
├── data/
│   ├── medicos.json    # Datos locales de profesionales
│   └── turnos.json     # Datos locales de horarios
└── README.md           # Documentación