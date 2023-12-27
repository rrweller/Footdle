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
    print(f"Loaded agents are {agents}")

    #today = datetime.date.today()
    #random.seed(today.strftime("%Y%m%d"))

    #Testing purposes only
    now = datetime.datetime.now()
    seed = now.strftime("%Y%m%d%H%M")
    random.seed(seed)

    daily_agent = random.choice(list(agents.keys()))
    print(f"Todays agent is: {daily_agent}")
    
    return render_template('index.html', agents=agents, daily_agent=daily_agent, server_time=now)

if __name__ == '__main__':
    app.run(debug=True)
