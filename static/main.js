let div_resultado = document.querySelector("#resultado");

function criar(tag, texto) {
  let elemento = document.createElement(tag);

  if (texto !== undefined) {
    elemento.textContent = texto;
  }

  return elemento;
}

function criar_card(filme) {
  let card = criar("div");
  card.className = "card";

  if (filme.poster) {
    let poster = criar("img");
    poster.src = filme.poster;
    poster.alt = "Poster de " + filme.titulo;
    card.appendChild(poster);
  }

  card.appendChild(criar("h3", filme.titulo + " (" + filme.ano + ")"));
  card.appendChild(criar("p", "Gêneros: " + filme.generos.join(", ")));
  card.appendChild(criar("p", "Duração: " + filme.duracao + " min | Classificação: " + filme.classificacao));
  card.appendChild(criar("p", filme.sinopse));

  return card;
}

function mostrar_filmes(filmes, mensagem_vazia) {
  if (filmes.length === 0) {
    div_resultado.appendChild(criar("p", mensagem_vazia));
    return;
  }

  filmes.forEach(function (filme) {
    div_resultado.appendChild(criar_card(filme));
  });
}

function mostrar_resposta(dados) {
  div_resultado.innerHTML = "";

  if (dados.erro) {
    div_resultado.appendChild(criar("p", dados.erro));
  } else if (dados.filmes) {
    mostrar_filmes(dados.filmes, "Nenhum filme encontrado.");
  } else if (dados.usuarios) {
    if (dados.usuarios.length === 0) {
      div_resultado.appendChild(criar("p", "Nenhum usuário encontrado."));
    }

    dados.usuarios.forEach(function (usuario) {
      div_resultado.appendChild(criar("h2", "Favoritos de " + usuario.nome));
      mostrar_filmes(usuario.favoritos, "Este usuário não tem favoritos.");
    });
  }
}

let input_titulo = document.querySelector("#titulo"),
    botao_filme = document.querySelector("#buscar_filme"),
    input_nome = document.querySelector("#nome"),
    botao_usuario = document.querySelector("#buscar_usuario");

botao_filme.addEventListener("click", async function () {
  let titulo = input_titulo.value.trim();

  if (titulo === "") {
    mostrar_resposta({ erro: "Informe o título do filme." });
    return;
  }

  let resposta = await fetch(`/filmes/?titulo=${encodeURIComponent(titulo)}`),
      dados = await resposta.json();

  mostrar_resposta(dados);
});

botao_usuario.addEventListener("click", async function () {
  let nome = input_nome.value.trim();

  if (nome === "") {
    mostrar_resposta({ erro: "Informe o nome do usuário." });
    return;
  }

  let resposta = await fetch(`/usuarios/?nome=${encodeURIComponent(nome)}`),
      dados = await resposta.json();

  mostrar_resposta(dados);
});
