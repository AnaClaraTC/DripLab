(() => {
    const el = (id) => document.getElementById(id);

    const lista      = el("listapedidos");
    const semPedidos = el("sempedidos");
    const modal      = el("modalpedido");
    const titulo     = el("titulopedidomodal");
    const erro       = el("erropedido");
    const corpo      = el("corpopedido");
    const produtos   = el("pedidoprodutos");

    if (!lista || !modal) return;

    const PAGAMENTOS = { cartao: "Cartão", Cartao: "Cartão", pix: "Pix", Pix: "Pix", Boleto: "Boleto", boleto: "Boleto" };
    const getToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');

    const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    function formatarData(iso) {
        if (!iso) return "";
        const d = new Date(iso);
        return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    }

    function classeStatus(status) {
        const s = (status || "").toLowerCase();
        if (s.includes("entregue")) return "status-entregue";
        if (s.includes("cancelado")) return "status-cancelado";
        if (s.includes("pago")) return "status-pago";
        if (s.includes("separação") || s.includes("embalado")) return "status-separacao";
        if (s.includes("transito") || s.includes("enviado")) return "status-enviado";
        return "status-pendente";
    }

    async function chamarServidor(acao, dados) {
        const token = getToken();
        if (!token) return { ok: false, mensagem: "Faça login para continuar." };

        if (acao === "pedido/detalhes") {
            const resp = await fetch(`/api/pedidos/${dados.id}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            const ped = await resp.json();
            if (!resp.ok) return { ok: false, mensagem: ped.mensagem };

            const endereco = ped.endereco_entrega || {
                nomelocal: "Padrão", rua: "Endereço cadastrado", numero: "S/N", complemento: "",
                bairro: "", cidade: "", estado: "", cep: ""
            };

            const itens = (ped.itens || []).map(item => ({
                nome: item.produto ? item.produto.nome : `Produto #${item.id_produto}`,
                tamanho: item.tamanho || "P",
                preco: Number(item.preco_unitario),
                quantidade: item.quantidade,
                imagem: (item.produto && item.produto.imagem) ? item.produto.imagem : "../static/images/loja/camiseta-grafitti-404.png",
                link: `produto.html?id=${item.id_produto}`
            }));

            return {
                ok: true,
                pedido: {
                    id: ped.id_pedido,
                    data: ped.data_pedido,
                    frete: Number(ped.valor_frete || 0),
                    total: Number(ped.valor_total || 0),
                    pagamento: ped.metodo_pagamento || "Pix",
                    local: endereco,
                    produtos: itens
                }
            };
        }

        return { ok: false, mensagem: "Ação não encontrada." };
    }

    async function carregarMeusPedidos() {
        const token = getToken();
        if (!token) {
            lista.innerHTML = "";
            if (semPedidos) semPedidos.hidden = false;
            return;
        }

        try {
            const resp = await fetch("/api/pedidos/meus", {
                headers: { "Authorization": "Bearer " + token }
            });

            if (!resp.ok) return;

            const pedidos = await resp.json();
            lista.innerHTML = "";

            if (!pedidos || pedidos.length === 0) {
                if (semPedidos) semPedidos.hidden = false;
                return;
            }

            if (semPedidos) semPedidos.hidden = true;

            pedidos.forEach(p => {
                const article = document.createElement("article");
                article.className = "pedido";
                article.dataset.id = p.id_pedido;

                const cStatus = classeStatus(p.status_atual);
                const primeiroItem = (p.itens && p.itens[0]) || {};
                const prod = primeiroItem.produto || {};
                const imgSrc = prod.imagem || "../static/images/loja/camiseta-grafitti-404.png";

                article.innerHTML = `
                    <a class="pedido-img" href="produto.html?id=${prod.id_produto || ''}" aria-label="Ver produto do pedido #${p.id_pedido}">
                        <img src="${imgSrc}" alt="${prod.nome || 'Produto'}">
                    </a>

                    <div class="pedido-info">
                        <h3>Pedido #${p.id_pedido}</h3>
                        <p class="pedido-data">${formatarData(p.data_pedido)}</p>
                        <p class="pedido-status ${cStatus}">${(p.status_atual || 'PENDENTE').toUpperCase()}</p>
                        <button type="button" class="verpedido" data-id="${p.id_pedido}">ACESSAR PEDIDO</button>
                    </div>

                    <p class="pedido-valor">${moeda(p.valor_total)}</p>
                `;

                lista.appendChild(article);
            });
        } catch (e) {
            console.error("Erro ao carregar pedidos do usuário:", e);
        }
    }
    carregarMeusPedidos();

    function mostrarErro(msg) {
        erro.textContent = msg;
        erro.hidden = !msg;
        corpo.hidden = !!msg;
    }

    function textoLocal(l) {
        if (!l) return "Não informado";
        return (l.nomelocal || "LOCAL").toUpperCase() + " - " +
            (l.rua || "") + ", " + (l.numero || "") + (l.complemento ? " - " + l.complemento : "") + " - " +
            (l.bairro || "") + " · " + (l.cidade || "") + " - " + (l.estado || "").toUpperCase() + " · " + (l.cep || "");
    }

    function criarItem(p) {
        const item = document.createElement("div");
        item.className = "pedidoitem";

        const link = document.createElement("a");
        link.className = "pedidoitem-img";
        link.href = p.link || "produto.html";
        link.setAttribute("aria-label", "Ver produto " + p.nome);

        const img = document.createElement("img");
        img.src = p.imagem;
        img.alt = p.nome;
        link.append(img);

        const info = document.createElement("div");
        info.className = "pedidoitem-info";

        const nome = document.createElement("span");
        nome.className = "pedidoitem-nome";
        nome.textContent = p.nome;

        const tamanho = document.createElement("span");
        tamanho.className = "pedidoitem-detalhe";
        tamanho.textContent = "TAMANHO: " + p.tamanho + (p.quantidade > 1 ? ` (QTD: ${p.quantidade})` : "");

        const preco = document.createElement("span");
        preco.className = "pedidoitem-detalhe";
        preco.textContent = moeda(p.preco);

        info.append(nome, tamanho, preco);
        item.append(link, info);
        return item;
    }

    function preencherModal(p) {
        titulo.textContent = "PEDIDO #" + p.id;
        el("pedidodata").textContent = formatarData(p.data);
        el("pedidototal").textContent = moeda(p.total);
        el("pedidofrete").textContent = moeda(p.frete);
        el("pedidopagamento").textContent = PAGAMENTOS[p.pagamento] || p.pagamento;
        el("pedidolocal").textContent = textoLocal(p.local);

        produtos.replaceChildren(...p.produtos.map(criarItem));
    }

    lista.addEventListener("click", async (evento) => {
        const botao = evento.target.closest(".verpedido");
        if (!botao) return;

        botao.disabled = true;
        try {
            const r = await chamarServidor("pedido/detalhes", { id: botao.dataset.id });
            if (!r.ok) {
                titulo.textContent = "PEDIDO";
                mostrarErro(r.mensagem || "Não foi possível carregar o pedido.");
            } else {
                mostrarErro("");
                preencherModal(r.pedido);
            }
            modal.showModal();
        } finally {
            botao.disabled = false;
        }
    });

    const fechar = el("fecharmodalpedido");
    if (fechar) fechar.addEventListener("click", () => modal.close());

    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
})();
