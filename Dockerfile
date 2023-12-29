# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

#RUN flask db init
#RUN flask db migrate
#RUN flask db upgrade

# Define environment variable for the Flask application
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
# Update the environment variable to the path where you want the SQLite database to be created
ENV SQLALCHEMY_DATABASE_URI=sqlite:////usr/src/app/stepdle.db

# Expose port 5000 for the application
EXPOSE 80

# Copy the entrypoint script into the container
COPY entrypoint.sh /usr/src/app/entrypoint.sh
# Make the entrypoint script executable
RUN chmod +x /usr/src/app/entrypoint.sh

# Use the entrypoint script to initialize the database and start the application
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]