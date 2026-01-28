# [2026-01-27] Always include all the code I write in the first place, and comment out my code that you change and insert your new correction.
from flask import Flask, request, jsonify, send_from_directory
import mysql.connector
import json
from datetime import datetime
import os

# app = Flask(__name__)
app = Flask(__name__, static_folder='../client/build', static_url_path='/')

db_config = {
    # Your database config remains here
}


@app.route('/')
def serve():
    # New route to serve the React frontend
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/data', methods=['GET', 'POST'])
def handle_data():
    if request.method == 'POST':
        try:
            data = request.get_json()
            data['datetime'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"Received Data with Timestamp: {data}")

            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor()
            query = "INSERT INTO sumpData (payload) VALUES (%s)"
            cursor.execute(query, (json.dumps(data),))
            conn.commit()
            cursor.close()
            conn.close()

            # return {jsonify({"status": "success"}), 200}
            return jsonify({"status": "success"}), 200
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"status": "error", "message": str(e)}), 500

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, payload FROM sumpData ORDER BY id DESC LIMIT 20")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        # Parse the JSON string in 'payload' back into an object for the frontend
        for row in rows:
            if isinstance(row['payload'], str):
                row['payload'] = json.loads(row['payload'])

        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Catch-all route for React Router (if used)
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)