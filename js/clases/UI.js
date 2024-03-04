import {eliminarCita, editarCita, DB} from '../funciones.js';
import {contenedorCita} from '../selectores.js';

class UI {
    // Método para imprimir una alerta
    imprimirAlerta(mensaje, tipo) {
        // Eliminar la alerta existente, si hay alguna
        const alertaPrevia = document.querySelector('.alert');
        if(alertaPrevia) {
            alertaPrevia.remove();
        }

        // Crear el div
        const divMensaje = document.createElement('DIV');
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');

        // Agregar clase en base al tipo de error
        if(tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Agregar al HTML
        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'));

        // Quitar la alerta después de 2 segundos
        setTimeout(() => {
            divMensaje.remove();
        }, 2000);
    }

    // Método para imprimir las citas

    // 1. Primera forma con .getAll()
    // imprimirCitas() {
    //     this.limpiarHTML();

    //     // Iniciar una transacción de solo lectura en el objectStore 'citasAlmacen'
    //     const transaccion = DB.transaction(['citasAlmacen'], 'readonly' );

    //     // Obtener el objectStore
    //     const almacenCitas = transaccion.objectStore('citasAlmacen');

    //     // Recuperar los datos o registros del objectStore 'citasAlmacen'
    //     const solicitud = almacenCitas.getAll();

    //     // Cuando la solicitud es exitosa
    //     solicitud.onsuccess = () => {
    //         // Se activa el resultado de la solicitud y será un arreglo de citas
    //         const todasCitas = solicitud.result;

    //         todasCitas.forEach(cita => {
    //             const {mascota, propietario, telefono, fecha, hora, sintomas, id} = cita;
    
    //             const divCita = document.createElement('DIV');
    //             divCita.classList.add('cita', 'p-3');
    //             divCita.dataset.id = id;
    
    //             // Scripting de los elementos de la cita
    //             const mascotaParrafo = document.createElement('H2');
    //             mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
    //             mascotaParrafo.textContent = mascota;
    
    //             const propietarioParrafo = document.createElement('P');
    //             propietarioParrafo.innerHTML = `<span class = "font-weight-bolder">Propietario: </span> ${propietario}`;
    
    //             const telefonoParrafo = document.createElement('P');
    //             telefonoParrafo.innerHTML = `<span class = "font-weight-bolder">Teléfono: </span> ${telefono}`;
    
    //             const fechaParrafo = document.createElement('P');
    //             fechaParrafo.innerHTML = `<span class = "font-weight-bolder">Fecha: </span> ${fecha}`;
    
    //             const horaParrafo = document.createElement('P');
    //             horaParrafo.innerHTML = `<span class = "font-weight-bolder">Hora: </span> ${hora}`;
    
    //             const sintomasParrafo = document.createElement('P');
    //             sintomasParrafo.innerHTML = `<span class = "font-weight-bolder">Síntomas: </span> ${sintomas}`;
    
    //             // Botón para eliminar esta cita
    //             const btnEliminar = document.createElement('BUTTON');
    //             btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
    //             btnEliminar.innerHTML = 'Eliminar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';
    //             btnEliminar.addEventListener('click', () => {
    //                 eliminarCita(id);
    //             });
    
    //             // Añade un botón para editar cada cita
    //             const btnEditar = document.createElement('BUTTON');
    //             btnEditar.classList.add('btn', 'btn-info');
    //             btnEditar.innerHTML = 'Editar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>';
    //             btnEditar.addEventListener('click', () => {
    //                 editarCita(cita);
    //             });
    
    //             // Agregar los párrafos y botones al divCita
    //             divCita.append(mascotaParrafo);
    //             divCita.append(propietarioParrafo);
    //             divCita.append(telefonoParrafo);
    //             divCita.append(fechaParrafo);
    //             divCita.append(horaParrafo);
    //             divCita.append(sintomasParrafo);
    //             divCita.append(btnEliminar);
    //             divCita.append(btnEditar);
    
    //             // Agregar el divCita al HTML
    //             contenedorCita.append(divCita);

    //         });
    //     }
    // }

    // 2. Segunda forma con .openCursor()
    imprimirCitas() {
        this.limpiarHTML();

        // Iniciar una transacción de solo lectura en el objectStore 'citasAlmacen'
        const transaccion = DB.transaction(['citasAlmacen'], 'readonly' );

        // Obtener el objectStore
        const almacenCitas = transaccion.objectStore('citasAlmacen');

        // Iterar sobre los registros de la base de datos con el metodo openCursor que devuelve un cursor, el cual permite recorrer los registros de la base de datos y requiere de un evento para ejecutar la función que recorrerá los registros de la base de datos y los imprimirá en el HTML con el método continue
        almacenCitas.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;

            // Si hay un cursor significa que hay registros en la base de datos
            if(cursor) {
                const {mascota, propietario, telefono, fecha, hora, sintomas, id} = cursor.value;

                const divCita = document.createElement('DIV');
                divCita.classList.add('cita', 'p-3');
                divCita.dataset.id = id;

                // Scripting de los elementos de la cita
                const mascotaParrafo = document.createElement('H2');
                mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
                mascotaParrafo.textContent = mascota;

                const propietarioParrafo = document.createElement('P');
                propietarioParrafo.innerHTML = `<span class = "font-weight-bolder">Propietario: </span> ${propietario}`;

                const telefonoParrafo = document.createElement('P');
                telefonoParrafo.innerHTML = `<span class = "font-weight-bolder">Teléfono: </span> ${telefono}`;

                const fechaParrafo = document.createElement('P');
                fechaParrafo.innerHTML = `<span class = "font-weight-bolder">Fecha: </span> ${fecha}`;

                const horaParrafo = document.createElement('P');
                horaParrafo.innerHTML = `<span class = "font-weight-bolder">Hora: </span> ${hora}`;

                const sintomasParrafo = document.createElement('P');
                sintomasParrafo.innerHTML = `<span class = "font-weight-bolder">Síntomas: </span> ${sintomas}`;

                // Botón para eliminar esta cita
                const btnEliminar = document.createElement('BUTTON');
                btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
                btnEliminar.innerHTML = 'Eliminar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';
                btnEliminar.addEventListener('click', () => {
                    eliminarCita(id);
                });

                // Añade un botón para editar cada cita
                const btnEditar = document.createElement('BUTTON');
                const cita = cursor.value;
                btnEditar.classList.add('btn', 'btn-info');
                btnEditar.innerHTML = 'Editar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>';
                btnEditar.addEventListener('click', () => {
                    editarCita(cita);
                });

                // Agregar los párrafos y botones al divCita
                divCita.append(mascotaParrafo);
                divCita.append(propietarioParrafo);
                divCita.append(telefonoParrafo);
                divCita.append(fechaParrafo);
                divCita.append(horaParrafo);
                divCita.append(sintomasParrafo);
                divCita.append(btnEliminar);
                divCita.append(btnEditar);

                // Agregar el divCita al HTML
                contenedorCita.append(divCita);

                // Mover el cursor al siguiente elemento, metodo necesario para recorrer los registros de la base de datos
                cursor.continue();
            }
        }
    }

    // Método para limpiar el HTML
    limpiarHTML() {
        while(contenedorCita.firstChild) {
            contenedorCita.removeChild(contenedorCita.firstChild);
        }
    }
}

export default UI;