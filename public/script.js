const socket = io();

let myRoomId = null;
let myScore = 0;
let oppScore = 0;
let round = 0;
let currentTheme = 'pirate';

const themes = {
    pirate: {
        title: '⚓ Pirates of the Caribbean ⚓',
        subtitle: '— A Game of Cannon, Map & Cutlass —',
        waiting: '⚓ Waiting for another pirate to join the seas...',
        connected: (n) => `⚔️ A pirate has joined! You are Player ${n}. Choose your weapon!`,
        moved: '🗺️ Move sent! Waiting for opponent...',
        rock: '💣', paper: '🗺️', scissors: '⚔️',
        win: '🏆', lose: '💀', tie: '⚓'
    },
    mermaid: {
        title: '🧜‍♀️ Rock Paper Scissors 🧜‍♀️',
        subtitle: '— Depths of the Ocean —',
        waiting: '🌊 Waiting for another soul from the deep...',
        connected: (n) => `🐚 A challenger appears! You are Player ${n}. Make your move!`,
        moved: '🌊 Move sent! Waiting for opponent...',
        rock: '🪨', paper: '📜', scissors: '✂️',
        win: '🐚', lose: '🌊', tie: '🔱'
    }
};

function switchTheme() {
    const html = document.documentElement;
    currentTheme = currentTheme === 'pirate' ? 'mermaid' : 'pirate';
    html.setAttribute('data-theme', currentTheme);
    const t = themes[currentTheme];
    document.getElementById('title').innerText = t.title;
    document.getElementById('subtitle').innerText = t.subtitle;
    document.getElementById('rock-emoji').innerText = t.rock;
    document.getElementById('paper-emoji').innerText = t.paper;
    document.getElementById('scissors-emoji').innerText = t.scissors;
    document.getElementById('status').innerText =
        myRoomId ? `${t.tie} Theme switched!` : t.waiting;
}

socket.on('waiting', () => {
    document.getElementById('status').innerText = themes[currentTheme].waiting;
});

socket.on('start', ({ roomId, playerNumber }) => {
    myRoomId = roomId;
    document.getElementById('status').innerText =
        themes[currentTheme].connected(playerNumber);
});

socket.on('result', ({ yourMove, opponentMove, result }) => {
    round++;
    document.getElementById('round').innerText = `Round ${round}`;
    if (result === 'win') myScore++;
    if (result === 'lose') oppScore++;
    document.getElementById('my-score').innerText = myScore;
    document.getElementById('opp-score').innerText = oppScore;
    const t = themes[currentTheme];
    const icon = result === 'win' ? t.win : result === 'lose' ? t.lose : t.tie;
    document.getElementById('status').innerText =
        `${icon} You: ${yourMove} | Opponent: ${opponentMove} — You ${result}!`;
});

function sendMove(move) {
    if (!myRoomId) {
        alert('Wait for another player to join!');
        return;
    }
    socket.emit('move', { roomId: myRoomId, move });
    document.getElementById('status').innerText = themes[currentTheme].moved;
}