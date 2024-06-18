const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const grid = 20;
let count = 0;
let speed = 10;
let snake = {
    x: grid * 5,
    y: grid * 5,
    cells: [],
    maxCells: 4
};
let apple = {
    x: grid * 10,
    y: grid * 10
};
let dx = grid;
let dy = 0;
let score = 0;
let gameLoopId;

const gameOverMessage = document.getElementById('gameOverMessage');
const startGameButton = document.getElementById('startGameButton');
const exitGameButton = document.getElementById('exitGameButton');
const currentScore = document.getElementById('currentScore');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function updateLeaderboard(score) {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push(score);
    leaderboard.sort((a, b) => b - a);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 5)));
    renderLeaderboard();
}

function renderLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    leaderboard.forEach(score => {
        const li = document.createElement('li');
        li.textContent = score;
        leaderboardList.appendChild(li);
    });
}

function updateScore() {
    currentScore.textContent = `Score: ${score}`;
}

function resetGame() {
    snake.x = grid * 5;
    snake.y = grid * 5;
    snake.cells = [];
    snake.maxCells = 4;
    dx = grid;
    dy = 0;
    score = 0;
    speed = 10;
    apple.x = getRandomInt(0, canvas.width / grid) * grid;
    apple.y = getRandomInt(0, canvas.height / grid) * grid;
    gameOverMessage.style.display = 'none';
    startGameButton.style.display = 'none';
    exitGameButton.style.display = 'none';
    updateScore();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function endGame() {
    cancelAnimationFrame(gameLoopId);
    updateLeaderboard(score);
    gameOverMessage.style.display = 'block';
    startGameButton.style.display = 'inline-block';
    exitGameButton.style.display = 'inline-block';
}

function gameLoop() {
    gameLoopId = requestAnimationFrame(gameLoop);
    if (++count < speed) return;

    count = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.x += dx;
    snake.y += dy;

    if (snake.x < 0) snake.x = canvas.width - grid;
    else if (snake.x >= canvas.width) snake.x = 0;

    if (snake.y < 0) snake.y = canvas.height - grid;
    else if (snake.y >= canvas.height) snake.y = 0;

    snake.cells.unshift({ x: snake.x, y: snake.y });

    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

    ctx.fillStyle = 'green';
    snake.cells.forEach((cell, index) => {
        ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            score++;
            speed = Math.max(4, speed - 0.5); // Increase speed by reducing the frame count
            apple.x = getRandomInt(0, canvas.width / grid) * grid;
            apple.y = getRandomInt(0, canvas.height / grid) * grid;
            updateScore();
        }

        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                endGame();
            }
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && dx === 0) {
        dx = -grid;
        dy = 0;
    } else if (e.key === 'ArrowUp' && dy === 0) {
        dy = -grid;
        dx = 0;
    } else if (e.key === 'ArrowRight' && dx === 0) {
        dx = grid;
        dy = 0;
    } else if (e.key === 'ArrowDown' && dy === 0) {
        dy = grid;
        dx = 0;
    }
});

startGameButton.addEventListener('click', resetGame);
exitGameButton.addEventListener('click', () => {
    cancelAnimationFrame(gameLoopId);
    gameOverMessage.style.display = 'none';
    startGameButton.style.display = 'inline-block';
    exitGameButton.style.display = 'none';
});

renderLeaderboard();
resetGame();
