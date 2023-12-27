from flask import Flask, render_template
import os
import random
import datetime

app = Flask(__name__)

@app.route('/')
def index():
    agent_directory = os.path.join(app.static_folder, 'agents')  

    agents = {
        agent: os.listdir(os.path.join(agent_directory, agent))[0]
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
    return render_template('index.html', agents=agents, daily_agent=daily_agent)

if __name__ == '__main__':
    app.run(debug=True)
