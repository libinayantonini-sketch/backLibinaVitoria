import os

import mysql.connector
from flask import g

# gerencia a conexão com o banco de dados para acesso pelo models
# pega as informações fornecidas no arquivo .env

def get_connection():
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host=os.environ.get('DB_HOST', 'localhost'),
            port=int(os.environ.get('DB_PORT', 3306)),
            user=os.environ.get('DB_USER', 'api'),
            password=os.environ.get('DB_PASSWORD', 'api123'),
            database=os.environ.get('DB_NAME', 'api_filmes'),
            charset='utf8mb4'
        )
    return g.db


def close_connection(exception=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()
