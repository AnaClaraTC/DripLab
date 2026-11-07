// PÁGINA DE COMPRA - Locais de entrega: modal de novo local e máscara do CEP

(() => {
    const modalLocal = document.getElementById("modallocal");
    const formLocal = document.getElementById("formlocal");
    const listaLocais = document.getElementById("listalocais");
    const semLocais = document.getElementById("semlocais");
    const campoCep = document.getElementById("cep");

    // Máscara do CEP (00000-000)
    campoCep.addEventListener("input", () => {
        const numeros = campoCep.value.replace(/\D/g, "").slice(0, 8);
        campoCep.value = numeros.length > 5
            ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
            : numeros;
    });

    // Mostra a mensagem só quando não há nenhum local na lista
    const atualizarListaVazia = () => {
        semLocais.hidden = listaLocais.children.length > 0;
    };

    // Monta a opção com textContent (nunca innerHTML), para dados do usuário não virarem HTML
    function criarOpcaoLocal(id, dados) {
        const opcao = document.createElement("label");
        opcao.className = "opclocal";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "local";
        radio.value = id;
        radio.required = true;

        const nome = document.createElement("span");
        nome.className = "opclocal-nome";
        nome.textContent = dados.nomelocal.toUpperCase();

        const endereco = document.createElement("span");
        endereco.className = "opclocal-end";
        endereco.textContent = dados.rua + ", " + dados.numero +
            (dados.complemento ? " - " + dados.complemento : "");

        const cidade = document.createElement("span");
        cidade.className = "opclocal-cidade";
        cidade.textContent = dados.bairro + " · " + dados.cidade + " - " +
            dados.estado.toUpperCase() + " · " + dados.cep;

        opcao.append(radio, nome, endereco, cidade);
        return opcao;
    }

    // Abrir e fechar o modal
    document.getElementById("abrirmodallocal").addEventListener("click", () => {
        formLocal.reset();
        modalLocal.showModal();
    });

    document.getElementById("fecharmodallocal").addEventListener("click", () => modalLocal.close());
    modalLocal.addEventListener("click", (evento) => {
        if (evento.target === modalLocal) modalLocal.close();
    });

    // Salvar o novo local
    formLocal.addEventListener("submit", (evento) => {
        evento.preventDefault();

        // Chaves: nomelocal, cep, estado, cidade, bairro, rua, numero, complemento
        const dados = Object.fromEntries(new FormData(formLocal));

        // TODO (Ana): enviar ao back-end e usar o ID que ele devolver, por exemplo:
        // fetch("/api/locais", { method: "POST", body: new FormData(formLocal) })
        //     .then((resposta) => resposta.json())
        //     .then(({ id }) => { ...criar a opção com esse id... });
        const id = "novo-" + Date.now(); // provisório, só para testar a tela

        const opcao = criarOpcaoLocal(id, dados);
        listaLocais.append(opcao);
        opcao.querySelector("input").checked = true; // já deixa o novo local selecionado

        atualizarListaVazia();
        modalLocal.close();
    });

    atualizarListaVazia();
})();
