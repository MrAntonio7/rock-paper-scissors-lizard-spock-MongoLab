var socket = io();
var nick;
var opcion;
var opcionEnemiga;
var puntuacion = 0;
var puntuacionEnemiga = 0;
var partidas = 0;


socket.on('uploadProgess', function(percent) {
    document.getElementById('percent').innerHTML = percent;
});

socket.on("jugadores", function(jugadores) {
    if (jugadores.length < 2) {
        noneReady();
        noneChat();
        nonePuntuaciones();
        hiddenOpciones();
        renderWait();
        document.getElementById('fin').innerHTML = '';
        socket.emit('reset', undefined);
    } else {
        document.getElementById("jugadores").innerHTML = "";
        for (let i = 0; i < jugadores.length; i++) {
            renderNick(jugadores[i].nombre);
            if (i == 0) {
                noneReady();
                renderVs();
                renderChat();
                renderPuntuaciones(puntuacion);
                blockOpciones();
            }
        }
    }
});

socket.on("aviso", function(data) {
    renderAviso('Servidor', data);
});

socket.on("json", function(data) {
    var historial = data.reverse();
    for (let i = 0; i < 10; i++) {
        var li = document.createElement('li');
        li.innerHTML = historial[i].nombre + ' - ' + historial[i].puntos;
        document.getElementById('historial').appendChild(li);
    }


});

socket.on("jugada", function(data) {
    renderJugada('Servidor', data);
    sheldon(opcion, opcionEnemiga, data);
    puntuacionUpdate(data);
    renderReady();
    opcionEnemiga = undefined;
    opcion = undefined;
    partidas += 1;
    comprobarFin(partidas, 3);

    setTimeout(function() {
        document.getElementById('sheldon').innerHTML = '';
        blockOpciones();
        resetOpciones();
        noneReady();

        socket.emit('reset', undefined);
    }, 5000);
});

socket.on("eleccionEnemiga", function(eleccionEnemiga) {
    opcionEnemiga = eleccionEnemiga;
    // console.log('El enemigo ha elegido ' + opcionEnemiga);
    socket.emit('enemigoPreparado', [opcionEnemiga, nick, socket.io.engine.id]);

});

socket.on("tuEleccion", function(miEleccion) {
    opcion = miEleccion;
    renderMieleccion('Servidor', opcion);
    console.log('Tu eleccion es ' + opcion);
    socket.emit('preparado', [opcion, nick, socket.io.engine.id]);
});

socket.on("connectToRoom", function(data) {
    console.log("You are in room no. " + data);
});


socket.on("partida-resultado", function(data) {

    renderFin(data);
});

socket.on("welcome", function(data) {
    renderMensaje('Servidor', data.nombre, data.sala);
    renderMensajeGlobal('Servidor', data.nombre);
});

socket.on("addmensaje", function(data) {
    renderMensajeUsuario(data.nombre, data.mensaje);
});

socket.on("addmensajeglobal", function(data) {
    renderMensajeUsuarioGlobal(data.nombre, data.mensaje);
});


function renderWait() {
    document.getElementById(
        "jugadores"
    ).innerHTML = '';
    document.getElementById(
        "jugadores"
    ).innerHTML = `<h1 class="text-light mx-auto mt-5" >Esperando mas jugadores...</h1>`;
}

function renderVs() {
    document.getElementById(
        "jugadores"
    ).innerHTML += `<h2 class="text-light mx-auto mt-5" >Vs.</h2>`;
}


function renderNick(name) {
    var html = `<h3 class="text-light mx-auto mt-5" >${name}</h3>`;
    document.getElementById("jugadores").innerHTML += html;
}

function sendNick(e) {

    nick = document.getElementById("nickname").value;
    if (nick == '') {
        nick = 'Anónimo';
    }
    document.getElementById("form-nickname").style.display = "none";
    document.getElementById("game").style.display = "block";
    socket.emit("nick", nick);
    socket.emit('id', socket.io.engine.id);
    console.log('Tu nombre es: ' + nick);
    return false;
}


