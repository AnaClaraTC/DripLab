/* =====================================================
   DRIP LAB - tema.js (modo claro / modo escuro)

   COMO USAR
   1. Coloque este arquivo em ../static/js/tema.js
   2. Em TODAS as páginas, dentro do <head> (sem "defer"):
          <script src="../static/js/tema.js"></script>
   3. No menu de TODAS as páginas, troque o ícone do sol por:
          <li>
              <button type="button" id="btntema"
                      aria-label="Ativar modo escuro" aria-pressed="false">
                  <img src="../static/images/icones_menu/sol.png" alt="">
              </button>
          </li>

   O QUE ELE FAZ
   - Aplica o tema salvo ANTES da página aparecer (sem piscar).
   - Troca o tema ao clicar no botão #btntema.
   - Salva a escolha no localStorage (vale para todas as páginas).
   - Troca a imagem: sol = modo claro, lua = modo escuro.
   - O tema vira o atributo data-tema no <html>
     (o CSS usa  html[data-tema="escuro"] { ... }).
   ===================================================== */

(function () {
    "use strict";

    var CHAVE = "tema";
    var html = document.documentElement;

    var ICONES = {
        claro:  "../static/images/icones_menu/sol.png",
        escuro: "../static/images/icones_menu/lua.png"
    };

    /* ---------- Ler e salvar o tema ---------- */

    function lerTemaSalvo() {
        try {
            var salvo = localStorage.getItem(CHAVE);
            if (salvo === "claro" || salvo === "escuro") {
                return salvo;
            }
        } catch (erro) {
            /* localStorage bloqueado: segue com o padrão */
        }

        /* Padrão: claro.
           Para seguir o tema do aparelho na primeira visita, troque por:
           return window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro"; */
        return "claro";
    }

    function salvarTema(tema) {
        try {
            localStorage.setItem(CHAVE, tema);
        } catch (erro) {
            /* sem problema: o tema só não será lembrado */
        }
    }

    /* ---------- Atualizar o botão (imagem e acessibilidade) ---------- */

    function atualizarBotao(tema) {
        var botao = document.getElementById("btntema");
        if (!botao) return;

        var imagem = botao.querySelector("img");
        var escuro = (tema === "escuro");

        if (imagem) {
            imagem.src = ICONES[tema];
        }

        botao.setAttribute("aria-pressed", escuro ? "true" : "false");
        botao.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
    }

    /* ---------- Aplicar o tema ---------- */

    function aplicarTema(tema) {
        html.setAttribute("data-tema", tema);
        atualizarBotao(tema);
    }

    /* 1) Roda já no <head>, antes de a página ser desenhada */
    aplicarTema(lerTemaSalvo());

    /* 2) Quando o menu existir, liga o botão */
    document.addEventListener("DOMContentLoaded", function () {
        var botao = document.getElementById("btntema");

        atualizarBotao(html.getAttribute("data-tema") || "claro");

        if (!botao) return;

        botao.addEventListener("click", function () {
            var novo = (html.getAttribute("data-tema") === "escuro") ? "claro" : "escuro";
            aplicarTema(novo);
            salvarTema(novo);
        });
    });

    /* 3) Se o tema mudar em outra aba aberta do site, acompanha */
    window.addEventListener("storage", function (evento) {
        if (evento.key === CHAVE && (evento.newValue === "claro" || evento.newValue === "escuro")) {
            aplicarTema(evento.newValue);
        }
    });
})();