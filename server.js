const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let waitingPlayer = null; // holds the first player until second joins
const rooms = {};         // holds each room's game state

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    if (waitingPlayer === null) {
        // First player — make them wait
        waitingPlayer = socket;
        socket.emit('waiting');
        console.log('Player 1 is waiting...');

    } else {
        // Second player arrived — create a room
        const roomId = waitingPlayer.id + '#' + socket.id;

        // Save room state
        rooms[roomId] = {
            players: [waitingPlayer.id, socket.id],
            moves: {}
        };

        // Put both players in the room
        waitingPlayer.join(roomId);
        socket.join(roomId);

        // Tell both players the game is starting
        waitingPlayer.emit('start', { roomId, playerNumber: 1 });
        socket.emit('start', { roomId, playerNumber: 2 });

        console.log(`Room created: ${roomId}`);
        waitingPlayer = null; // reset waiting slot
    }

    // When a player sends their move
    socket.on('move', ({ roomId, move }) => {
        if (!rooms[roomId]) return;

        rooms[roomId].moves[socket.id] = move;
        console.log(`Move received from ${socket.id}: ${move}`);

        // Check if both players have moved
        const moves = rooms[roomId].moves;
        const players = rooms[roomId].players;

        if (Object.keys(moves).length === 2) {
            const move1 = moves[players[0]];
            const move2 = moves[players[1]];
            const result = getResult(move1, move2);

            // Send results to both players
            io.to(players[0]).emit('result', {
                yourMove: move1,
                opponentMove: move2,
                result: result.player1
            });
            io.to(players[1]).emit('result', {
                yourMove: move2,
                opponentMove: move1,
                result: result.player2
            });

            // Reset moves for next round
            rooms[roomId].moves = {};
        }
    });

    socket.on('disconnect', () => {
        if (waitingPlayer && waitingPlayer.id === socket.id) {
            waitingPlayer = null;
        }
        console.log('Player disconnected:', socket.id);
    });
});

function getResult(move1, move2) {
    if (move1 === move2) {
        return { player1: 'tie', player2: 'tie' };
    }
    const wins = {
        cannon: 'cutlass',
        map: 'cannon',
        cutlass: 'map'
    };
    if (wins[move1] === move2) {
        return { player1: 'win', player2: 'lose' };
    } else {
        return { player1: 'lose', player2: 'win' };
    }
}

server.listen(3000, () => {
    console.log('Server started on port 3000');
});