// PÁGINA DE PERFIL - Troca de páginas do menu lateral
// (Perfil, Favoritos e Configurações)

(() => {
    const botoes = document.querySelectorAll(".opcmenuperfil[data-pagina]");
    const paginas = document.querySelectorAll(".pagina-perfil");

    botoes.forEach((botao) => {

        botao.addEventListener("click", () => {

            // Identifica a página selecionada
            const paginaSelecionada = botao.dataset.pagina;

            // Esconde todas as páginas
            paginas.forEach((pagina) => {
                pagina.hidden = true;
                pagina.classList.remove("ativa");
            });

            // Remove a seleção de todos os botões
            botoes.forEach((opcao) => {
                opcao.classList.remove("ativo");
            });

            // Mostra a página escolhida
            const pagina = document.getElementById(paginaSelecionada);

            if (pagina) {
                pagina.hidden = false;
                pagina.classList.add("ativa");
            }

            // Destaca o botão selecionado
            botao.classList.add("ativo");

        });

    });
})();
