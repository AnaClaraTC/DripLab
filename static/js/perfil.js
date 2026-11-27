(() => {
    const container = document.getElementById("contperfil");
    const token = localStorage.getItem("token") || localStorage.getItem("driplab_token");

    function limparSessao() {
        ["token", "driplab_token", "usuario", "driplab_usuario"].forEach((chave) => {
            localStorage.removeItem(chave);
        });
    }

    window.DripLabPerfilPromise = (async () => {
        if (!token) {
            limparSessao();
            window.location.replace("login.html");
            return null;
        }

        try {
            const resposta = await fetch("/api/auth/perfil", {
                headers: { Authorization: "Bearer " + token }
            });

            if (resposta.status === 401 || resposta.status === 404) {
                limparSessao();
                window.location.replace("login.html");
                return null;
            }
            if (!resposta.ok) {
                throw new Error(`Não foi possível validar o perfil (HTTP ${resposta.status}).`);
            }

            const usuario = await resposta.json();
            if (!usuario || !usuario.id_usuario) {
                throw new Error("A API retornou dados inválidos para o perfil.");
            }

            localStorage.setItem("usuario", JSON.stringify(usuario));
            localStorage.setItem("driplab_usuario", JSON.stringify(usuario));
            if (container) container.hidden = false;
            return usuario;
        } catch (erro) {
            console.error("Erro ao validar o perfil:", erro);
            window.alert("Não foi possível carregar seu perfil. Tente novamente.");
            return null;
        }
    })();

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

    if (window.location.hash === "#pagconfig") {
        const botaoConfig = document.querySelector('.opcmenuperfil[data-pagina="pagconfig"]');
        if (botaoConfig) {
            botaoConfig.click();
            document.getElementById("divlocais")?.scrollIntoView();
        }
    }
})();
