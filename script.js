document.addEventListener('DOMContentLoaded', () => {
    const agentGrid = document.getElementById('agentGrid');
    const submitGuess = document.getElementById('submitGuess');
    let selectedAgent = '';

    // List of agents - replace with your actual data
    const agents = [
        { name: 'Agent 1', imageUrl: 'agent1.jpg' },
        { name: 'Agent 2', imageUrl: 'agent2.jpg' },
        // Add all agents here
    ];

    // Function to create agent elements
    const loadAgents = () => {
        agents.forEach(agent => {
            const agentElem = document.createElement('img');
            agentElem.src = agent.imageUrl;
            agentElem.alt = agent.name;
            agentElem.classList.add('agent');
            agentElem.addEventListener('click', () => selectAgent(agent.name));
            agentGrid.appendChild(agentElem);
        });
    };

    // Function to handle agent selection
    const selectAgent = (name) => {
        selectedAgent = name;
        document.querySelectorAll('.agent').forEach(agent => {
            agent.classList.remove('selected');
        });
        const selectedElem = [...agentGrid.children].find(elem => elem.alt === name);
        selectedElem.classList.add('selected');
    };

    // Function to handle guess submission
    submitGuess.addEventListener('click', () => {
        if(selectedAgent) {
            // Placeholder for submission logic
            alert(`You guessed: ${selectedAgent}`);
            // You will need to add logic to check the guess against the correct answer
        } else {
            alert('Please select an agent.');
        }
    });

    // Load the agents into the grid
    loadAgents();
});
