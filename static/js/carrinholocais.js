(() => {
    const modalLocal = document.getElementById("modallocal");
    const formLocal = document.getElementById("formlocal");
    const listaLocais = document.getElementById("listalocais");
    const semLocais = document.getElementById("semlocais");
    const campoCep = document.getElementById("cep");

    const getToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');

    if (campoCep) {
        campoCep.addEventListener("input", () => {
            const numeros = campoCep.value.replace(/\D/g, "").slice(0, 8);
            campoCep.value = numeros.length > 5
                ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
                : numeros;
        });
    }

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
        if (!token) return;

        try {
            const resp = await fetch('/api/enderecos', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!resp.ok) return;

            const enderecos = await resp.json();
            if (listaLocais && enderecos.length > 0) {
                listaLocais.innerHTML = '';
                enderecos.forEach((end, idx) => {
                    const opc = criarOpcaoLocal(end.id_endereco, end, idx === 0);
                    listaLocais.append(opc);
                });
                atualizarListaVazia();

                calcularFretePorCep(enderecos[0].cep);
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
    if (btnAbrirModal && modalLocal) {
        btnAbrirModal.addEventListener("click", () => {
            if (formLocal) formLocal.reset();
            modalLocal.showModal();
        });
    }

    const btnFecharModal = document.getElementById("fecharmodallocal");
    if (btnFecharModal && modalLocal) {
        btnFecharModal.addEventListener("click", () => modalLocal.close());
    }
    if (modalLocal) {
        modalLocal.addEventListener("click", (evento) => {
            if (evento.target === modalLocal) modalLocal.close();
        });
    }

    if (formLocal) {
        formLocal.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            const token = getToken();
            const dados = Object.fromEntries(new FormData(formLocal));

            if (!token) {
                alert('Faça login para cadastrar um novo local.');
                return;
            }

            try {
                const resp = await fetch('/api/enderecos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(dados)
                });

                const resJson = await resp.json();
                if (!resp.ok) {
                    alert(resJson.mensagem || 'Erro ao cadastrar local.');
                    return;
                }

                const id = resJson.id || (resJson.endereco ? resJson.endereco.id_endereco : Date.now());
                const opcao = criarOpcaoLocal(id, dados, true);
                listaLocais.append(opcao);
                opcao.querySelector("input").checked = true;

                atualizarListaVazia();
                modalLocal.close();

                calcularFretePorCep(dados.cep);
            } catch (err) {
                alert('Erro de conexão ao salvar endereço.');
            }
        });
    }

    atualizarListaVazia();
})();