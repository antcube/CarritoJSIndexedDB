import { datosCita, nuevaCita, crearDB} from '../funciones.js';
import { mascotaInput, propietarioInput, telefonoInput, fechaInput, horaInput, sintomasInput, formulario} from '../selectores.js';

class App {
    constructor() {
        this.initApp();
    }

    initApp() {
        // Event Listeners
        eventListeners();
        function eventListeners() {
            document.addEventListener('DOMContentLoaded', () => {
                crearDB();
            });

            mascotaInput.addEventListener('input', datosCita);
            propietarioInput.addEventListener('input', datosCita);
            telefonoInput.addEventListener('input', datosCita);
            fechaInput.addEventListener('input', datosCita);
            horaInput.addEventListener('input', datosCita);
            sintomasInput.addEventListener('input', datosCita);

            formulario.addEventListener('submit', nuevaCita);
        }
    }
}

export default App;