function selectScissors() {
    opcion = 'tijera';
    noneOpciones();
    socket.emit('juego', 'tijera');

}

function selectRock() {
    opcion = 'piedra';
    noneOpciones();
    socket.emit('juego', 'piedra');
}

function selectPaper() {
    opcion = 'papel';
    noneOpciones();
    socket.emit('juego', 'papel');
}

function selectLagarto() {
    opcion = 'lagarto';
    noneOpciones();
    socket.emit('juego', 'lagarto');
}

function selectSpock() {
    opcion = 'spock';
    noneOpciones();
    socket.emit('juego', 'spock');
}

function noneOpciones() {
    document.getElementById('opciones').style.visibility = "hidden";
}

function hiddenOpciones() {
    document.getElementById('opciones').style.visibility = "hidden";
}

function blockOpciones() {
    document.getElementById('opciones').style.visibility = "visible";
}

function resetOpciones() {
    document.getElementById('opciones').style.visibility = "visible";
}

function renderMensaje(emisor, nombre, sala) {
    var html = (`
            <div class="message">
                <strong>${emisor}</strong>
                <p>${nombre} ha entrado a la sala ${sala}</p>
            </div>
        `);
    var div = document.getElementById('messages');
    div.innerHTML += html;
    div.scrollTop = div.scrollHeight;
}

function renderJugada(emisor, jugada) {
    var html = (`
            <div class="message">
                <strong>${emisor}</strong>
                <p>${jugada}</p>
            </div>
        `);
    var div = document.getElementById('messages');
    div.innerHTML += html;
    div.scrollTop = div.scrollHeight;
}

function renderMensajeGlobal(emisor, nombre) {
    var html = (`
            <div class="message">
                <strong>${emisor}</strong>
                <p>${nombre} ha entrado en el chat global</p>
            </div>
        `);
    var div = document.getElementById('messagesglobal');
    div.innerHTML += html;
    div.scrollTop = div.scrollHeight;
}

function renderMensajeUsuario(nombre, dato) {
    var html = (`
            <div class="message">
                <strong>${nombre}</strong>
                <p>${dato}</p>
            </div>
        `);
    var div = document.getElementById('messages');
    div.innerHTML += html;
    div.scrollTop = div.scrollHeight;
}

function renderMensajeUsuarioGlobal(nombre, dato) {
    var html = (`
            <div class="message">
                <strong>${nombre}</strong>
                <p>${dato}</p>
            </div>
        `);
    var div = document.getElementById('messagesglobal');
    div.innerHTML += html;
    div.scrollTop = div.scrollHeight;
}

function noneChat() {
    document.getElementById('consola').style.display = "none";
}

function nonePuntuaciones() {
    document.getElementById('puntuaciones').style.display = "none";

}

function noneReady() {
    document.getElementById('ready').style.display = "none";
}

function renderReady() {
    document.getElementById('ready').style.display = "block";
}

function renderChat() {
    document.getElementById('consola').style.display = "block";
}

function renderPuntuaciones(p) {
    document.getElementById('puntuaciones').style.display = "block";
    document.getElementById('puntuacion').innerHTML = p;
}

function addMessage(e) {
    var message = {
        nombre: nick,
        mensaje: document.getElementById('text').value
    };
    socket.emit('add-message', message);
    return false;
}

function addMessageGlobal(e) {
    var message = {
        nombre: nick,
        mensaje: document.getElementById('textglobal').value
    };
    socket.emit('add-message-global', message);
    return false;
}

function renderAviso(emisor, nombre) {
    var html = (`
            <div class="message">
                <strong>${emisor}</strong>
                <p>El jugador ${nombre} ha elegido</p>
            </div>
        `);
    var div = document.getElementById('messages');
    div.innerHTML += html;
    div.scrollTop = div.scrollHeight;
}

function renderMieleccion(emisor, data) {
    var html = (`
    <div class="message">
        <strong>${emisor}</strong>
        <p>Has elegido ${data}</p>
    </div>
`);
    var div = document.getElementById('messages');
    div.innerHTML += html;
    div.scrollTop = div.scrollHeight;
}

