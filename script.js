let deck = [];
const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
let dealerHiddenCard = null;
let betAmount = 0;
let playerBalance = 1000; // Asignar un balance inicial al jugador

const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');

const placeBetButton = document.getElementById('place-bet-button');
const betAmountInput = document.getElementById('bet-amount');
const playerCardsContainer = document.getElementById('player-cards');
const dealerCardsContainer = document.getElementById('dealer-cards');
const gameResult = document.getElementById('game-result');
const money = document.getElementById('coins')
const startButton = document.getElementById('start-button');
const betZone = document.getElementById('bet-zone');
const chips = document.querySelectorAll('.chip');


// Inicializa el doble mazo (104 cartas)
money.textContent = `Saldo actual: $${playerBalance}`; // Mostrar saldo al iniciar el juego
function createDeck() {
    deck = [];
    for (let i = 0; i < 2; i++) { // Crear dos mazos
        suits.forEach(suit => {
            values.forEach(value => {
                deck.push({ suit, value });
            });
        });
    }
}

// Baraja las cartas
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Suma el valor de las cartas
function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    hand.forEach(card => {
        if (card.value === 'A') {
            score += 11;
            aces += 1;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    });

    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }

    return score;
}

// Reparte carta
function dealCard(player) {
    const card = deck.pop(); // Eliminar la carta del mazo
    player.push(card);
    return card;
}

// Muestra las cartas en pantalla
function renderCards(container, hand, hideDealerCard = false) {
    container.innerHTML = '';
    hand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('cards');
        cardElement.textContent = `${card.value}${card.suit}`;
        
        // Si es el crupier y se debe ocultar la segunda carta
        if (hideDealerCard && index === 1) {
            cardElement.classList.add('hidden');
        }
        
        // Agrega la animación al repartir
        setTimeout(() => {
            cardElement.classList.add('animate');
        }, index * 300); // Retrasa la animación por cada carta

        container.appendChild(cardElement);
    });
}

// Empieza el juego
function startGame() {
    createDeck();
    shuffleDeck();
    
    playerHand = [];
    dealerHand = [];

    dealCard(playerHand);
    dealerHiddenCard = dealCard(dealerHand);
    dealCard(playerHand);
    dealCard(dealerHand);

    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore([dealerHand[0]]); // Solo la primera carta cuenta inicialmente

    renderCards(playerCardsContainer, playerHand);
    renderCards(dealerCardsContainer, dealerHand, true);
    
    money.textContent = `Saldo actual: $${playerBalance}`; // Mostrar saldo al iniciar el juego

    hitButton.disabled = false;
    standButton.disabled = false;
}



// Inicia el juego después de colocar la apuesta
startButton.addEventListener('click', () => {
    startGame();
    startButton.disabled = true; // Desactivar botón de inicio después de comenzar
    gameResult.textContent = ''
});

// Acciones de pedir carta
hitButton.addEventListener('click', () => {
    if (playerScore < 21) {
        dealCard(playerHand);
        playerScore = calculateScore(playerHand);
        renderCards(playerCardsContainer, playerHand);
        
        if (playerScore > 21) {
            gameResult.textContent = 'Te pasaste. ¡Pierdes!';
            hitButton.disabled = true;
            standButton.disabled = true;
        }
    }
});


// Acciones de plantarse
standButton.addEventListener('click', () => {
    renderCards(dealerCardsContainer, dealerHand); // Revelar carta oculta
    dealerScore = calculateScore(dealerHand); // Recalcular con ambas cartas

    while (dealerScore < 17) {
        dealCard(dealerHand);
        dealerScore = calculateScore(dealerHand);
        renderCards(dealerCardsContainer, dealerHand);
    }
    
    if (dealerScore > 21) {
        gameResult.textContent = `El crupier se pasó. ¡Ganaste! Ganaste $${betAmount * 2}`;
        playerBalance += betAmount * 2; // Ganancia doble
    } else if (dealerScore >= playerScore) {
        gameResult.textContent = 'El crupier gana.';
    } else {
        gameResult.textContent = `¡Ganaste! Ganaste $${betAmount * 2}`;
        playerBalance += betAmount * 2; // Ganancia doble
    }

    // Comprobar si el saldo del jugador es 0
    if (playerBalance <= 0) {
        gameResult.textContent += '\n¡Has perdido todo tu saldo! Fin del juego.';
        hitButton.disabled = true;
        standButton.disabled = true;
        startButton.disabled = true; // Desactivar el botón de inicio
    } else {
        // Si aún tiene saldo, puedes permitir volver a jugar
        startButton.disabled = false; // Habilitar botón de inicio para jugar de nuevo
    }

    hitButton.disabled = true;
    standButton.disabled = true;
    money.textContent = `Saldo actual: $${playerBalance}`; // Mostrar saldo al iniciar el juego
});
// Función para detectar si el dispositivo es táctil
// Para escritorio: drag and drop
chips.forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('value', chip.getAttribute('data-value'));
    });
});

betZone.addEventListener('dragover', (e) => {
    e.preventDefault(); // Necesario para permitir el drop
});

betZone.addEventListener('drop', (e) => {
    const chipValue = parseInt(e.dataTransfer.getData('value'));

    if (playerBalance >= chipValue) {
        playerBalance -= chipValue;
        betAmount += chipValue;
        betZone.textContent = `Apuesta total: $${betAmount}`;
        money.textContent = `Saldo actual: $${playerBalance}`;
        startButton.disabled = false; // Habilita el botón para iniciar el juego
    } else {
        alert('No tienes suficiente saldo para esta apuesta.');
    }
});

// Soporte para pantallas táctiles (móviles)
chips.forEach(chip => {
    // Detecta el inicio del toque
    chip.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        e.dataTransfer = { setData: (key, value) => chip.setAttribute('data-value', value) }; // Simulamos el dataTransfer
        chip.classList.add('dragging');
        e.dataTransfer.setData('value', chip.getAttribute('data-value'));
    });

    // Mueve la ficha con el toque
    chip.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        chip.style.position = 'absolute';
        chip.style.left = `${touch.pageX - chip.offsetWidth / 2}px`;
        chip.style.top = `${touch.pageY - chip.offsetHeight / 2}px`;
    });

    // Finaliza el toque (drop)
    chip.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const chipValue = parseInt(chip.getAttribute('data-value'));

        const betZoneRect = betZone.getBoundingClientRect();

        // Si el toque termina dentro de la zona de apuesta
        if (touch.pageX >= betZoneRect.left && touch.pageX <= betZoneRect.right && 
            touch.pageY >= betZoneRect.top && touch.pageY <= betZoneRect.bottom) {
            if (playerBalance >= chipValue) {
                playerBalance -= chipValue;
                betAmount += chipValue;
                betZone.textContent = `Apuesta total: $${betAmount}`;
                money.textContent = `Saldo actual: $${playerBalance}`;
                startButton.disabled = false; // Habilita el botón para iniciar el juego
            } else {
                alert('No tienes suficiente saldo para esta apuesta.');
            }
        }
        chip.classList.remove('dragging');
        chip.style.position = ''; // Resetea la posición después del drop
        chip.style.left = '';
        chip.style.top = '';
    });
});
