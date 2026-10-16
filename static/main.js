const div_resultado = document.querySelector("#resultado");
const paginacao = document.querySelector("#paginacao");
const botao_anterior = document.querySelector("#anterior");
const botao_proxima = document.querySelector("#proxima");
const numero_pagina = document.querySelector("#pagina");

const input_titulo = document.querySelector("#titulo");
const botao_filme = document.querySelector("#buscar_filme");
const input_nome = document.querySelector("#nome");
const botao_usuario = document.querySelector("#buscar_usuario");

let filmes_encontrados = [];
let pagina_atual = 1;
let mensagem_lista_vazia = "Nenhum filme encontrado.";
const filmes_por_pagina = 2;
let consulta_atual = 0;

function criar(tag, texto) {
  const elemento = document.createElement(tag);
  if (texto !== undefined && texto !== null) {
    elemento.textContent = texto;
  }
  return elemento;
}

function criar_card(filme) {
  const card = criar("div");
  card.className = "card";

  if (filme.poster) {
    const poster = criar("img");
    poster.src = filme.poster;
    poster.alt = "Pôster de " + filme.titulo;
    card.appendChild(poster);
  }

  card.appendChild(criar("h3", `${filme.titulo} (${filme.ano})`));
  card.appendChild(criar("p", "Gêneros: " + (filme.generos || []).join(", ")));
  card.appendChild(
    criar("p", `Duração: ${filme.duracao} min | Classificação: ${filme.classificacao}`)
  );
  card.appendChild(criar("p", filme.sinopse || "Sinopse não disponível."));
  return card;
}

function limpar_resultados() {
  div_resultado.replaceChildren();
}

function ocultar_paginacao() {
  paginacao.style.display = "none";
  numero_pagina.textContent = "";
  botao_anterior.disabled = true;
  botao_proxima.disabled = true;
}

function mostrar_filmes(filmes, mensagem_vazia = "Nenhum filme encontrado.") {
  if (!filmes || filmes.length === 0) {
    div_resultado.appendChild(criar("p", mensagem_vazia));
    return;
  }

  filmes.forEach((filme) => div_resultado.appendChild(criar_card(filme)));
}

function mostrar_pagina_filmes() {
  limpar_resultados();

  const total_paginas = Math.ceil(filmes_encontrados.length / filmes_por_pagina);

  // Não tenta paginar uma lista vazia.
  if (total_paginas === 0) {
    ocultar_paginacao();
    mostrar_filmes([]);
    return;
  }

  // Garante que a página atual continue dentro dos limites válidos.
  pagina_atual = Math.min(Math.max(pagina_atual, 1), total_paginas);

  const inicio = (pagina_atual - 1) * filmes_por_pagina;
  const fim = inicio + filmes_por_pagina;
  const filmes_da_pagina = filmes_encontrados.slice(inicio, fim);

  // Os resultados são normalizados como { filme, usuario_nome } para
  // que a mesma paginação funcione tanto na busca de filmes quanto nos favoritos.
  if (filmes_da_pagina.length === 0) {
    div_resultado.appendChild(criar("p", mensagem_lista_vazia));
  } else {
    let usuario_exibido = null;
    filmes_da_pagina.forEach((item) => {
      if (item.usuario_nome && item.usuario_nome !== usuario_exibido) {
        div_resultado.appendChild(criar("h2", "Favoritos de " + item.usuario_nome));
        usuario_exibido = item.usuario_nome;
      }
      div_resultado.appendChild(criar_card(item.filme));
    });
  }

  // Só mostra os controles quando há mais de uma página.
  paginacao.style.display = total_paginas > 1 ? "block" : "none";
  numero_pagina.textContent = `Página ${pagina_atual} de ${total_paginas}`;
  botao_anterior.disabled = pagina_atual <= 1;
  botao_proxima.disabled = pagina_atual >= total_paginas;
}

function mostrar_resposta(dados) {
  limpar_resultados();
  ocultar_paginacao();

  if (dados.erro) {
    div_resultado.appendChild(criar("p", dados.erro));
    return;
  }

  if (Array.isArray(dados.filmes)) {
    filmes_encontrados = dados.filmes.map((filme) => ({ filme, usuario_nome: null }));
    mensagem_lista_vazia = "Nenhum filme encontrado.";
    pagina_atual = 1;
    mostrar_pagina_filmes();
    return;
  }

  if (Array.isArray(dados.usuarios)) {
    if (dados.usuarios.length === 0) {
      div_resultado.appendChild(criar("p", "Nenhum usuário encontrado."));
      filmes_encontrados = [];
      return;
    }

    // Junta os favoritos dos usuários encontrados para aplicar o limite global
    // de filmes por página, em vez de renderizar todos de uma vez.
    filmes_encontrados = dados.usuarios.flatMap((usuario) =>
      (usuario.favoritos || []).map((filme) => ({
        filme,
        usuario_nome: usuario.nome,
      }))
    );
    mensagem_lista_vazia = "Este usuário não tem favoritos.";
    pagina_atual = 1;
    mostrar_pagina_filmes();
    return;
  }

  div_resultado.appendChild(criar("p", "A resposta do servidor não está no formato esperado."));
}

async function consultar(url) {
  // Identifica a consulta mais recente para evitar que respostas antigas substituam resultados novos.
  const id_consulta = ++consulta_atual;
  limpar_resultados();
  ocultar_paginacao();
  div_resultado.appendChild(criar("p", "Carregando..."));

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (id_consulta !== consulta_atual) return;

    if (!resposta.ok && !dados.erro) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    mostrar_resposta(dados);
  } catch (erro) {
    if (id_consulta !== consulta_atual) return;
    limpar_resultados();
    ocultar_paginacao();
    div_resultado.appendChild(
      criar("p", "Não foi possível realizar a consulta. Verifique a conexão com o servidor e tente novamente.")
    );
    console.error("Erro na consulta:", erro);
  }
}

botao_filme.addEventListener("click", () => {
  const titulo = input_titulo.value.trim();
  if (!titulo) {
    consulta_atual++;
    limpar_resultados();
    ocultar_paginacao();
    div_resultado.appendChild(criar("p", "Informe o título do filme."));
    return;
  }

  consultar(`/filmes/?titulo=${encodeURIComponent(titulo)}`);
});

botao_usuario.addEventListener("click", () => {
  const nome = input_nome.value.trim();
  if (!nome) {
    consulta_atual++;
    limpar_resultados();
    ocultar_paginacao();
    div_resultado.appendChild(criar("p", "Informe o nome do usuário."));
    return;
  }

  consultar(`/usuarios/?nome=${encodeURIComponent(nome)}`);
});

botao_anterior.addEventListener("click", () => {
  if (pagina_atual > 1) {
    pagina_atual--;
    mostrar_pagina_filmes();
  }
});

botao_proxima.addEventListener("click", () => {
  const total_paginas = Math.ceil(filmes_encontrados.length / filmes_por_pagina);
  if (pagina_atual < total_paginas) {
    pagina_atual++;
    mostrar_pagina_filmes();
  }
});
