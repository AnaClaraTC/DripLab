(() => {
    const botoes = document.querySelectorAll(".opcmenuperfil[data-pagina]");
    const paginas = document.querySelectorAll(".pagina-perfil");

    botoes.forEach((botao) => {
        botao.addEventListener("click", () => {
            const paginaSelecionada = botao.dataset.pagina;

            paginas.forEach((pagina) => {
                pagina.hidden = true;
                pagina.classList.remove("ativa");
            });
            botoes.forEach((opcao) => {
                opcao.classList.remove("ativo");
            });

            const pagina = document.getElementById(paginaSelecionada);

            if (pagina) {
                pagina.hidden = false;
                pagina.classList.add("ativa");
            }

            botao.classList.add("ativo");

        });

    });
})();
