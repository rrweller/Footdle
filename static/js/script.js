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

    // Function to show the welcome modal
    function showWelcomeModal() {
        const welcomeModal = document.getElementById('welcomeModal');
        welcomeModal.style.display = 'block';
    }

    // Function to close the welcome modal
    function closeWelcomeModal() {
        const welcomeModal = document.getElementById('welcomeModal');
        welcomeModal.style.display = 'none';
    }

    // Event listener for the "Let's start!" button
    document.getElementById('startQuizBtn').addEventListener('click', () => {
        // Close the welcome modal
        closeWelcomeModal();
    
        // Then play the first sound
        playSound(0);
    
        // Try playing the sound after a slight delay to ensure user interaction is registered
        setTimeout(() => {
            agentSound.play().catch(e => console.error("Error playing sound:", e));
        }, 100);
    });

    // Check if the quizTaken cookie is set
    if (!getCookie('quizTaken')) {
        showWelcomeModal();
    }

    // Function to play the sound file for the current guess
    const playSound = (guessNumber) => {
        if (guessNumber < 5) {
            const soundFileName = selectedFiles[guessNumber];
            const mapName = maps[guessNumber];
            if (soundFileName && mapName) {
                const soundPath = `static/agents/${dailyAgent}/${soundFileName}`;
                const imagePath = `static/maps/${mapName}.png`;
                //console.log("Playing sound:", soundPath);
                agentSound.src = soundPath;
                document.getElementById('gameImage').src = imagePath; // Update map image
                if(guessNumber > 0){
                    agentSound.play().catch(e => console.error("Error playing sound:", e));
                }
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
                // Correct guess
                endGame(true, strikes + 1); // Number of attempts is strikes + 1
            } else {
                updateStrikes(false);
                const selectedElem = document.querySelector(`img[alt="${selectedAgent}"]`);
                selectedElem.classList.add('greyscale'); // Mark as guessed and greyed out
                selectedElem.classList.remove('selected'); // Deselect the agent
                selectedAgent = ''; // Clear the selected agent variable
                strikes++;
                if (strikes >= maxStrikes) {
                    // Incorrect final guess
                    endGame(false, 6); // If they fail on the last guess, record it as 6 attempts
                } else {
                    playSound(strikes); // Play next sound if not the final guess
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

    function sendDatabaseResults(quizTakenCheck, won, attempts, dailyAgent){
        if (!quizTakenCheck){
            //console.log("Quiz not taken, logging result!")
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/store_quiz_result", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    // Handle successful storage here if needed
                    //console.log('Result stored');
                }
            };
            const data = JSON.stringify({
                "won": won,
                "attempts": attempts,
                "dailyAgent": dailyAgent
            });
            xhr.send(data);
        }
    }

    const displayStats = () => {
        //console.log("Fetching and displaying daily quiz stats...");
        fetch('/quiz_stats')
            .then(response => response.json())
            .then(data => {
                const statsContainer = document.getElementById('statsContainer');
                statsContainer.innerHTML = ''; // Clear previous stats if any
                
                // Find the highest percentage
                let maxPercentage = Math.max(...Object.values(data));
                
                Object.keys(data).forEach(attempts => {
                    const wrapper = document.createElement('div');
                    wrapper.classList.add('stats-wrapper');
                    
                    const strikesDisplay = createStrikesDisplay(parseInt(attempts));
                    wrapper.appendChild(strikesDisplay);
                    
                    const barContainer = document.createElement('div');
                    barContainer.classList.add('bar-container');
    
                    const bar = document.createElement('div');
                    bar.classList.add('bar');
                    // Scale the width based on the highest percentage
                    let scaledWidth = (data[attempts] / maxPercentage) * 100;
                    bar.style.width = `${scaledWidth}%`;
                    
                    const barText = document.createElement('span');
                    barText.classList.add('bar-text');
                    barText.textContent = `${data[attempts].toFixed(0)}%`;
    
                    barContainer.appendChild(bar);
                    bar.appendChild(barText);
                    wrapper.appendChild(barContainer);
    
                    statsContainer.appendChild(wrapper);
                });
            })
            .catch(error => console.error('Error fetching quiz stats:', error));
    };    
    
    function createStrikesDisplay(attempts) {
        const strikesDisplay = document.createElement('div');
        strikesDisplay.classList.add('bar-graph-strikes-display');
        for (let i = 1; i <= maxStrikes; i++) {
            const strike = document.createElement('span');
            strike.classList.add('bar-graph-strike');
            strike.textContent = i < attempts ? '✖' : (i === attempts ? '✓' : '');
            strike.classList.add(i < attempts ? 'incorrect' : (i === attempts ? 'correct' : 'empty'));
            strikesDisplay.appendChild(strike);
        }
        return strikesDisplay;
    }

    // END GAME CONDITION
    const endGame = (won = false, attempts = 0) => {
        submitButton.disabled = true;
        document.querySelectorAll('.agent').forEach(agent => {
            agent.removeEventListener('click', handleAgentClick);
            agent.style.pointerEvents = 'none';
        });

        // Use the passed filename from the server
        const dailyAgentImage = document.getElementById('dailyAgentImage');
        const dailyAgentName = document.getElementById('dailyAgentName');

        dailyAgentImage.src = `/static/agents/${dailyAgent}/${dailyAgentImageFilename}`;
        dailyAgentName.textContent = `Today's agent was: ${dailyAgent}`;

        // Use the same logic as in updateCountdown to calculate the exact expiration time
        const serverTimeElement = document.getElementById('serverTime');
        const serverTime = new Date(serverTimeElement.innerText);
        
        const nextQuizTimeElement = document.getElementById('nextQuizTime');
        const nextQuizTimeISO = nextQuizTimeElement.innerText;
        const nextQuizTime = new Date(nextQuizTimeISO);

        // Set the cookie with the game result and attempts to expire at the next quiz time
        document.cookie = `quizTaken=${won ? 'won' : 'lost'}; expires=${nextQuizTime.toUTCString()}; path=/`;
        document.cookie = `strikes=${attempts}; expires=${nextQuizTime.toUTCString()}; path=/`;

        // Stores result data into the server database
        const quizTakenCheck = getCookie('quizTaken');
        sendDatabaseResults(quizTakenCheck, won, attempts, dailyAgent)
    
        // Show the result modal
        const resultModal = document.getElementById('resultModal');
        const resultMessage = document.getElementById('resultMessage');
        const nextQuizMessage = document.getElementById('nextQuizMessage');
        
        resultMessage.textContent = won ? 'YOU WIN!' : 'GAME OVER!';
        // Update the attemptMessage text content to show the number of attempts from the parameter
        nextQuizMessage.textContent = `Next quiz available in 24 hours.`;
        
        resultModal.style.display = "block";
        createModalStrikes(attempts, won);
        displayStats();
    };

    if (quizTakenCookieValue) {
        endGame(quizTakenCookieValue === 'won', parseInt(strikesCookieValue));
    }

    // Moved updateCountdown into script.js
    function updateCountdown() {
        // Retrieve the server time and next quiz time from the hidden HTML elements
        const serverTimeISO = document.getElementById('serverTime').innerText;
        const nextQuizTimeISO = document.getElementById('nextQuizTime').innerText;
    
        // Parse the ISO strings into Date objects
        const serverTime = new Date(serverTimeISO);
        const nextQuizTime = new Date(nextQuizTimeISO);
    
        // Calculate the difference in milliseconds between the server's next quiz time and current server time
        const now = new Date();
        // Calculate the difference in milliseconds between now and the server's time
        const timeDiff = now.getTime() - serverTime.getTime();
        // Adjust server time to "now" according to the client's local clock
        const adjustedServerTime = new Date(serverTime.getTime() + timeDiff);
    
        // Calculate the countdown based on the adjusted server time
        const diff = nextQuizTime - adjustedServerTime;
    
        // Calculate hours, minutes, and seconds
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
        // Update the countdown display
        document.getElementById('timeLeft').innerText = `${hours}h ${minutes}m ${seconds}s`;
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
