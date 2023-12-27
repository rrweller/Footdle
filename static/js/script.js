document.addEventListener('DOMContentLoaded', () => {
    const agentGrid = document.getElementById('agentGrid');
    const agentSound = document.getElementById('agentSound');
    let selectedAgent = '';
    const strikeContainer = document.getElementById('strikeContainer');
    let strikes = 0;
    const maxStrikes = 5;
    const submitButton = document.getElementById('submitGuess');

    // Function to create agent elements
    //const loadAgents = () => {
        //console.log(agents);
        //Object.keys(agents).forEach(agentName => {
            //const agentElem = document.createElement('img');
            //agentElem.src = `static/agents/${agentName}/${agentName}.png`;
            //agentElem.alt = agentName;
            //agentElem.classList.add('agent');
            //agentElem.addEventListener('click', () => selectAgent(agentName));
            //agentGrid.appendChild(agentElem);
        //});
    //};

    agentGrid.addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG' && event.target.classList.contains('agent')) {
            selectAgent(event.target.alt);
        }
    });

    // Function to play the sound file for the current guess
    const playSound = (guessNumber) => {
        if (guessNumber < 5) {
            const soundFileName = agents[dailyAgent].sounds[guessNumber];
            if (soundFileName) {
                const soundPath = `static/agents/${dailyAgent}/${soundFileName}`;
                console.log("Playing sound:", soundPath);
                agentSound.src = soundPath;
                agentSound.play().catch(e => console.error("Error playing sound:", e));
            } else {
                console.error("Sound file not found for guess number", guessNumber);
            }
        }
    };

    // Function to handle agent selection
    const selectAgent = (name) => {
        // Remove the 'selected' class from all agents
        document.querySelectorAll('.agent').forEach(agent => {
            agent.classList.remove('selected');
        });
        
        // Add the 'selected' class to the clicked agent
        const selectedElem = document.querySelector(`img[alt="${name}"]`);
        if (selectedElem) {
            selectedElem.classList.add('selected');
            selectedAgent = name;
        }
    };

    // Function to update strike indicators
    const updateStrikes = (isCorrect) => {
        const strikeElems = document.querySelectorAll('.strike');
        strikeElems[strikes].classList.remove('empty');
        strikeElems[strikes].innerHTML = isCorrect ? '✓' : '✖';
        strikeElems[strikes].classList.add(isCorrect ? 'right' : 'wrong');
    };

    // Event listener for the submit button
    submitButton.addEventListener('click', () => {
        const correctAgent = dailyAgent;
        console.log("Strikes are now ", strikes);
        if (selectedAgent) {
            if (selectedAgent === correctAgent) {
                updateStrikes(true);
                alert('YOU WIN!');
                endGame();
            } else {
                updateStrikes(false);
                document.querySelector(`img[alt="${selectedAgent}"]`).classList.add('greyscale');
                playSound(strikes+1);
                strikes++;
                if (strikes >= maxStrikes) {
                    alert('Game Over!');
                    endGame();
                }
            }
        } else {
            alert('Please select an agent before submitting.');
        }
    });

    // Function to end the game
    const endGame = () => {
        submitButton.disabled = true;  // Disable the submit button
        // Optional: You can also disable all agent images to prevent further selections
        document.querySelectorAll('.agent').forEach(agent => {
            agent.removeEventListener('click');
            agent.style.pointerEvents = 'none';
        });
    };

    // Assuming 'agents' is a global variable injected by Flask containing agent names
    //loadAgents();
    playSound(0);
});
