var express = require("express");
var app = express();
var formidable = require('formidable');
var server = require("http").Server(app);
var io = require("socket.io")(server);
var util = require("util");

var mongoose = require("mongoose");
// The reason for this demo.

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://sheldon:sheldon@ds151908.mlab.com:51908/sheldon';

// The http server will listen to an appropriate port, or default to
// port 5000.
var theport = process.env.PORT || 5000;

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function(err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
    }
});


var Schema = new mongoose.Schema({
    nombre: String,
    puntos: Number
});

var schemaInsert = mongoose.model('historial', Schema);



app.use(express.static("public"));

class Jugador {
    constructor(nick, ip) {
        this.nombre = nick;
        this.opcion = '';
        this.ip = ip;
        this.partidas = 0;
    }
    setSala(sala) {
        this.sala = sala;
    }
    eligeOpcion(x) {
        this.opcion = x;
    }
    setId(n) {
        this.id = n;
    }
    setPuntuacion(n) {
        this.puntuacion = n;
    }

    estoyPreparado(eleccion) {
        this.opcion = eleccion;
        this.preparado = true;
    }
    enemigoPreparado(eleccionEnem) {
        this.opcionEnemiga = eleccionEnem;
        this.preparadoEnemigo = true;
    }
    setHistorial(nick, dato) {
        this.historial = {
            nombre: nick,
            puntos: dato
        };
    }

}


var roomno = 0;
var jugadores = [];

function filtrarJugadores(sala, arrayJugadores) {
    var jugadoresFiltrados = [];
    for (let i = 0; i < arrayJugadores.length; i++) {
        if (sala == arrayJugadores[i].sala) {
            jugadoresFiltrados.push(arrayJugadores[i]);

        }
    }
    return jugadoresFiltrados;
}


function game(j1, j2) {
    var jugada = '';
    if (j1 == 'piedra') {

        if (j2 == 'piedra') {
            jugada = 'Empate';
            console.log("Empate!");
        } else if (j2 == 'papel') {
            jugada = 'Perdiste';
            console.log("Perdiste");
        } else if (j2 == 'tijera') {
            jugada = 'Ganaste';
            console.log("Ganaste!");
        } else if (j2 == 'lagarto') {
            jugada = 'Ganaste';
            console.log("Ganaste!");
        } else if (j2 == 'spock') {
            jugada = 'Perdiste';
            console.log("Perdiste!");
        }

    } else if (j1 == 'papel') {

        if (j2 == 'piedra') {
            jugada = 'Ganaste';
            console.log("Ganaste!");
        } else if (j2 == 'papel') {
            jugada = 'Empate';
            console.log("Empate!");
        } else if (j2 == 'tijera') {
            jugada = 'Perdiste';
            console.log("Perdiste!");
        } else if (j2 == 'lagarto') {
            jugada = 'Perdiste';
            console.log("Perdiste!");
        } else if (j2 == 'spock') {
            jugada = 'Ganaste';
            console.log("Ganaste!");
        }

    } else if (j1 == 'tijera') {

        if (j2 == 'piedra') {
            jugada = 'Perdiste';
            console.log("Perdiste!");
        } else if (j2 == 'papel') {
            jugada = 'Ganaste';
            console.log("Ganaste");
        } else if (j2 == 'tijera') {
            jugada = 'Empate';
            console.log("Empate!");
        } else if (j2 == 'lagarto') {
            jugada = 'Ganaste';
            console.log("Ganaste!");
        } else if (j2 == 'spock') {
            jugada = 'Perdiste';
            console.log("Perdiste!");
        }

    } else if (j1 == 'lagarto') {

        if (j2 == 'piedra') {
            jugada = 'Perdiste';
            console.log("Perdiste!");
        } else if (j2 == 'papel') {
            jugada = 'Ganaste';
            console.log("Ganaste!");
        } else if (j2 == 'tijera') {
            jugada = 'Perdiste';
            console.log("Perdiste");
        } else if (j2 == 'lagarto') {
            jugada = 'Empate';
            console.log("Empate");
        } else if (j2 == 'spock') {
            jugada = 'Ganaste';
            console.log("Ganaste!");
        }

    } else if (j1 == 'spock') {

        if (j2 == 'piedra') {
            jugada = 'Ganaste';
            console.log("Ganaste!");
        } else if (j2 == 'papel') {
            jugada = 'Perdiste';
            console.log("Perdiste!");
        } else if (j2 == 'tijera') {
            jugada = 'Ganaste';
            console.log("Ganaste!");
        } else if (j2 == 'lagarto') {
            jugada = 'Perdiste';
            console.log("Perdiste!");
        } else if (j2 == 'spock') {
            jugada = 'Empate';
            console.log("Empate!");
        }
    }
    return jugada;
}