function puntuacionUpdate(jugada) {
    if (jugada == 'Ganaste') {
        puntuacion += 1;
    } else if (jugada == 'Perdiste') {
        puntuacionEnemiga += 1;
        // console.log('enemigo gana');
    }
    var div = document.getElementById('puntuacion');
    div.innerHTML = puntuacion;
    // console.log(puntuacion);
    socket.emit('puntuacion', puntuacion);
}

function comprobarFin(partidas, ruptura) {
    console.log('Partidas: ' + partidas);
    if (partidas >= ruptura) {
        // console.log('Se ha acabado la partida al mejor de ' + ruptura);
        socket.emit('fin', partidas);
        document.getElementById('jugadores').style.display = 'none';
        document.getElementById('opciones').style.display = 'none';
        document.getElementById('consola').style.display = 'none';
        document.getElementById('ready').style.display = 'none';
        fin(puntuacion);

    }
}

function fin() {
    renderAviso('Servidor', 'Has terminado con: ' + puntuacion);

    // console.log('Has terminado con: ' + puntuacion);
    // console.log('Tu enemigo tiene: ' + puntuacionEnemiga);

    socket.emit('resultado', [puntuacion, puntuacionEnemiga]);

}

function renderFin(data) {
    setTimeout(function() {
        var div = document.getElementById('fin');
        var html;
        if (data[1] == 'ganado') {
            html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">
            <img class="card-img-top" src="assets/sheldon/win.gif" alt="Sheldon Cooper">
            <div class="card-body fondo-verde text-white">
                <h1 class="card-text text-white text-center" id="descripcion">${data[0]}</h1>
                <ul>
                <li>Tus puntos: ${data[3]}</li>
                <li>Puntos enemigos: ${data[2]}</li>
            </ul>
            </div>
            </div>
            <button type="button" class="btn btn-outline-danger btn-lg btn-block mb-3" onClick="location.reload()">Salir</button>`;
            document.getElementsByTagName("body")[0].style.background = '#28a745';
        } else if (data[1] == 'perdido') {
            html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">
            <img class="card-img-top" src="assets/sheldon/lose.gif" alt="Sheldon Cooper">
            <div class="card-body fondo-rojo text-white">
                <h1 class="card-text text-white text-center" id="descripcion">${data[0]}</h1>
                <ul>
                <li>Tus puntos: ${data[3]}</li>
                <li>Puntos enemigos: ${data[2]}</li>
            </ul>
            </div>
            </div>
            <button type="button" class="btn btn-outline-info btn-lg btn-block mb-3" onClick="location.reload()">Salir</button>`;
            document.getElementsByTagName("body")[0].style.background = '#dc3545';
        } else if (data[1] == 'empatado') {
            html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">
            <img class="card-img-top" src="assets/sheldon/empate.gif" alt="Sheldon Cooper">
            <div class="card-body fondo-azul text-white">
                <h1 class="card-text text-white text-center" id="descripcion">${data[0]}</h1>
                <ul>
                <li>Tus puntos: ${data[3]}</li>
                <li>Puntos enemigos: ${data[2]}</li>
            </ul>
            </div>
            </div>
            <button type="button" class="btn btn-outline-danger btn-lg btn-block mb-3" onClick="location.reload()">Salir</button>`;
        }
        div.innerHTML = html;

        socket.emit('historial', [nick, data[3]]);
        socket.off('jugadores');
        socket.off('jugada');
        socket.off('welcome');
        socket.off('partida-resultado');
        socket.off('connectToRoom');
        socket.off('tuEleccion');
        socket.off('partida');
        socket.off('eleccionEnemiga');
        socket.off('aviso');
        socket.off('addmensaje');
        socket.off('addmensajeglobal');
        socket.disconnect();

    }, 5000);
}

function sheldon(opcion, opcionEnemiga, resultado) {
    if ((opcion == 'tijera' || opcionEnemiga == 'tijera') && (opcion == 'piedra' || opcionEnemiga == 'piedra')) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">
        <img class="card-img-top" src="assets/sheldon/piedra-tijera.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Piedra aplasta Tijera</p>
        </div>
        </div>`;
        document.getElementById('sheldon').innerHTML = html;
    } else if ((opcion == 'papel' || opcionEnemiga == 'papel') && (opcion == 'piedra' || opcionEnemiga == 'piedra')) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">
        <img class="card-img-top" src="assets/sheldon/papel-piedra.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Papel cubre Piedra</p>
        </div>
     </div>`;
        document.getElementById('sheldon').innerHTML = html;
    } else if ((opcion == 'spock' || opcionEnemiga == 'spock') && (opcion == 'piedra' || opcionEnemiga == 'piedra')) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">
        <img class="card-img-top" src="assets/sheldon/spock-piedra.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Spock vaporiza Piedra</p>
        </div>
     </div>`;
        document.getElementById('sheldon').innerHTML = html;
    } else if ((opcion == 'lagarto' || opcionEnemiga == 'lagarto') && (opcion == 'piedra' || opcionEnemiga == 'piedra')) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">
        <img class="card-img-top" src="assets/sheldon/piedra-lagarto.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Piedra aplasta Lagarto</p>
        </div>
     </div>`;
        document.getElementById('sheldon').innerHTML = html;
    } else if ((opcion == 'tijera' || opcionEnemiga == 'tijera') && (opcion == 'papel' || opcionEnemiga == 'papel')) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;"> 
        <img class="card-img-top" src="assets/sheldon/tijeras-papel.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Tijera corta Papel</p>
        </div>
     </div>`;
        document.getElementById('sheldon').innerHTML = html;
    } else if ((opcion == 'tijera' || opcionEnemiga == 'tijera') && (opcion == 'spock' || opcionEnemiga == 'spock')) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">  
        <img class="card-img-top" src="assets/sheldon/spock-tijeras.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Spock destroza Tijera</p>
        </div>
     </div>`;
        document.getElementById('sheldon').innerHTML = html;
    } else if ((opcion == 'tijera' || opcionEnemiga == 'tijera') && (opcion == 'lagarto' || opcionEnemiga == 'lagarto')) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;"> 
        <img class="card-img-top" src="assets/sheldon/tijera-lagarto.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Tijera decapita Lagarto</p>
        </div>
     </div>`;
        document.getElementById('sheldon').innerHTML = html;
    } else if ((opcion == 'papel' || opcionEnemiga == 'papel') && (opcion == 'lagarto' || opcionEnemiga == 'lagarto')) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">
        <img class="card-img-top" src="assets/sheldon/lagarto-papel.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Lagarto come Papel</p>
        </div>
     </div>`;
        document.getElementById('sheldon').innerHTML = html;
    } else if ((opcion == 'papel' || opcionEnemiga == 'papel') && (opcion == 'spock' || opcionEnemiga == 'spock')) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">  
        <img class="card-img-top" src="assets/sheldon/papel-spock.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Papel desaprueba Spock</p>
        </div>
     </div>`;
        document.getElementById('sheldon').innerHTML = html;
    } else if ((opcion == 'spock' || opcionEnemiga == 'spock') && (opcion == 'lagarto' || opcionEnemiga == 'lagarto')) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">
        <img class="card-img-top" src="assets/sheldon/lagarto-spock.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Lagarto envenena Spock</p>
        </div>
     </div>`;
        document.getElementById('sheldon').innerHTML = html;
    } else if (opcion == opcionEnemiga) {
        var html = `<div class="card mx-auto card-sin-borde fondo-azul" id="card-sheldon" style="width: 18rem;">
        <img class="card-img-top" src="assets/sheldon/empate.jpg" alt="Sheldon Cooper">
        <div class="card-body fondo-azul text-white">
            <p class="card-text text-white" id="descripcion">Sección 8, Subsección C, Párrafo 4: Empate, Sheldon gana</p>
        </div>
     </div>`;
        document.getElementById('sheldon').innerHTML = html;
    }
}