#
# This file captures IOT data from the network and puts it in the database
#
import os
import sys
from dotenv import load_dotenv
import socket
import mysql.connector
import time

# Load environment variables
cwd = os.getcwd()
print(f"INFO: Current Working Directory: {cwd}", file=sys.stderr)
sys.stderr.flush()

load_dotenv()

BIND_HOST = os.getenv('BIND_HOST', '0.0.0.0')
PORT = int(os.getenv('COLLECTOR_PORT', 1883))

db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASS'),
    'database': os.getenv('DB_NAME')
}
def start_collector():
    # Regular TCP socket without any SSL wrapping
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # Ensure no ssl.wrap_socket calls exist here
    server_socket.bind((BIND_HOST, PORT))
    server_socket.listen(5)

    print(f"Monitoring port {PORT} for incoming raw ASCII data...")

    while True:
        try:
            
            conn, addr = server_socket.accept()
            with conn:
                data = conn.recv(1024)
                if data:
                    decoded_data = data.decode('ascii').strip()
                    print(f"Received {decoded_data}")

                    # Establish DB connection only when data is received
                    conn_db = mysql.connector.connect(**db_config)
                    cursor = conn_db.cursor()

                    query = f"INSERT INTO {db_config['database']}.sumpData (payload) VALUES (%s)"
                    cursor.execute(query, (decoded_data,))
                    conn_db.commit()
                    print(f"Inserted into {db_config['database']}.sumpData")
                    print(f"Received from {addr}: {decoded_data}")

            cursor.close()
            conn_db.close()

        except Exception as e:
            print(f"Error: {e}")
            time.sleep(2) #give cpu a break if looping

if __name__ == "__main__":
    start_collector()
