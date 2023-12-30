from flask import Flask, render_template, request, jsonify
import os
import random
from datetime import datetime, date, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from collections import Counter

app = Flask(__name__)

# Environment configuration
if os.environ.get('FLASK_ENV') == 'production':
    # Production database (MySQL or PostgreSQL)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
else:
    # Local development SQLite database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///stepdle.sqlite'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class DailyAgent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, default=date.today, unique=True)
    agent_name = db.Column(db.String(80), nullable=False)
    sound_files = db.relationship('SoundFile', backref='daily_agent', lazy='dynamic')

class SoundFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(120), nullable=False)
    difficulty = db.Column(db.String(20))
    map_name = db.Column(db.String(80))
    daily_agent_id = db.Column(db.Integer, db.ForeignKey('daily_agent.id'), nullable=False)

class ClientQuizResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45))
    guesses = db.Column(db.Integer)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    daily_agent_id = db.Column(db.Integer, db.ForeignKey('daily_agent.id'), nullable=False)

migrate = Migrate(app, db)

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

    today = datetime.utcnow().date()
    print(f"Today is: {today}")
    random.seed(today.strftime("%Y%m%d"))

    # Calculate the start of the next day in UTC
    server_time_utc = datetime.utcnow()
    next_day_utc = (server_time_utc + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    print(f"Next day UTC is: {next_day_utc}")
    next_quiz_time_iso = next_day_utc.isoformat() + 'Z'  # Convert to ISO format
    print(f"Converted into ISO it is: {next_quiz_time_iso}")

    daily_agent = random.choice(list(agents.keys()))
    print(f'The daily agent is {daily_agent}')

    # Get the actual file name of the daily agent's image
    agent_image_filename = agents[daily_agent]['icon']

    agent_sounds = agents[daily_agent]['sounds']
    hard_files = [f for f in agent_sounds if 'hard' in f]
    med_files = [f for f in agent_sounds if 'med' in f]
    easy_files = [f for f in agent_sounds if 'easy' in f]

    selected_files = []
    maps = []

    if hard_files:
        selected_files.append(random.choice(hard_files))
    if med_files:
        selected_files.extend(random.sample(med_files, min(2, len(med_files))))
    if easy_files:
        selected_files.extend(random.sample(easy_files, min(2, len(easy_files))))

    # Extract map information
    maps = [file.split('-')[1] for file in selected_files]

    store_daily_agent(daily_agent, selected_files, maps, today)

    # Pass it to the template
    return render_template('index.html', 
                           agents=agents, 
                           daily_agent=daily_agent, 
                           daily_agent_image_filename=agent_image_filename, 
                           selected_files=selected_files, 
                           maps=maps, 
                           next_quiz_time_iso=next_quiz_time_iso)

def store_daily_agent(daily_agent, selected_files, maps, today):
    daily_agent_entry = DailyAgent.query.filter_by(date=today).first()
    if not daily_agent_entry:
        print(f'No Daily Agent entry found, adding to DB...')
        daily_agent_entry = DailyAgent(date=today, agent_name=daily_agent)
        db.session.add(daily_agent_entry)

        for file_name in selected_files:
            difficulty, map_name = file_name.split('-')[2:4]
            maps.append(map_name)  # Add map name to list
            new_sound_file = SoundFile(
                file_name=file_name,
                difficulty=difficulty,
                map_name=map_name,
                daily_agent=daily_agent_entry
            )
            db.session.add(new_sound_file)
        db.session.commit()
    else:
        print(f'Daily Agent entry already present for today, skipping...')

@app.route('/store_quiz_result', methods=['POST'])
def store_quiz_result():
    if request.method == 'POST':
        data = request.json
        ip_address = request.remote_addr  # This may not be the real IP due to proxies
        attempts = data.get('attempts')
        won = data.get('won')

        # Get today's date
        today = date.today()

        # Find today's daily agent entry in the database
        daily_agent_entry = DailyAgent.query.filter_by(date=today).first()

        if not daily_agent_entry:
            # This should not happen as we expect the daily agent to be set by the server
            # Handle the error appropriately, e.g., log it and return an error message
            app.logger.error('Daily agent not found for today')
            return jsonify({"error": "Daily agent not found"}), 500

        # Create a new quiz result entry
        new_quiz_result = ClientQuizResult(
            ip_address=ip_address,
            guesses=attempts,
            daily_agent_id=daily_agent_entry.id
        )
        db.session.add(new_quiz_result)
        db.session.commit()

        return jsonify({"message": "Result stored"}), 200
    
@app.route('/quiz_stats')
def quiz_stats():
    # Assuming there is only one quiz per day
    today = date.today()
    daily_agent_entry = DailyAgent.query.filter_by(date=today).first()

    if daily_agent_entry:
        results = ClientQuizResult.query.filter_by(daily_agent_id=daily_agent_entry.id).all()
        attempts_counter = Counter(result.guesses for result in results)
        total_attempts = sum(attempts_counter.values())

        if total_attempts == 0:
            # If no attempts were made, return 0% for each possible number of guesses
            percentages = {i: 0 for i in range(1, 7)}
        else:
            # Calculate percentages normally
            percentages = {i: (attempts_counter.get(i, 0) / total_attempts * 100) for i in range(1, 7)}

        return jsonify(percentages)

    return jsonify({}), 404

if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_ENV') == 'development')