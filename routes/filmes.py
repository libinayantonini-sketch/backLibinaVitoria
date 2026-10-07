from flask import Blueprint, request

from database import get_connection
from models.filmes import Filmes


filmes_bp = Blueprint('filmes', __name__)


# Rota de pesquisa de filmes -- inicia uma única rota lógica para filmes fora do arquivo pincipal app.py
@filmes_bp.route('/')
def busca_filmes():
    titulo = request.args.get('titulo', '').strip()
    if titulo == '':
        return { 'erro': 'Informe o parâmetro titulo' }, 400

    model = Filmes(get_connection().cursor())
    return { 'filmes': model.search(titulo) }