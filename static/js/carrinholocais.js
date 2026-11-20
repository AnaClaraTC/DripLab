(() => {
    const listaLocais = document.getElementById("listalocais");
    const semLocais = document.getElementById("semlocais");

    const getToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');

    const atualizarListaVazia = () => {
        if (semLocais && listaLocais) {
            semLocais.hidden = listaLocais.children.length > 0;
        }
    };

    function criarOpcaoLocal(id, dados, selecionado = false) {
        const opcao = document.createElement("label");
        opcao.className = "opclocal";
        opcao.dataset.cep = dados.cep;

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "local";
        radio.value = id;
        radio.required = true;
        if (selecionado) radio.checked = true;

        const nome = document.createElement("span");
        nome.className = "opclocal-nome";
        nome.textContent = (dados.nomelocal || "LOCAL").toUpperCase();

        const endereco = document.createElement("span");
        endereco.className = "opclocal-end";
        endereco.textContent = (dados.rua || "") + ", " + (dados.numero || "") +
            (dados.complemento ? " - " + dados.complemento : "");

        const cidade = document.createElement("span");
        cidade.className = "opclocal-cidade";
        cidade.textContent = (dados.bairro || "") + " · " + (dados.cidade || "") + " - " +
            (dados.estado || "").toUpperCase() + " · " + (dados.cep || "");

        opcao.append(radio, nome, endereco, cidade);
        return opcao;
    }

    async function calcularFretePorCep(cep) {
        if (!cep) return;
        try {
            const resp = await fetch('/api/frete/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cep })
            });

            if (resp.ok) {
                const dados = await resp.json();
                const opcaoPadrao = (dados.opcoes && dados.opcoes[0]) || { valor: 14.90 };
                window.valorFreteAtual = Number(opcaoPadrao.valor || 0);
                if (window.recalcularTotais) window.recalcularTotais();
            }
        } catch (e) {
            console.error('Erro ao calcular frete:', e);
        }
    }

    async function carregarLocaisDoBanco() {
        const token = getToken();
        if (!token) {
            if (listaLocais) listaLocais.innerHTML = '';
            atualizarListaVazia();
            return;
        }

        try {
            const resp = await fetch('/api/enderecos', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!resp.ok) return;

            const enderecos = await resp.json();
            if (listaLocais) {
                listaLocais.innerHTML = '';

                if (enderecos.length > 0) {
                    const ultimoId = localStorage.getItem('ultimo_endereco_id');
                    let idxParaSelecionar = enderecos.length - 1;
                    if (ultimoId) {
                        const achouIdx = enderecos.findIndex(e => String(e.id_endereco) === String(ultimoId));
                        if (achouIdx !== -1) {
                            idxParaSelecionar = achouIdx;
                        }
                        localStorage.removeItem('ultimo_endereco_id');
                    }

                    enderecos.forEach((end, idx) => {
                        const opc = criarOpcaoLocal(end.id_endereco, end, idx === idxParaSelecionar);
                        listaLocais.append(opc);
                    });
                    calcularFretePorCep(enderecos[idxParaSelecionar].cep);
                } else {
                    window.location.href = 'perfil.html?origem=carrinho#pagconfig';
                    return;
                }

                atualizarListaVazia();
            }
        } catch (e) {
            console.error('Erro ao carregar locais:', e);
        }
    }
    carregarLocaisDoBanco();

    if (listaLocais) {
        listaLocais.addEventListener("change", (e) => {
            if (e.target.name === "local") {
                const label = e.target.closest(".opclocal");
                if (label && label.dataset.cep) {
                    calcularFretePorCep(label.dataset.cep);
                }
            }
        });
    }

    const btnAbrirModal = document.getElementById("abrirmodallocal");
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener("click", () => {
            const token = getToken();
            if (!token) {
                alert("Faça login para cadastrar um novo endereço.");
                window.location.href = "login.html";
                return;
            }
            window.location.href = "perfil.html?origem=carrinho#pagconfig";
        });
    }

    atualizarListaVazia();
})();
