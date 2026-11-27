// PÁGINA DE PERFIL - Histórico de pedidos: modal com os detalhes do pedido
//
// Os cards (.pedido) ficam no HTML, dentro de #listapedidos, com data-id.
// Ao clicar em "ACESSAR PEDIDO", o JS busca os detalhes e preenche o modal.

(() => {
    const el = (id) => document.getElementById(id);

    const lista      = el("listapedidos");
    const semPedidos = el("sempedidos");
    const modal      = el("modalpedido");
    const titulo     = el("titulopedidomodal");
    const erro       = el("erropedido");
    const corpo      = el("corpopedido");
    const produtos   = el("pedidoprodutos");

    const PAGAMENTOS = { cartao: "Cartão", pix: "Pix" };

    const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // "2025-10-12" -> "12 DE OUT. DE 2025"
    function formatarData(iso) {
        const [a, m, d] = iso.split("-").map(Number);
        return new Date(a, m - 1, d)
            .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
            .toUpperCase();
    }

    /* ---------- Back-end (Ana) ---------- */
    async function chamarServidor(acao, dados) {
        // TODO (Ana): trocar por fetch real. Ação usada aqui:
        //   "pedido/detalhes" -> recebe { id } e devolve { ok: true, pedido: {...} }
        // O servidor deve conferir que o pedido pertence ao usuário logado.
        // Formato esperado de "pedido":
        //   { id, data: "AAAA-MM-DD", frete, total, pagamento: "cartao" | "pix",
        //     local: { nomelocal, rua, numero, complemento, bairro, cidade, estado, cep },
        //     produtos: [{ nome, tamanho, preco, imagem, link }] }
        console.log("Enviar ao servidor:", acao, dados);

        // Dados de exemplo, só para testar a tela
        return {
            ok: true,
            pedido: {
                id: dados.id,
                data: "2025-10-12",
                frete: 9.93,
                total: 199.90,
                pagamento: "cartao",
                local: {
                    nomelocal: "Casa", rua: "Rua Exemplo", numero: "123", complemento: "Apto 4",
                    bairro: "Bairro", cidade: "Cidade", estado: "RJ", cep: "00000-000"
                },
                produtos: [
                    { nome: "CAMISETA GRAFFITI 404", tamanho: "P", preco: 39.99,
                      imagem: "../static/images/loja/camiseta-grafitti-404.png", link: "produto.html" },
                    { nome: "CALÇA CARGO PHANTOM", tamanho: "P", preco: 59.99,
                      imagem: "../static/images/loja/calca-cargo-phantom.png", link: "produto.html" },
                    { nome: "JAQUETA CORTA-VENTO STORM", tamanho: "P", preco: 89.99,
                      imagem: "../static/images/loja/jaqueta-corta-vento-storm.png", link: "produto.html" }
                ]
            }
        };
    }

    /* ---------- Utilidades ---------- */
    function mostrarErro(msg) {
        erro.textContent = msg;
        erro.hidden = !msg;
        corpo.hidden = !!msg;
    }

    function textoLocal(l) {
        return l.nomelocal.toUpperCase() + " - " +
            l.rua + ", " + l.numero + (l.complemento ? " - " + l.complemento : "") + " - " +
            l.bairro + " · " + l.cidade + " - " + l.estado.toUpperCase() + " · " + l.cep;
    }

    // Monta cada produto com textContent (nunca innerHTML)
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
        tamanho.className = "pedidoitem-tamanho";
        tamanho.textContent = "Tamanho : " + p.tamanho;

        info.append(nome, tamanho);

        const preco = document.createElement("span");
        preco.className = "pedidoitem-preco";
        preco.textContent = moeda(p.preco);

        item.append(link, info, preco);
        return item;
    }

    function preencherModal(p) {
        titulo.textContent = "PEDIDO #" + p.id;
        el("pedidodata").textContent = formatarData(p.data);
        el("pedidototal").textContent = moeda(p.total);
        el("pedidofrete").textContent = p.frete > 0 ? moeda(p.frete) : "Grátis";
        el("pedidopagamento").textContent = PAGAMENTOS[p.pagamento] || p.pagamento;
        el("pedidolocal").textContent = textoLocal(p.local);

        // Lista de produtos por último
        produtos.replaceChildren(...p.produtos.map(criarItem));
    }

    /* ---------- Abrir o modal ---------- */
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
        } catch (err) {
            titulo.textContent = "PEDIDO";
            mostrarErro("Erro de conexão. Tente novamente.");
            modal.showModal();
        } finally {
            botao.disabled = false;
        }
    });

    /* ---------- Fechar o modal ---------- */
    el("fecharmodalpedido").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
    modal.addEventListener("close", () => {
        produtos.replaceChildren();
        mostrarErro("");
    });

    /* ---------- Lista vazia ---------- */
    semPedidos.hidden = lista.children.length > 0;
})();