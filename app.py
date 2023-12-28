from flask import Flask, render_template, make_response
import os
import random
import datetime

app = Flask(__name__)

@app.route('/')
def index():
    agent_directory = os.path.join(app.static_folder, 'agents')  

    agents = {
        agent: {
            'icon': next(f for f in sorted(os.listdir(os.path.join(agent_directory, agent))) if f.endswith(('.png', '.jpg', '.jpeg', '.gif'))),
            'sounds': sorted(f for f in os.listdir(os.path.join(agent_directory, agent)) if f.endswith('.mp3'))
        }
        for agent in os.listdir(agent_directory)
        if os.path.isdir(os.path.join(agent_directory, agent))
    }

    now = datetime.datetime.now()
    seed = now.strftime("%Y%m%d%H%M")
    random.seed(seed)

    daily_agent = random.choice(list(agents.keys()))
    print(f"Todays agent is: {daily_agent}")

    # Get audio files for the selected agent
    agent_sounds = agents[daily_agent]['sounds']
    hard_files = [f for f in agent_sounds if 'hard' in f]
    med_files = [f for f in agent_sounds if 'med' in f]
    easy_files = [f for f in agent_sounds if 'easy' in f]

    selected_files = []
    if hard_files:
        selected_files.append(random.choice(hard_files))
    if med_files:
        selected_files.extend(random.sample(med_files, min(2, len(med_files))))
    if easy_files:
        selected_files.extend(random.sample(easy_files, min(2, len(easy_files))))

    # Extract map information
    maps = [file.split('-')[1] for file in selected_files]

    return render_template('index.html', agents=agents, daily_agent=daily_agent, selected_files=selected_files, maps=maps, server_time=now)

if __name__ == '__main__':
    app.run(debug=True)
