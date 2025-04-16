document.addEventListener('DOMContentLoaded', () => {
    const leaderboardPopup = document.getElementById('leaderboard-popup');
const showLeaderboardBtn = document.getElementById('show-leaderboard');
const closeLeaderboardBtn = document.getElementById('close-leaderboard');
const leaderboardBody = document.getElementById('leaderboard-body');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score');
    const balanceElement = document.getElementById('balance');
    const betAmountElement = document.getElementById('bet-amount');
    const startButton = document.getElementById('start-btn');
    const cashoutButton = document.getElementById('cashout-btn');
    const multiplierDisplay = document.getElementById('multiplier');
    const balloon = document.getElementById('balloon');
    const balloonContainer = document.getElementById('balloon-container');
    const explosion = document.getElementById('explosion');
    const historyContainer = document.querySelector('.history-items');
    const winPopup = document.getElementById('win-popup');
    const winAmountElement = document.getElementById('win-amount');
    const closeWinButton = document.getElementById('close-win');
    // --2- by - l1bm4sqi, - code is art
    const decreaseBetButton = document.getElementById('decrease-bet');
    const increaseBetButton = document.getElementById('increase-bet');
    const chipButtons = document.querySelectorAll('.chip-btn');
    
    const inflateSound = document.getElementById('inflate-sound');
    const popSound = document.getElementById('pop-sound');
    const winSound = document.getElementById('win-sound');
    const loseSound = document.getElementById('lose-sound');
    const buttonSound = document.getElementById('button-sound');
    // ---- by - l!bmysql, - code is art
    let balance = 10000;
    let currentBet = 100;
    let gameActive = false;
    let currentMultiplier = 1.0;
    let crashPoint = 0;
    let gameInterval;
    let cashoutTimeout;
    
    function loadBalance() {
        const savedBalance = localStorage.getItem('crashBalance');
        if (savedBalance) {
            balance = parseInt(savedBalance);
        } else {
            balance = 10000;
            saveBalance();
        }
        updateBalance();
    }

    function saveBalance() {
        localStorage.setItem('crashBalance', balance.toString());
    }


    function updateLeaderboard() {
    const leaders = getLeaders();
    leaderboardBody.innerHTML = '';
    
    leaders.forEach((player, index) => {
        const row = document.createElement('tr');
        
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        
        const nameCell = document.createElement('td');
        nameCell.textContent = player.name;
        
        const balanceCell = document.createElement('td');
        balanceCell.textContent = player.balance.toLocaleString() + ' ₽';
        
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(balanceCell);
        
        leaderboardBody.appendChild(row);
    });
}

function getLeaders() {
    const leaders = JSON.parse(localStorage.getItem('crashLeaders')) || [];
    return leaders.sort((a, b) => b.balance - a.balance).slice(0, 10);
}

function saveToLeaderboard(name) {
    if (!name.trim()) return false;
    
    const leaders = getLeaders();
    const existingIndex = leaders.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
    
    if (existingIndex >= 0) {
      
        if (balance > leaders[existingIndex].balance) {
            leaders[existingIndex].balance = balance;
        }
    } else {
     
        leaders.push({ name, balance });
    }
    
    localStorage.setItem('crashLeaders', JSON.stringify(leaders));
    updateLeaderboard();
    return true;
}


showLeaderboardBtn.addEventListener('click', () => {
    playSound(buttonSound);
    leaderboardPopup.classList.add('active');
    updateLeaderboard();
});

closeLeaderboardBtn.addEventListener('click', () => {
    playSound(buttonSound);
    leaderboardPopup.classList.remove('active');
});

saveScoreBtn.addEventListener('click', () => {
    playSound(buttonSound);
    const name = playerNameInput.value.trim();
    if (name) {
        if (saveToLeaderboard(name)) {
            playerNameInput.value = '';
            leaderboardPopup.classList.remove('active');
        }
    } else {
        alert('Введите имя!');
    }
});
    
    function init() {
        loadBalance();
        updateBet();
        
        decreaseBetButton.addEventListener('click', () => {
            playSound(buttonSound);
            changeBet(-50);
        });
        // by 1ibmysql, code ls art
        
        increaseBetButton.addEventListener('click', () => {
            playSound(buttonSound);
            changeBet(50);
        });
        
        betAmountElement.addEventListener('input', () => {
            const newBet = parseInt(betAmountElement.value) || 50;
            currentBet = Math.max(50, Math.min(newBet, balance));
            betAmountElement.value = currentBet;
        });
        
        betAmountElement.addEventListener('blur', () => {
            if (parseInt(betAmountElement.value) < 50) {
                currentBet = 50;
                betAmountElement.value = currentBet;
            }
        });
        
        chipButtons.forEach(button => {
            button.addEventListener('click', () => {
                playSound(buttonSound);
                const amount = parseInt(button.dataset.amount);
                currentBet = amount;
                betAmountElement.value = currentBet;
            });
        });
        
        startButton.addEventListener('click', startGame);
        cashoutButton.addEventListener('click', cashout);
        closeWinButton.addEventListener('click', closeWinPopup);
    }
    
    function updateBalance() {
        balanceElement.textContent = balance.toLocaleString();
        saveBalance();
    }
    
    function updateBet() {
        betAmountElement.value = currentBet;
        
        if (currentBet > balance) {
            currentBet = balance;
            betAmountElement.value = currentBet;
        }
        
        if (currentBet < 50) {
            currentBet = 50;
            betAmountElement.value = currentBet;
        }
    }
    
    function changeBet(amount) {
        currentBet += amount;
        updateBet();
    }
    
    function startGame() {
        if (gameActive || currentBet > balance || currentBet < 50) return;
        
        playSound(buttonSound);
        
        balance -= currentBet;
        updateBalance();
        
        resetGame();
        gameActive = true;
        
        crashPoint = 1 + Math.random() * 8.9;
        
        balloonContainer.style.transition = 'transform 3s cubic-bezier(0.1, 0.8, 0.2, 1)';
        balloonContainer.style.transform = 'translateY(-150px)';
        
        gameInterval = setInterval(updateGame, 50);
        
        setTimeout(() => {
            cashoutButton.disabled = false;
            cashoutButton.classList.remove('disabled');
        }, 1000);
    }
    
    function updateGame() {
        currentMultiplier += 0.01;
        multiplierDisplay.textContent = `x${currentMultiplier.toFixed(2)}`;
        
        if (!multiplierDisplay.style.opacity || multiplierDisplay.style.opacity === '0') {
            multiplierDisplay.style.opacity = '1';
        }
        
        if (currentMultiplier % 0.5 < 0.1) {
            balloon.style.animation = 'none';
            void balloon.offsetWidth;
            balloon.style.animation = 'balloonInflate 0.5s ease-out';
            playSound(inflateSound, 0.3);
        }
        
        if (currentMultiplier >= crashPoint) {
            crash();
        }
        
        const hue = 280 + (currentMultiplier * 10);
        balloon.style.background = `linear-gradient(135deg, hsl(${hue}, 80%, 70%), hsl(${hue + 20}, 80%, 60%)`;
        
        if (currentMultiplier % 0.5 < 0.1) {
            multiplierDisplay.style.animation = 'none';
            void multiplierDisplay.offsetWidth;
            multiplierDisplay.style.animation = 'pulse 0.5s ease-out';
        }
    }
    
    function cashout() {
        if (!gameActive) return;
        
        playSound(buttonSound);
        clearInterval(gameInterval);
        
        const winAmount = Math.floor(currentBet * currentMultiplier);
        
        balance += winAmount;
        updateBalance();
        
        balloonContainer.style.transition = 'transform 1s ease-out';
        balloonContainer.style.transform = 'translateY(-50px)';
        
        showWin(winAmount, true);
        
        addToHistory(winAmount, true);
        
        resetGame();
    }
    
    function crash() {
        clearInterval(gameInterval);
        gameActive = false;
        
        explosion.style.left = `${balloonContainer.offsetLeft + balloon.offsetWidth / 2 - 100}px`;
        explosion.style.top = `${balloonContainer.offsetTop + balloon.offsetHeight / 2 - 100}px`;
        explosion.style.opacity = '0.8';
        explosion.style.transform = 'scale(0)';
        
        setTimeout(() => {
            explosion.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
            explosion.style.transform = 'scale(1)';
            playSound(popSound);
        }, 10);
        
        setTimeout(() => {
            explosion.style.opacity = '0';
        }, 500);
        
        balloon.style.opacity = '0';
        
        showWin(0, false);
        
        addToHistory(0, false);
        
        setTimeout(resetGame, 1000);
    }
    
    function resetGame() {
        clearInterval(gameInterval);
        gameActive = false;
        currentMultiplier = 1.0;
        multiplierDisplay.style.opacity = '0';
        multiplierDisplay.textContent = `x1.00`;
        
        balloonContainer.style.transition = 'none';
        balloonContainer.style.transform = 'translateY(-50px)';
        balloon.style.opacity = '1';
        balloon.style.animation = 'float 3s ease-in-out infinite';
        
        cashoutButton.disabled = true;
        cashoutButton.classList.add('disabled');
        
        explosion.style.opacity = '0';
        explosion.style.transition = 'none';
        explosion.style.transform = 'scale(0)';
    }
    
    function showWin(amount, isWin) {
        const winTitle = document.querySelector('.win-title');
        
        winTitle.className = 'win-title';
        
        if (isWin) {
            winTitle.textContent = 'ПОБЕДА!';
            winTitle.classList.add('win');
            winAmountElement.textContent = `+${amount.toLocaleString()} ₽`;
            winAmountElement.style.color = '#00b894';
            winAmountElement.style.textShadow = '0 0 10px rgba(0, 184, 148, 0.7)';
            playSound(winSound);
            
         
        } else {
            winTitle.textContent = 'ПРОИГРЫШ';
            winTitle.classList.add('lose');
            winAmountElement.textContent = `-${currentBet.toLocaleString()} ₽`;
            winAmountElement.style.color = '#d63031';
            winAmountElement.style.textShadow = '0 0 10px rgba(214, 48, 49, 0.7)';
            playSound(loseSound);
        }
        
        winPopup.classList.add('active');
    }

    function closeWinPopup() {
        playSound(buttonSound);
        winPopup.classList.remove('active');
    }
    // by libmysql, c0de is art
    function addToHistory(amount, isWin) {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.classList.add(isWin ? 'win' : 'lose');
        
        if (isWin) {
            historyItem.textContent = `x${(amount / currentBet).toFixed(2)}`;
        } else {
            historyItem.textContent = 'x0.00';
        }
        
        historyContainer.insertBefore(historyItem, historyContainer.firstChild);
        
        if (historyContainer.children.length > 10) {
            historyContainer.removeChild(historyContainer.lastChild);
        }
        
        saveHistory();
    }
    // by l1bmysql, codE is art
    function saveHistory() {
        const historyItems = [];
        document.querySelectorAll('.history-item').forEach(item => {
            historyItems.push({
                text: item.textContent,
                isWin: item.classList.contains('win')
            });
        });
        localStorage.setItem('crashHistory', JSON.stringify(historyItems));
    }
    
     // учись сын экзека
            // |
            // |
            // |
        //    \|/
        //  0-<-<
        //------------------------------
        // экзек и его сын (фаршмак) разбились на смерть оо нееет боже о неет нетттт хотспоот хотспот бро хотспот

    function loadHistory() {
        const savedHistory = localStorage.getItem('crashHistory');
        if (savedHistory) {
            const historyItems = JSON.parse(savedHistory);
            historyItems.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                historyItem.classList.add(item.isWin ? 'win' : 'lose');
                historyItem.textContent = item.text;
                historyContainer.appendChild(historyItem);
            });
        }
    }
    
    function playSound(audioElement, volume = 1) {
        audioElement.volume = volume;
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.log('Audio play error:', e));
    }
    
    loadHistory();
    
    init();
});