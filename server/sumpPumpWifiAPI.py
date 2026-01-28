import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import json
from datetime import datetime

load_dotenv('/opt/IOTServer/server/.env', override=True)

BIND_HOST = os.getenv('BIND_HOST', '0.0.0.0') #
PORT = int(os.getenv('API_PORT',5000))
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASS'),
    'database': os.getenv('DB_NAME')
}

app = Flask(__name__)
CORS(app)


@app.route('/api/data', methods=['GET', 'POST'])
def handle_data():
    if request.method == 'POST':
        try:
            data = request.get_json()

            # Add the timestamp to the JSON dictionary
            data['datetime'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            print(f"Received Data with Timestamp: {data}")

            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor()
            query = "INSERT INTO sumpData (payload) VALUES (%s)"
            cursor.execute(query, (json.dumps(data),))
            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({"status": "success"}), 200
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"status": "error", "message": str(e)}), 500

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, payload FROM sumpData ORDER BY id DESC LIMIT 10")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    api_host = os.getenv('API_HOST', '0.0.0.0')
    api_port = int(os.getenv('API_PORT', 5000))
    app.run(host=api_host, port=api_port)