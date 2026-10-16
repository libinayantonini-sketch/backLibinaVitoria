let div_resultado = document.querySelector("#resultado");

let filmes_encontrados = [];
let pagina_atual = 1;
let filmes_por_pagina = 2;

let paginacao = document.querySelector("#paginação");
let botao_anterior = document.querySelector("#anterior");
let botao_proxima = document.querySelector("#proxima");
let numero_pagina = document.querySelector("#pagina");

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
  card.appendChild(
    criar(
      "p",
      "Duração: " + filme.duracao + " min | Classificação: " + filme.classificacao
    )
  );
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

function mostrar_pagina_filmes() {
  div_resultado.innerHTML = "";

  let inicio = (pagina_atual - 1) * filmes_por_pagina;
  let fim = inicio + filmes_por_pagina;
  let filmes_da_pagina = filmes_encontrados.slice(inicio, fim);

  mostrar_filmes(filmes_da_pagina, "Nenhum filme encontrado.");

  let total_paginas = Math.ceil(
    filmes_encontrados.length / filmes_por_pagina
  );

  numero_pagina.textContent = `Página ${pagina_atual} de ${total_paginas}`;

  botao_anterior.disabled = pagina_atual === 1;
  botao_proxima.disabled = pagina_atual === total_paginas;
}

function mostrar_resposta(dados) {
  div_resultado.innerHTML = "";

  if (dados.erro) {
    div_resultado.appendChild(criar("p", dados.erro));

  } else if (dados.filmes) {
    filmes_encontrados = dados.filmes;
    pagina_atual = 1;

    if (filmes_encontrados.length > 5) {
      paginacao.style.display = "block";
    } else {
      paginacao.style.display = "none";
    }

    if (filmes_encontrados.length > 0) {
      mostrar_pagina_filmes();
    } else {
      mostrar_filmes([], "Nenhum filme encontrado.");
    }

  } else if (dados.usuarios) {
    if (dados.usuarios.length === 0) {
      div_resultado.appendChild(
        criar("p", "Nenhum usuário encontrado.")
      );
    }

    dados.usuarios.forEach(function (usuario) {
      div_resultado.appendChild(
        criar("h2", "Favoritos de " + usuario.nome)
      );

      mostrar_filmes(
        usuario.favoritos,
        "Este usuário não tem favoritos."
      );
    });
  }
}

let input_titulo = document.querySelector("#titulo");
let botao_filme = document.querySelector("#buscar_filme");
let input_nome = document.querySelector("#nome");
let botao_usuario = document.querySelector("#buscar_usuario");

botao_filme.addEventListener("click", async function () {
  let titulo = input_titulo.value.trim();

  if (titulo === "") {
    mostrar_resposta({
      erro: "Informe o título do filme."
    });
    return;
  }

  let resposta = await fetch(
    `/filmes/?titulo=${encodeURIComponent(titulo)}`
  );

  let dados = await resposta.json();

  mostrar_resposta(dados);
});

botao_usuario.addEventListener("click", async function () {
  let nome = input_nome.value.trim();

  if (nome === "") {
    mostrar_resposta({
      erro: "Informe o nome do usuário."
    });
    return;
  }

  let resposta = await fetch(
    `/usuarios/?nome=${encodeURIComponent(nome)}`
  );

  let dados = await resposta.json();

  mostrar_resposta(dados);
});

botao_anterior.addEventListener("click", function () {
  if (pagina_atual > 1) {
    pagina_atual--;
    mostrar_pagina_filmes();
  }
});

botao_proxima.addEventListener("click", function () {
  let total_paginas = Math.ceil(
    filmes_encontrados.length / filmes_por_pagina
  );

  if (pagina_atual < total_paginas) {
    pagina_atual++;
    mostrar_pagina_filmes();
  }
});