io.on("connection", function(socket) {
    console.log(
        "Alguien se ha conectado al socket desde la IP:" + socket.handshake.address
    );

    schemaInsert.find({}).exec(function(err, result) {
        if (!err) {
            console.log(result);
            socket.emit('json', result);

        } else {
            // error handling
        };
    });

    socket.on("nick", function(name) {
        var n = name;
        var jugador = new Jugador(name, socket.handshake.address);
        socket.on('id', function(id) {
            jugador.setId(id);
        });

        if (
            io.nsps["/"].adapter.rooms["room-" + roomno] &&
            io.nsps["/"].adapter.rooms["room-" + roomno].length > 1
        ) {
            roomno++;
        }

        socket.join("room-" + roomno);
        jugador.setSala(roomno);

        if (jugadores[jugador.sala]) {
            if (jugador.nombre == jugadores[jugador.sala].nombre) {
                jugadores[jugador.sala].nombre = jugadores[jugador.sala].nombre + '_01';
                jugador.nombre = jugador.nombre + '_02';
            }

            io.sockets
                .in("room-" + jugador.sala)
                .emit("welcome", jugadores[jugador.sala]);

        }

        jugadores.push(jugador);

        io.sockets
            .in("room-" + jugador.sala)
            .emit("connectToRoom", jugador.sala);

        io.sockets.in("room-" + jugador.sala).emit("jugadores", filtrarJugadores(jugador.sala, jugadores));

        io.sockets
            .in("room-" + jugador.sala)
            .emit("welcome", jugador);


        socket.on('juego', function(eleccion) {
            jugador.eligeOpcion(eleccion);

            socket
                .in("room-" + jugador.sala)
                .emit("aviso", jugador.nombre);

            io.sockets.connected[jugador.id].emit('tuEleccion', eleccion);

            socket.broadcast
                .in("room-" + jugador.sala)
                .emit("eleccionEnemiga", jugador.opcion);

            socket.on('preparado', function(eleccion) {
                jugador.estoyPreparado(eleccion[0]);
            });

            socket.on('enemigoPreparado', function(eleccion) {
                jugador.enemigoPreparado(eleccion[0]);

                if (jugador.preparado && jugador.preparadoEnemigo) {
                    console.log(jugador.opcion, jugador.opcionEnemiga)
                    var jugada1 = game(jugador.opcion, jugador.opcionEnemiga);
                    var jugada2 = game(jugador.opcionEnemiga, jugador.opcion);

                    io.sockets.connected[jugador.id].emit('jugada', jugada1);

                    socket.broadcast
                        .in("room-" + jugador.sala)
                        .emit("jugada", jugada2);

                    jugador.partidas += 1;


                    jugador.preparado = false;
                    jugador.preparadoEnemigo = false;

                    // io.sockets
                    // .in("room-" + jugador.sala)
                    // .emit("partidas", jugador.partidas);
                }

            });

            socket.on('puntuacion', function(data) {
                jugador.puntuacion = data;
            });

            socket.on('fin', function(data) {
                // socket
                //     .in("room-" + jugador.sala).disconnect();
            });

            socket.on('resultado', function(data) {
                puntuacionEnemiga = data[0];
                puntuacion = data[1];
                if (puntuacion > puntuacionEnemiga) {
                    socket.broadcast
                        .in("room-" + jugador.sala)
                        .emit("partida-resultado", ['Has ganado la partida', 'ganado', puntuacionEnemiga, puntuacion]);
                } else if (puntuacion < puntuacionEnemiga) {
                    socket.broadcast
                        .in("room-" + jugador.sala)
                        .emit("partida-resultado", ['Has perdido la partida', 'perdido', puntuacionEnemiga, puntuacion]);
                } else if (puntuacion == puntuacionEnemiga) {
                    socket.broadcast
                        .in("room-" + jugador.sala)
                        .emit("partida-resultado", ['Has empatado', 'empatado', puntuacionEnemiga, puntuacion]);
                }
            });


        });


        socket.on('add-message', function(data) {
            io.sockets
                .in("room-" + jugador.sala)
                .emit("addmensaje", data);
        });

        socket.on('add-message-global', function(data) {
            io.sockets
                .emit("addmensajeglobal", data);
        });

        socket.on('reset', function(data) {
            jugador.opcion = data;
            jugador.opcionEnemiga = data;
            jugador.preparado = false;
            jugador.preparadoEnemigo = false;
        });
        socket.on('historial', function(data) {
            jugador.setHistorial(data[0], data[1]);
            var puntos = new schemaInsert({
                nombre: jugador.historial.nombre,
                puntos: jugador.historial.puntos
            });
            puntos.save(function(err) { if (err) console.log('Error on save!') });

        });
        socket.on('disconnect', function() {
            socket.leave(jugador.sala);
            console.log('Ha salido ' + jugador.nombre);
            jugadores.splice(jugadores.indexOf(jugador), 1);
            io.sockets.in("room-" + jugador.sala).emit("jugadores", filtrarJugadores(jugador.sala, jugadores));
        });

        app.post('/', function(req, res) {
            var form = new formidable.IncomingForm();

            form.addListener('progress', function(bytesReceived, bytesExpected) {
                socket.on('progressUpload', function(socket) {
                    socket.emit('uploadProgress', ((bytesRecieved * 100) / bytesExpected));
                });
            });


            form.parse(req);

            form.on('fileBegin', function(name, file) {
                file.path = __dirname + '/uploads/' + file.name;
            });

            form.on('file', function(name, file) {
                console.log('Uploaded ' + file.name);
            });
            res.sendFile(__dirname + '/public/index.html');
        });
    });

});





const PORT = process.env.PORT || '3000';

server.listen(PORT, function() {
    console.log('listening on *:3000');
});

// server.listen(3000, function() {
//     console.log("Servidor funcionando en http://localhost:3000");
// });