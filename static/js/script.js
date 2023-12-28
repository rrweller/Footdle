document.addEventListener('DOMContentLoaded', () => {
    const agentGrid = document.getElementById('agentGrid');
    const agentSound = document.getElementById('agentSound');
    const submitButton = document.getElementById('submitGuess');
    let selectedAgent = '';
    let strikes = 0;
    const maxStrikes = 5;

    // Helper function to get cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Get cookie values
    const quizTakenCookieValue = getCookie('quizTaken');
    const strikesCookieValue = getCookie('strikes');

    // Snowfall animation stuff
    function setAnimationHeight() {
        var windowHeight = window.innerHeight;
        document.documentElement.style.setProperty('--background-shift', `${windowHeight}px`);
    }
    window.addEventListener('resize', setAnimationHeight);

    // Agent click handler
    const handleAgentClick = (event) => {
        if (event.target.tagName === 'IMG' && event.target.classList.contains('agent')) {
            selectAgent(event.target.alt);
        }
    };
    agentGrid.addEventListener('click', handleAgentClick);

    // Function to play the sound file for the current guess
    const playSound = (guessNumber) => {
        if (guessNumber < 5) {
            const soundFileName = selectedFiles[guessNumber];
            const mapName = maps[guessNumber];
            if (soundFileName && mapName) {
                const soundPath = `static/agents/${dailyAgent}/${soundFileName}`;
                const imagePath = `static/maps/${mapName}.png`;
                console.log("Playing sound:", soundPath);
                agentSound.src = soundPath;
                document.getElementById('gameImage').src = imagePath; // Update map image
                agentSound.play().catch(e => console.error("Error playing sound:", e));
            } else {
                console.error("Sound file or map not found for guess number", guessNumber);
            }
        }
    };

    // Function to handle agent selection
    const selectAgent = (name) => {
        const selectedElem = document.querySelector(`img[alt="${name}"]`);
        // Check if the agent has already been guessed incorrectly
        if (selectedElem && !selectedElem.classList.contains('greyscale')) {
            document.querySelectorAll('.agent').forEach(agent => {
                agent.classList.remove('selected');
            });
            selectedElem.classList.add('selected');
            selectedAgent = name;
        }
    };    

    //---Function to update strike indicators---
    const updateStrikes = (isCorrect) => {
        const strikeElems = document.querySelectorAll('.strike');
        strikeElems[strikes].classList.remove('empty');
        strikeElems[strikes].innerHTML = isCorrect ? '✓' : '✖';
        strikeElems[strikes].classList.add(isCorrect ? 'right' : 'wrong');
    };

    submitButton.addEventListener('click', () => {
        if (selectedAgent) {
            const correctAgent = dailyAgent;
            if (selectedAgent === correctAgent) {
                updateStrikes(true);
                endGame(true, strikes + 1);
            } else {
                updateStrikes(false);
                const selectedElem = document.querySelector(`img[alt="${selectedAgent}"]`);
                selectedElem.classList.add('greyscale'); // Mark as guessed and greyed out
                selectedElem.classList.remove('selected'); // Deselect the agent
                selectedAgent = ''; // Clear the selected agent variable
                playSound(strikes + 1);
                strikes++;
                if (strikes >= maxStrikes) {
                    endGame(false, strikes);
                }
            }
        } else {
            alert('Please select an agent before submitting.');
        }
    });
    
    //---Agent right-click mark handler---
    const handleAgentRightClick = (event) => {
        event.preventDefault(); // Prevent the default context menu
        if (event.target.classList.contains('agent')) {
            event.target.classList.toggle('agent-marked');
        }
    };

    agentGrid.addEventListener('contextmenu', handleAgentRightClick);

    //---How to play button functionality---
    document.getElementById('howToPlayBtn').addEventListener('click', function() {
        document.getElementById('howToPlayModal').style.display = 'block';
    });
    
    // Get the element that closes the modal
    const closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.addEventListener('click', function() {
        document.getElementById('howToPlayModal').style.display = 'none';
    });
    
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == document.getElementById('howToPlayModal')) {
            document.getElementById('howToPlayModal').style.display = 'none';
        }
    }

    const endGame = (won = false, attempts = 0) => {
        submitButton.disabled = true;
        document.querySelectorAll('.agent').forEach(agent => {
            agent.removeEventListener('click', handleAgentClick);
            agent.style.pointerEvents = 'none';
        });

        // Set daily agent's image and name in the result modal
        const dailyAgentImage = document.getElementById('dailyAgentImage');
        const dailyAgentName = document.getElementById('dailyAgentName');

        // Assuming the agent's icon image file is named in a standard format like 'agent.png'
        dailyAgentImage.src = `static/agents/${dailyAgent}/${dailyAgent}.png`;
        dailyAgentName.textContent = `Today's agent was: ${dailyAgent}`;
    
        // Use the same logic as in updateCountdown to calculate the exact expiration time
        const serverTimeElement = document.getElementById('serverTime');
        const serverTime = new Date(serverTimeElement.innerText);
        
        const nextQuizTime = new Date(serverTime);
        nextQuizTime.setDate(serverTime.getDate() + 1);
        nextQuizTime.setHours(0, 0, 0, 0);

        // Set the cookie with the game result and attempts to expire at the next quiz time
        document.cookie = `quizTaken=${won ? 'won' : 'lost'}; expires=${nextQuizTime.toUTCString()}; path=/`;
        document.cookie = `strikes=${attempts}; expires=${nextQuizTime.toUTCString()}; path=/`;
    
        // Show the result modal
        const resultModal = document.getElementById('resultModal');
        const resultMessage = document.getElementById('resultMessage');
        const nextQuizMessage = document.getElementById('nextQuizMessage');
        
        resultMessage.textContent = won ? 'YOU WIN!' : 'GAME OVER!';
        // Update the attemptMessage text content to show the number of attempts from the parameter
        nextQuizMessage.textContent = `Next quiz available in 24 hours.`;
        
        resultModal.style.display = "block";
        createModalStrikes(attempts, won);
    };

    if (quizTakenCookieValue) {
        endGame(quizTakenCookieValue === 'won', parseInt(strikesCookieValue));
    }

    // Moved updateCountdown into script.js
    function updateCountdown() {
        const serverTimeElement = document.getElementById('serverTime');
        const serverTime = new Date(serverTimeElement.innerText);
    
        const nextQuizTime = new Date(serverTime);
        nextQuizTime.setDate(serverTime.getDate() + 1);
        nextQuizTime.setHours(0, 0, 0, 0);
    
        const now = new Date();
        const diff = nextQuizTime - now;
    
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
    
        document.getElementById('timeLeft').innerText = `${hours}h ${minutes}m ${seconds}s`;

        // Set the cookie expiration to match the next quiz time
        document.cookie = `quizAvailable=${nextQuizTime.toUTCString()}; expires=${nextQuizTime.toUTCString()}; path=/`;

        // If there is a modal on the page, update its countdown as well
        const nextQuizMessage = document.getElementById('nextQuizMessage');
        if (nextQuizMessage) {
            nextQuizMessage.textContent = `Time until next quiz: ${hours}h ${minutes}m ${seconds}s`;
        }
    }

    function createModalStrikes(attempts, won) {
        const modalStrikeContainer = document.getElementById('modalStrikeContainer');
        modalStrikeContainer.innerHTML = ''; // Clear previous strikes if any
        
        for (let i = 0; i < maxStrikes; i++) {
            const strikeElem = document.createElement('div');
            strikeElem.classList.add('strike');
            if (i < attempts - 1) { // All attempts except the last one are wrong
                strikeElem.classList.add('wrong');
                strikeElem.textContent = '✖';
            } else if (i === attempts - 1 && won) { // Last attempt is right if the user won
                strikeElem.classList.add('right');
                strikeElem.textContent = '✓';
            } else if (i === attempts - 1 && !won) { // Last attempt is wrong if the user lost
                strikeElem.classList.add('wrong');
                strikeElem.textContent = '✖';
            } else {
                strikeElem.classList.add('empty'); // Remaining strikes are empty
            }
            modalStrikeContainer.appendChild(strikeElem);
        }
    }    

    setAnimationHeight();
    playSound(0);
    updateCountdown();
    setInterval(updateCountdown, 1000);
});
