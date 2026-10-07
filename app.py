from flask import Flask, render_template, url_for

from database import close_connection
from routes.filmes import filmes_bp
from routes.usuarios import usuarios_bp


app = Flask(__name__)
app.url_map.strict_slashes = False
app.json.ensure_ascii = False
app.json.sort_keys = False
app.teardown_appcontext(close_connection)

# Indica onde fica a rota lógica e quando ela é acessada (prefix)

app.register_blueprint(filmes_bp, url_prefix='/filmes')
app.register_blueprint(usuarios_bp, url_prefix='/usuarios')


@app.route('/')
def index():
    filmes_url = url_for('filmes.busca_filmes')
    usuarios_url = url_for('usuarios.busca_usuarios')
    js_url = url_for('static', filename='main.js')
    return render_template('index.html', filmes_url=filmes_url,
                           usuarios_url=usuarios_url, js_url=js_url)


if __name__ == '__main__':
    app.run(debug=True, port=3000, host='0.0.0.0')
