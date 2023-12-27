document.addEventListener('DOMContentLoaded', () => {
    const agentGrid = document.getElementById('agentGrid');
    let selectedAgent = '';
    const submitButton = document.getElementById('submitGuess');

    // Function to create agent elements
    const loadAgents = () => {
        agents.forEach(agentName => {
            const agentElem = document.createElement('img');
            agentElem.src = `static/agents/${agentName}/${agentName}.png`;
            agentElem.alt = agentName;
            agentElem.classList.add('agent');
            agentElem.addEventListener('click', () => selectAgent(agentName));
            agentGrid.appendChild(agentElem);
        });
    };

    agentGrid.addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG' && event.target.classList.contains('agent')) {
            selectAgent(event.target.alt);
        }
    });

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

    // Event listener for the submit button
    submitButton.addEventListener('click', () => {
        const correctAgent = document.getElementById('dailyAgent').getElementsByTagName('img')[0].alt;
        if (selectedAgent) {
            console.log('Selected agent:', selectedAgent);
            console.log('Correct agent: ', correctAgent);
            if (selectedAgent === correctAgent) {
                console.log('YOU WIN!');
                alert('YOU WIN!'); // Or update the DOM with a winning message
            } else {
                console.log('Try again!');
                alert('Try again!'); // Or update the DOM with a try again message
            }
        } else {
            alert('Please select an agent before submitting.');
        }
    });

    // Assuming 'agents' is a global variable injected by Flask containing agent names
    loadAgents();
});
