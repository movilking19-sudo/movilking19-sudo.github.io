let level = 1;
let errors = 0;
let seconds = 0;
let timer;
let board = [];
let solution = [];
let selectedIndex = null;
let score = 0;
let notes = Array(81).fill().map(() => []);
let pencilMode = false;

function startGame() {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    startTimer();
    loadLevel();
}

function loadLevel() {
    errors = 0;
    selectedIndex = null;
    notes = Array(81).fill().map(() => []);
    document.getElementById("errors").textContent = errors;
    document.getElementById("level").textContent = level;
    document.getElementById("score").textContent = score;

    const removeMap = [
        35,38,40,42,44,46,48,50,52,54,
        56,58,60,62,64,66,68,70,72,74
    ];

    const sudoku = generateSudoku(removeMap[level - 1]);
    board = sudoku.board;
    solution = sudoku.solution;

    drawBoard();
    drawNumberPanel();
}

function drawBoard() {
    const grid = document.getElementById("sudoku");
    grid.innerHTML = "";

    board.forEach((value, i) => {
        const cell = document.createElement("div");
        cell.className = "cell";

        if (value !== 0) {
            cell.textContent = value;
            if (value === solution[i]) cell.classList.add("fixed");
            else cell.classList.add("error");
        } else if (notes[i].length) {
            cell.classList.add("notes");
            notes[i].forEach(n => {
                const span = document.createElement("span");
                span.textContent = n;
                cell.appendChild(span);
            });
        }

        cell.onclick = () => selectCell(i);
        grid.appendChild(cell);
    });

    validateBoard();
}

function selectCell(index) {
    selectedIndex = index;
    document.querySelectorAll(".cell").forEach(c => c.className = "cell");

    let r = Math.floor(index / 9);
    let c = index % 9;
    let br = Math.floor(r / 3) * 3;
    let bc = Math.floor(c / 3) * 3;

    document.querySelectorAll(".cell").forEach((cell, i) => {
        let rr = Math.floor(i / 9);
        let cc = i % 9;
        if (rr === r || cc === c ||
            (rr >= br && rr < br + 3 && cc >= bc && cc < bc + 3)) {
            cell.classList.add("highlight");
        }
    });

    document.querySelectorAll(".cell")[index].classList.add("selected");
}

function drawNumberPanel() {
    const panel = document.getElementById("number-panel");
    panel.innerHTML = "";

    const pencilBtn = document.createElement("button");
    pencilBtn.textContent = "✏️";
    pencilBtn.className = "number-btn";
    if (pencilMode) pencilBtn.classList.add("pencil-active");
    pencilBtn.onclick = () => {
        pencilMode = !pencilMode;
        drawNumberPanel();
    };
    panel.appendChild(pencilBtn);

    for (let n = 1; n <= 9; n++) {
        const btn = document.createElement("button");
        btn.textContent = n;
        btn.className = "number-btn";
        btn.onclick = () => placeNumber(n);
        panel.appendChild(btn);
    }
}

function placeNumber(num) {
    if (selectedIndex === null) return;

    if (pencilMode) {
        if (notes[selectedIndex].includes(num))
            notes[selectedIndex] = notes[selectedIndex].filter(n => n !== num);
        else notes[selectedIndex].push(num);
    } else {
        board[selectedIndex] = num;
        notes[selectedIndex] = [];

        if (num !== solution[selectedIndex]) {
            errors++;
            document.getElementById("errors").textContent = errors;
            if (errors >= 3) {
                alert("Game Over 😢");
                loadLevel();
                return;
            }
        }
    }

    drawBoard();
    drawNumberPanel();
    checkWin();
}

function validateBoard() {
    document.querySelectorAll(".cell").forEach(c => c.classList.remove("conflict"));

    for (let i = 0; i < 81; i++) {
        for (let j = i + 1; j < 81; j++) {
            if (board[i] !== 0 && board[i] === board[j] && isConflict(i, j)) {
                document.querySelectorAll(".cell")[i].classList.add("conflict");
                document.querySelectorAll(".cell")[j].classList.add("conflict");
            }
        }
    }
}

function isConflict(a, b) {
    let r1 = Math.floor(a / 9), c1 = a % 9;
    let r2 = Math.floor(b / 9), c2 = b % 9;
    return r1 === r2 || c1 === c2 ||
        (Math.floor(r1 / 3) === Math.floor(r2 / 3) &&
         Math.floor(c1 / 3) === Math.floor(c2 / 3));
}

function checkWin() {
    if (board.every((v, i) => v === solution[i])) {
        let gained = calculateScore();
        score += gained;
        alert(`🎉 Nivel completado\nScore ganado: ${gained}`);
        level = level >= 20 ? 1 : level + 1;
        loadLevel();
    }
}

function calculateScore() {
    return Math.max(10000 - seconds * 5 - errors * 500 + level * 1000, 0);
}

/* ===== GENERADOR ===== */

function generateSudoku(removeCount) {
    let board = Array(81).fill(0);
    fillBoard(board);
    let solution = [...board];

    let removed = 0;
    while (removed < removeCount) {
        let i = Math.floor(Math.random() * 81);
        if (board[i] !== 0) {
            board[i] = 0;
            removed++;
        }
    }
    return { board, solution };
}

function fillBoard(board) {
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0) {
            for (let n of shuffle([1,2,3,4,5,6,7,8,9])) {
                if (isValid(board, i, n)) {
                    board[i] = n;
                    if (fillBoard(board)) return true;
                    board[i] = 0;
                }
            }
            return false;
        }
    }
    return true;
}

function isValid(board, index, num) {
    let r = Math.floor(index / 9);
    let c = index % 9;
    let br = Math.floor(r / 3) * 3;
    let bc = Math.floor(c / 3) * 3;

    for (let i = 0; i < 9; i++) {
        if (board[r * 9 + i] === num) return false;
        if (board[i * 9 + c] === num) return false;
        let rr = br + Math.floor(i / 3);
        let cc = bc + (i % 3);
        if (board[rr * 9 + cc] === num) return false;
    }
    return true;
}

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

/* ===== TIMER ===== */

function startTimer() {
    clearInterval(timer);
    seconds = 0;
    timer = setInterval(() => {
        seconds++;
        document.getElementById("time").textContent =
            `${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
    }, 1000);
}
