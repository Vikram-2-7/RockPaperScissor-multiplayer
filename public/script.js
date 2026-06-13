const socket = io();

let myRoomId = null;
let myScore = 0;
let oppScore = 0;
let round = 0;

socket.on('waiting', () => {
    document.getElementById('status').innerText = 
        '⚓ Waiting for another pirate to join the seas...';
});

socket.on('start', ({ roomId, playerNumber }) => {
    myRoomId = roomId;
    document.getElementById('status').innerText = 
        `⚔️ A pirate has joined! You are Player ${playerNumber}. Choose your weapon!`;
});

socket.on('result', ({ yourMove, opponentMove, result }) => {
    round++;
    document.getElementById('round').innerText = `Round ${round}`;

    if (result === 'win') myScore++;
    if (result === 'lose') oppScore++;

    document.getElementById('my-score').innerText = myScore;
    document.getElementById('opp-score').innerText = oppScore;

    const emoji = result === 'win' ? '🏆' : result === 'lose' ? '💀' : '⚓';
    document.getElementById('status').innerText = 
        `${emoji} You played ${yourMove} | Opponent played ${opponentMove} — You ${result}!`;
});

function sendMove(move) {
    if (!myRoomId) {
        alert('Wait for another pirate to join!');
        return;
    }
    socket.emit('move', { roomId: myRoomId, move });
    document.getElementById('status').innerText = 
        '🗺️ Move sent! Waiting for opponent...';
}