// PÁGINA DE PERFIL - Locais salvos: editar, excluir e adicionar
//
// Os locais ficam escritos no HTML, dentro de #listalocaisconfig.
// Cada local (.localconfig) guarda seus dados em atributos data-*:
//   data-id, data-nomelocal, data-cep, data-estado, data-cidade,
//   data-bairro, data-rua, data-numero, data-complemento
//
// O JS só lê esses dados e faz os botões (editar, excluir) funcionarem.
// Para criar um local novo na tela, ele copia o <template id="modelolocalconfig">.

(() => {
    const el = (id) => document.getElementById(id);

    const lista     = el("listalocaisconfig");
    const semLocais = el("semlocaisconfig");
    const modelo    = el("modelolocalconfig");

    // Novo local
    const formNovo  = el("formnovolocal");
    const erroNovo  = el("erronovolocal");
    const btnAdd    = el("btnaddlocal");

    // Modal de edição
    const modalEditar = el("modallocalconfig");
    const formEdit    = el("formeditarlocal");
    const erroEdit    = el("erroeditarlocal");
    const btnSalvar   = el("btnsalvareditar");

    // Modal de exclusão
    const modalExcluir   = el("modalexcluirlocal");
    const textoExcluir   = el("textoexcluirlocal");
    const erroExcluir    = el("erroexcluirlocal");
    const btnConfirmarEx = el("confirmarexcluirlocal");

    const CAMPOS = ["nomelocal", "cep", "estado", "cidade", "bairro", "rua", "numero", "complemento"];
    const soNumeros = (v) => v.replace(/\D/g, "");

    let itemEditando = null;   // elemento .localconfig que está sendo editado
    let itemExcluindo = null;  // elemento .localconfig que será excluído

    /* ---------- Back-end (Ana) ---------- */
    async function chamarServidor(acao, dados) {
        // TODO (Ana): trocar por fetch real. Ações usadas aqui:
        //   "local/adicionar" -> deve devolver { ok: true, id: <ID criado no banco> }
        //   "local/editar"    -> recebe o id do local junto com os campos
        //   "local/excluir"   -> recebe { id }
        // O servidor deve validar tudo de novo e conferir que o local pertence ao usuário logado.
        console.log("Enviar ao servidor:", acao, dados);
        return { ok: true, id: dados.id ?? "novo-" + Date.now() };
    }

    /* ---------- Utilidades ---------- */
    function mostrarErro(paragrafo, msg) {
        paragrafo.textContent = msg;
        paragrafo.hidden = !msg;
    }

    // Tira espaços sobrando e padroniza a sigla do estado
    function limparDados(bruto) {
        const dados = Object.fromEntries(
            CAMPOS.map((c) => [c, (bruto[c] || "").replace(/\s+/g, " ").trim()])
        );
        dados.estado = dados.estado.toUpperCase();
        return dados;
    }

    function validarLocal(d) {
        if (!d.nomelocal) return "Informe o nome do local.";
        if (d.nomelocal.length > 30) return "O nome do local pode ter no máximo 30 caracteres.";
        if (soNumeros(d.cep).length !== 8) return "Informe um CEP válido (00000-000).";
        if (!/^[A-Z]{2}$/.test(d.estado)) return "Informe a sigla do estado com 2 letras (ex.: RJ).";
        if (!d.cidade) return "Informe a cidade.";
        if (!d.bairro) return "Informe o bairro.";
        if (!d.rua) return "Informe a rua ou avenida.";
        if (!d.numero) return "Informe o número (ou S/N).";
        if (d.complemento.length > 60) return "O complemento pode ter no máximo 60 caracteres.";
        return "";
    }

    // Mostra a mensagem "sem locais" só quando a lista está vazia
    function atualizarListaVazia() {
        semLocais.hidden = lista.children.length > 0;
    }

    /* ---------- Ler e atualizar um local do HTML ---------- */
    function lerLocal(item) {
        return Object.fromEntries(CAMPOS.map((c) => [c, item.dataset[c] || ""]));
    }

    // Guarda os dados no item e atualiza os textos que aparecem na tela
    function atualizarItem(item, dados) {
        CAMPOS.forEach((c) => {
            item.dataset[c] = dados[c];
        });

        item.querySelector(".opclocal-nome").textContent = dados.nomelocal.toUpperCase();

        item.querySelector(".opclocal-end").textContent = dados.rua + ", " + dados.numero +
            (dados.complemento ? " - " + dados.complemento : "");

        item.querySelector(".opclocal-cidade").textContent = dados.bairro + " · " + dados.cidade +
            " - " + dados.estado.toUpperCase() + " · " + dados.cep;

        item.querySelector(".editarperfil")
            .setAttribute("aria-label", "Editar local " + dados.nomelocal);
        item.querySelector(".excluirperfil")
            .setAttribute("aria-label", "Excluir local " + dados.nomelocal);
    }

    // Cria um local novo a partir do <template> que está no HTML
    function criarItem(id, dados) {
        const item = modelo.content.firstElementChild.cloneNode(true);
        item.dataset.id = id;
        atualizarItem(item, dados);
        return item;
    }

    /* ---------- Botões da lista (editar e excluir) ---------- */
    lista.addEventListener("click", (evento) => {

        // Editar: abre o modal já preenchido
        const botaoEditar = evento.target.closest(".editarperfil");
        if (botaoEditar) {
            const item = botaoEditar.closest(".localconfig");
            const dados = lerLocal(item);

            itemEditando = item;
            CAMPOS.forEach((c) => {
                el("edit-" + c).value = dados[c];
            });
            mostrarErro(erroEdit, "");
            modalEditar.showModal();
            return;
        }

        // Excluir: abre o modal de confirmação
        const botaoExcluir = evento.target.closest(".excluirperfil");
        if (botaoExcluir) {
            const item = botaoExcluir.closest(".localconfig");

            itemExcluindo = item;
            textoExcluir.textContent =
                "Tem certeza de que deseja excluir o local " + item.dataset.nomelocal.toUpperCase() +
                "? Essa ação não pode ser desfeita.";
            mostrarErro(erroExcluir, "");
            modalExcluir.showModal();
        }
    });

    /* ---------- Modal de edição ---------- */
    formEdit.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mostrarErro(erroEdit, "");

        const dados = limparDados(Object.fromEntries(new FormData(formEdit)));
        const msg = validarLocal(dados);
        if (msg) return mostrarErro(erroEdit, msg);

        btnSalvar.disabled = true;
        try {
            const r = await chamarServidor("local/editar", { id: itemEditando.dataset.id, ...dados });
            if (!r.ok) return mostrarErro(erroEdit, r.mensagem || "Não foi possível salvar.");

            atualizarItem(itemEditando, dados);
            modalEditar.close();
        } catch (err) {
            mostrarErro(erroEdit, "Erro de conexão. Tente novamente.");
        } finally {
            btnSalvar.disabled = false;
        }
    });

    el("fecharmodallocalconfig").addEventListener("click", () => modalEditar.close());
    el("cancelareditarlocal").addEventListener("click", () => modalEditar.close());
    modalEditar.addEventListener("click", (evento) => {
        if (evento.target === modalEditar) modalEditar.close();
    });
    modalEditar.addEventListener("close", () => {
        itemEditando = null;
        mostrarErro(erroEdit, "");
    });

    /* ---------- Modal de exclusão ---------- */
    btnConfirmarEx.addEventListener("click", async () => {
        mostrarErro(erroExcluir, "");
        btnConfirmarEx.disabled = true;

        try {
            const r = await chamarServidor("local/excluir", { id: itemExcluindo.dataset.id });
            if (!r.ok) return mostrarErro(erroExcluir, r.mensagem || "Não foi possível excluir o local.");

            itemExcluindo.remove();
            atualizarListaVazia();
            modalExcluir.close();
        } catch (err) {
            mostrarErro(erroExcluir, "Erro de conexão. Tente novamente.");
        } finally {
            btnConfirmarEx.disabled = false;
        }
    });

    el("cancelarexcluirlocal").addEventListener("click", () => modalExcluir.close());
    modalExcluir.addEventListener("click", (evento) => {
        if (evento.target === modalExcluir) modalExcluir.close();
    });
    modalExcluir.addEventListener("close", () => {
        itemExcluindo = null;
        mostrarErro(erroExcluir, "");
    });

    /* ---------- Adicionar local ---------- */
    formNovo.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mostrarErro(erroNovo, "");

        const dados = limparDados(Object.fromEntries(new FormData(formNovo)));
        const msg = validarLocal(dados);
        if (msg) return mostrarErro(erroNovo, msg);

        btnAdd.disabled = true;
        try {
            const r = await chamarServidor("local/adicionar", dados);
            if (!r.ok) return mostrarErro(erroNovo, r.mensagem || "Não foi possível adicionar o local.");

            const item = criarItem(r.id, dados);
            lista.append(item);
            atualizarListaVazia();
            formNovo.reset();

            // Leva a lista até o local novo e avisa no próprio botão
            item.scrollIntoView({ block: "nearest", behavior: "smooth" });
            btnAdd.textContent = "LOCAL ADICIONADO!";
            setTimeout(() => (btnAdd.textContent = "ADICIONAR LOCAL"), 2000);
        } catch (err) {
            mostrarErro(erroNovo, "Erro de conexão. Tente novamente.");
        } finally {
            btnAdd.disabled = false;
        }
    });

    /* ---------- Máscara do CEP (nos dois formulários) ---------- */
    document.addEventListener("input", (evento) => {
        const campo = evento.target;
        if (!campo.classList.contains("campocep")) return;

        const numeros = soNumeros(campo.value).slice(0, 8);
        campo.value = numeros.length > 5
            ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
            : numeros;
    });

    atualizarListaVazia();
})();
