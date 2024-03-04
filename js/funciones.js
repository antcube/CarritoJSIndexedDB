import UI from './clases/UI.js';
import {mascotaInput, propietarioInput, telefonoInput, fechaInput, horaInput, sintomasInput, formulario} from './selectores.js';

// Instanciar
export const ui = new UI();

// Variable para controlar si se está editando una cita
export let DB;
let editando;

// Objeto CitaObj
// Objeto para almacenar los datos de la cita
const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: '',
}

// Asignamos un min en el campo fecha
const fechaActual = new Date().toISOString().split('T')[0];
fechaInput.min = fechaActual;


// Funciones
// Función para almacenar los datos de la cita
export function datosCita(e) {
    citaObj[e.target.name] = e.target.value.trim();
}

// Función para crear una nueva cita
export function nuevaCita(e) {
    e.preventDefault();

    // Extraer la información del objeto de cita
    const {mascota, propietario, telefono, fecha, hora, sintomas} = citaObj;

    // Validar
    if(mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora === '' || sintomas === '') {
        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');
        return;
    }

    // Validar que el teléfono sea solo números, comience con 9 y tenga 9 dígitos
    const regexTelefono = /^9\d{8}$/;
    if(!regexTelefono.test(telefono)) {
        ui.imprimirAlerta('Teléfono no válido', 'error');
        return;
    }

    if(editando) {
        // Editar en IndexedDB
        // Iniciar una transacción de escritura y lectura en el objectStore 'citasAlmacen'
        const transaccion = DB.transaction(['citasAlmacen'], 'readwrite');

        // Obtener el objectStore
        const almacenCitas = transaccion.objectStore('citasAlmacen');

        // Actualizar la cita en la base de datos
        const solicitud = almacenCitas.put(citaObj);

        // Si la solicitud fue exitosa
        solicitud.onsuccess = () => {
            ui.imprimirAlerta('Editado correctamente');

            // Regresar el texto del botón a su estado original
            formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';

            // Quitar modo edición
            editando = false;
        }

        // Si la solicitud no fue exitosa
        solicitud.onerror = () => {
            console.log('Hubo un error');
        }
    } else {
        // Generar un ID único
        citaObj.id = Date.now();

        // Insertar registro en la base de datos de IndexedDB
        const transaccion = DB.transaction(['citasAlmacen'], 'readwrite');

        // Habilitar el objectStore
        const almacenCitas = transaccion.objectStore('citasAlmacen');

        // Insertar en la base de datos
        almacenCitas.add(citaObj); // No es necesario el Spread Operator porque IndexedDB ya crea un nuevo objeto

        transaccion.oncomplete = () => {
            console.log('Cita agregada');

            // Mensaje de agregado correctamente
            ui.imprimirAlerta('Agregado correctamente');
        }
    }

    // Reiniciar el objeto para la validación
    reiniciarObjeto();

    // Reiniciar el formulario
    formulario.reset();

    // Mostrar el HTML de las citas
    ui.imprimirCitas();
}

// Función para reiniciar el objeto de la cita
export function reiniciarObjeto() {
    Object.keys(citaObj).forEach(key => {
        citaObj[key] = '';
    });
}

// Función para eliminar una cita
export function eliminarCita(id) {    
    // Iniciar una transacción de escritura y lectura en el objectStore 'citasAlmacen'
    const transaccion = DB.transaction(['citasAlmacen'], 'readwrite');

    // Obtener el objectStore
    const almacenCitas = transaccion.objectStore('citasAlmacen');

    // Eliminar la cita
    const solicitud = almacenCitas.delete(id);

    // Si la solicitud fue exitosa
    solicitud.onsuccess = () => {
        // Muestra un mensaje
        ui.imprimirAlerta('La cita se eliminó correctamente');
    
        // Refrescar las citas
        ui.imprimirCitas();
    }

    // Si la solicitud no fue exitosa
    solicitud.onerror = () => {
        ui.imprimirAlerta('No fue posible eliminar la cita');
    }
}

// Función para editar una cita
export function editarCita(cita) {
    // Carga los datos y el modo edición
    const {mascota, propietario, telefono, fecha, hora, sintomas, id} = cita;

    // Llenar los inputs con los valores que se van actualizar
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    // Llenar el objeto
    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;

    // Cambiar el texto del botón
    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

    // Modo Edición
    editando = true;
}

// Función para crear la base de datos
export function crearDB() {
    // Crear la base de datos en versión 1.0
    const crearDB = window.indexedDB.open('citas', 1);

    // Si hay un error, lanzarlo
    crearDB.onerror = e => {
        console.log('Hubo un error: ', e.target.error);
    }

    // Si todo está bien, mostrar en consola y asignar la base de datos
    crearDB.onsuccess = () => {
        console.log('Base de datos creada');
        DB = crearDB.result;

        // Mostrar las citas al cargar (IndexedDB)
        ui.imprimirCitas();
    }

    // Este método solo corre una vez y es ideal para crear el Schema de la BD, este corre primero que el onsuccess
    crearDB.onupgradeneeded = e => {
        // El evento es la misma base de datos
        const db = e.target.result;

        // Definir el objectstore
        // KeyPath es el índice de la base de datos
        const almacenCitas  = db.createObjectStore('citasAlmacen', {
            keyPath: 'id',
            autoIncrement: true,
        });

        // Crear los índices y campos de la base de datos
        almacenCitas.createIndex('mascota', 'mascota', {unique: false});
        almacenCitas.createIndex('propietario', 'propietario', {unique: false});
        almacenCitas.createIndex('telefono', 'telefono', {unique: false});
        almacenCitas.createIndex('fecha', 'fecha', {unique: false});
        almacenCitas.createIndex('hora', 'hora', {unique: false});
        almacenCitas.createIndex('sintomas', 'sintomas', {unique: false});
        almacenCitas.createIndex('id', 'id', {unique: true});

        console.log('Base de datos creada y lista');
    }
}