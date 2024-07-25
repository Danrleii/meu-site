const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const difficulty = urlParams.get('difficulty');
const theme = urlParams.get('theme');

const difficultySettings = {
    easy: 8,    // 8 cards (4 pairs)
    medium: 12, // 12 cards (6 pairs)
    hard: 16    // 16 cards (8 pairs)
};

const themes = {
    animes: [
        'Naruto', 'Goku', 'Luffy', 'Ichigo', 'Asta', 'Vegeta', 'Kira', 'Gon','Gojo','Tanjiro', 'Mob', 'Edward','Seia','Senku', 'Kilua', 'Saitama'
    ],
    fruits: [
        'apple', 'banana', 'grape', 'orange', 'pear', 'pineapple', 'strawberry', 'watermelon', 'abacate', 'acai', 'acerola', 'kiwi','cereja','goiaba', 'limao','manga'
    ],
    animals: [
        'cat', 'dog', 'lion', 'elephant', 'tiger', 'monkey', 'panda', 'zebra','girafa','baleia','tubarao','peixe','aguia','galinha','cavalo','rinoceronte'
    ],
   
};

let totalPairs = difficultySettings[difficulty];
let score = 0;
let firstCard, secondCard;
let lockBoard = false;
let timer = 60;
let interval;
let hintsUsed = 0;

// Carregar sons
const flipSound = new Audio('audio/folha.wav');
const winSound = new Audio('audio/win.mp3');
const loseSound = new Audio('audio/lose.mp3');

document.addEventListener('DOMContentLoaded', () => {
    createBoard();
    startTimer();
    document.getElementById('hintButton').addEventListener('click', showHint);

    if (difficulty === 'hard') {
        document.body.classList.add('difficulty-hard');
    }
});

function createBoard() {
    const gameBoard = document.getElementById('gameBoard');
    const columns = difficulty === 'hard' ? 8 : 4; // Número de colunas depende da dificuldade
    const rows = Math.ceil((totalPairs * 2) / columns); // Calcula o número de linhas necessário
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    const cards = [];
    const themeImages = themes[theme];

    for (let i = 0; i < totalPairs; i++) {
        const imgName = themeImages[i % themeImages.length];
        cards.push(createCard(imgName));
        cards.push(createCard(imgName));
    }

    shuffle(cards);

    cards.forEach(card => gameBoard.appendChild(card));
}

function createCard(imgName) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.imgName = imgName;

    const inner = document.createElement('div');
    inner.classList.add('inner');
    card.appendChild(inner);

    const frontFace = document.createElement('img');
    frontFace.src = `images/${theme}/${imgName}.jpg`; // Aqui você define o caminho para suas imagens
    frontFace.classList.add('front');
    inner.appendChild(frontFace);

    const backFace = document.createElement('div');
    backFace.classList.add('back');
    inner.appendChild(backFace);

    card.addEventListener('click', flipCard);
    return card;
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    flipSound.play(); // Toca o som ao virar a carta

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.imgName === secondCard.dataset.imgName;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    resetBoard();

    score += 10;
    document.getElementById('score').innerText = score;

    if (score === totalPairs * 10) {
        endGame(true);
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startTimer() {
    interval = setInterval(() => {
        timer--;
        document.getElementById('timer').innerText = timer;

        if (timer === 0) {
            endGame(false);
        }
    }, 1000);
}

function endGame(win) {
    clearInterval(interval);
    localStorage.setItem('score', score);
    if (win) {
        winSound.play(); // Toca o som de vitória
    } else {
        loseSound.play(); // Toca o som de derrota
    }
    setTimeout(() => {
        window.location.href = win ? 'win.html' : 'lose.html';
    }, 500); // Aguarda meio segundo antes de redirecionar
}

function showHint() {
    if (hintsUsed >= 3) {
        document.getElementById('message').innerText = 'Você já usou todas as suas dicas!';
        return;
    }

    hintsUsed++;
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.add('flipped'));

    setTimeout(() => {
        allCards.forEach(card => {
            if (!card.classList.contains('matched')) {
                card.classList.remove('flipped');
            }
        });
    }, 1000); // Mostra as cartas por 1 segundo
}
