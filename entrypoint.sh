#!/bin/sh

# Wait for any other services (like a separate database if you had one)

# Run database migrations
echo "Running database migrations"
flask db upgrade

# Start the Flask application
echo "Starting Flask app"
exec flask run