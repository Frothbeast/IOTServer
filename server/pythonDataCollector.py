import os
from dotenv import load_dotenv
import socket
import mysql.connector

# Load environment variables
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
            conn_db = mysql.connector.connect(**db_config)
            cursor = conn_db.cursor()
            conn, addr = server_socket.accept()
            with conn:
                data = conn.recv(1024)
                if data:
                    decoded_data = data.decode('ascii').strip()
                    print(f"Received {decoded_data}")
                    # query = "INSERT INTO frothbeast.sumpData (payload) VALUES (%s)"
                    query = f"INSERT INTO {db_config['database']}.sumpData (payload) VALUES (%s)"
                    cursor.execute(query, (decoded_data,))
                    conn_db.commit()
                    print(f"Inserted into {db_config['database']}.sumpData")
                    print(f"Received from {addr}: {decoded_data}")

            cursor.close()
            conn_db.close()

        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    start_collector()