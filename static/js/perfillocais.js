(() => {
    const el = (id) => document.getElementById(id);

    const lista     = el("listalocaisconfig");
    const semLocais = el("semlocaisconfig");
    const modelo    = el("modelolocalconfig");

    if (!lista || !modelo) return;

    const formNovo  = el("formnovolocal");
    const erroNovo  = el("erronovolocal");
    const btnAdd    = el("btnaddlocal");

    const modalEditar = el("modallocalconfig");
    const formEdit    = el("formeditarlocal");
    const erroEdit    = el("erroeditarlocal");
    const btnSalvar   = el("btnsalvareditar");

    const modalExcluir   = el("modalexcluirlocal");
    const textoExcluir   = el("textoexcluirlocal");
    const erroExcluir    = el("erroexcluirlocal");
    const btnConfirmarEx = el("confirmarexcluirlocal");

    const CAMPOS = ["nomelocal", "cep", "estado", "cidade", "bairro", "rua", "numero", "complemento"];
    const soNumeros = (v) => v.replace(/\D/g, "");
    const getToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');

    let itemEditando = null;
    let itemExcluindo = null;

    async function chamarServidor(acao, dados) {
        const token = getToken();
        if (!token) {
            window.location.href = 'login.html';
            return { ok: false, mensagem: 'Faça login para continuar.' };
        }

        if (acao === 'local/adicionar') {
            const resp = await fetch('/api/enderecos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(dados)
            });
            const resJson = await resp.json();
            return { ok: resp.ok, id: resJson.id || (resJson.endereco ? resJson.endereco.id_endereco : null), mensagem: resJson.mensagem };
        }

        if (acao === 'local/editar') {
            const resp = await fetch(`/api/enderecos/${dados.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(dados)
            });
            const resJson = await resp.json();
            return { ok: resp.ok, mensagem: resJson.mensagem };
        }

        if (acao === 'local/excluir') {
            const resp = await fetch(`/api/enderecos/${dados.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const resJson = await resp.json();
            return { ok: resp.ok, mensagem: resJson.mensagem };
        }

        return { ok: false, mensagem: 'Ação não reconhecida.' };
    }

    function mostrarErro(paragrafo, msg) {
        if (!paragrafo) return;
        paragrafo.textContent = msg;
        paragrafo.hidden = !msg;
    }

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
        if (d.complemento && d.complemento.length > 60) return "O complemento pode ter no máximo 60 caracteres.";
        return "";
    }

    function atualizarListaVazia() {
        if (semLocais && lista) {
            semLocais.hidden = lista.children.length > 0;
        }
    }

    function lerLocal(item) {
        return Object.fromEntries(CAMPOS.map((c) => [c, item.dataset[c] || ""]));
    }

    function atualizarItem(item, dados) {
        CAMPOS.forEach((c) => {
            item.dataset[c] = dados[c] || "";
        });

        const nomeEl = item.querySelector(".opclocal-nome");
        if (nomeEl) nomeEl.textContent = (dados.nomelocal || "").toUpperCase();

        const endEl = item.querySelector(".opclocal-end");
        if (endEl) {
            endEl.textContent = (dados.rua || "") + ", " + (dados.numero || "") +
                (dados.complemento ? " - " + dados.complemento : "");
        }

        const cidEl = item.querySelector(".opclocal-cidade");
        if (cidEl) {
            cidEl.textContent = (dados.bairro || "") + " · " + (dados.cidade || "") +
                " - " + (dados.estado || "").toUpperCase() + " · " + (dados.cep || "");
        }

        const btnEd = item.querySelector(".editarperfil");
        if (btnEd) btnEd.setAttribute("aria-label", "Editar local " + dados.nomelocal);

        const btnEx = item.querySelector(".excluirperfil");
        if (btnEx) btnEx.setAttribute("aria-label", "Excluir local " + dados.nomelocal);
    }

    function criarItem(id, dados) {
        const item = modelo.content.firstElementChild.cloneNode(true);
        item.dataset.id = id;
        atualizarItem(item, dados);
        return item;
    }

    async function carregarLocaisDoBanco() {
        const token = getToken();
        if (!token) return;

        try {
            const resp = await fetch('/api/enderecos', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (resp.ok) {
                const enderecos = await resp.json();
                lista.innerHTML = '';
                enderecos.forEach(end => {
                    const item = criarItem(end.id_endereco, end);
                    lista.append(item);
                });
                atualizarListaVazia();
            }
        } catch (e) {
            console.error('Erro ao carregar endereços:', e);
        }
    }
    carregarLocaisDoBanco();

    lista.addEventListener("click", (evento) => {
        const botaoEditar = evento.target.closest(".editarperfil");
        if (botaoEditar) {
            const item = botaoEditar.closest(".localconfig");
            const dados = lerLocal(item);

            itemEditando = item;
            CAMPOS.forEach((c) => {
                const cmp = el("edit-" + c);
                if (cmp) cmp.value = dados[c];
            });
            mostrarErro(erroEdit, "");
            modalEditar.showModal();
            return;
        }

        const botaoExcluir = evento.target.closest(".excluirperfil");
        if (botaoExcluir) {
            const item = botaoExcluir.closest(".localconfig");

            itemExcluindo = item;
            textoExcluir.textContent =
                "Tem certeza de que deseja excluir o local " + (item.dataset.nomelocal || '').toUpperCase() +
                "? Essa ação não pode ser desfeita.";
            mostrarErro(erroExcluir, "");
            modalExcluir.showModal();
        }
    });

    if (formEdit) {
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
    }

    if (el("fecharmodallocalconfig")) el("fecharmodallocalconfig").addEventListener("click", () => modalEditar.close());
    if (el("cancelareditarlocal")) el("cancelareditarlocal").addEventListener("click", () => modalEditar.close());
    if (modalEditar) {
        modalEditar.addEventListener("click", (evento) => {
            if (evento.target === modalEditar) modalEditar.close();
        });
        modalEditar.addEventListener("close", () => {
            itemEditando = null;
            mostrarErro(erroEdit, "");
        });
    }

    if (btnConfirmarEx) {
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
    }

    if (el("cancelarexcluirlocal")) el("cancelarexcluirlocal").addEventListener("click", () => modalExcluir.close());
    if (modalExcluir) {
        modalExcluir.addEventListener("click", (evento) => {
            if (evento.target === modalExcluir) modalExcluir.close();
        });
        modalExcluir.addEventListener("close", () => {
            itemExcluindo = null;
            mostrarErro(erroExcluir, "");
        });
    }

    if (formNovo) {
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

                item.scrollIntoView({ block: "nearest", behavior: "smooth" });
                btnAdd.textContent = "LOCAL ADICIONADO!";
                setTimeout(() => (btnAdd.textContent = "ADICIONAR LOCAL"), 2000);
            } catch (err) {
                mostrarErro(erroNovo, "Erro de conexão. Tente novamente.");
            } finally {
                btnAdd.disabled = false;
            }
        });
    }

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