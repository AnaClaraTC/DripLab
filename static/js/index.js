(() => {
    const el = (id) => document.getElementById(id);
    const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // 1. Carrega Drop Ativo e seus produtos para o trilho
    async function carregarDropAtivo() {
        try {
            const resp = await fetch('/api/drops/ativo');
            if (!resp.ok) return;

            const drop = await resp.json();
            if (!drop) return;

            // Atualiza banner do drop atual no index
            const dropImg = el("dropimg");
            if (dropImg && drop.banner_index) {
                const imgTag = dropImg.querySelector("img");
                if (imgTag) {
                    imgTag.src = drop.banner_index;
                    imgTag.alt = drop.nome;
                }
            }

            // Atualiza texto do drop
            const textoDrop = el("textodropatual");
            if (textoDrop) {
                const h2 = textoDrop.querySelector("h2");
                if (h2) h2.textContent = `[DROP ATUAL : ${drop.nome.toUpperCase()}]`;
            }

            // Renderiza produtos do drop nos trilhos do slider
            const trilhos = document.querySelectorAll("#dropslides .droptrilho");
            if (trilhos && trilhos.length > 0) {
                let produtos = drop.produtos || [];

                // Se nao tiver produtos associados ao drop, busca produtos gerais
                if (produtos.length === 0) {
                    const respProd = await fetch('/api/produtos?limite=12');
                    if (respProd.ok) {
                        produtos = await respProd.json();
                    }
                }

                trilhos.forEach(trilho => {
                    trilho.innerHTML = '';
                    if (produtos.length > 0) {
                        produtos.forEach(p => {
                            const item = document.createElement("div");
                            item.className = "dropitem";
                            const imgSrc = p.imagem || "../static/images/loja/moletom-oversized.png";

                            item.innerHTML = `
                                <a href="produto.html?id=${p.id_produto}">
                                    <div class="dropitem-img">
                                        <img src="${imgSrc}" alt="${p.nome}">
                                    </div>
                                    <div class="dropitem-content">
                                        <h3>${p.nome.toUpperCase()}</h3>
                                        <p>${moeda(p.preco)}</p>
                                    </div>
                                </a>
                            `;
                            trilho.appendChild(item);
                        });
                    }
                });
            }
        } catch (e) {
            console.error("Erro ao carregar drop ativo no index:", e);
        }
    }

    // 2. Carrega secao "DESTAQUE - MAIS VENDIDOS"
    async function carregarMaisVendidos() {
        const secaoDestaques = el("destaques");
        const gradeDestaques = el("grade-destaques");
        if (!secaoDestaques || !gradeDestaques) return;

        try {
            const resp = await fetch('/api/produtos/mais-vendidos');
            if (!resp.ok) {
                secaoDestaques.style.display = 'none';
                return;
            }

            const produtos = await resp.json();

            // REGRA: Se nenhuma compra tiver sido realizada ainda no banco (item_pedido vazio), oculte toda a seção
            if (!produtos || produtos.length === 0) {
                secaoDestaques.style.display = 'none';
                return;
            }

            // Se houver vendas, exibe e preenche a grade ordenada do mais vendido para o menos vendido
            secaoDestaques.style.display = '';
            gradeDestaques.innerHTML = '';

            produtos.forEach(p => {
                const item = document.createElement("div");
                item.className = "item";
                const imgSrc = p.imagem || "../static/images/loja/moletom-oversized.png";

                item.innerHTML = `
                    <a href="produto.html?id=${p.id_produto}">
                        <div class="item-img">
                            <img src="${imgSrc}" alt="${p.nome}">
                        </div>
                        <div class="item-content">
                            <span class="item-tag">MAIS VENDIDO</span>
                            <h3>${p.nome.toUpperCase()}</h3>
                            <p>${moeda(p.preco)}</p>
                        </div>
                    </a>
                `;
                gradeDestaques.appendChild(item);
            });

            // Se a funcao de paginacao existir, reinicia para acomodar os novos itens
            if (typeof window.reconfigurarPaginacao === 'function') {
                window.reconfigurarPaginacao();
            }
        } catch (e) {
            console.error("Erro ao carregar mais vendidos no index:", e);
            secaoDestaques.style.display = 'none';
        }
    }

    carregarDropAtivo();
    carregarMaisVendidos();
})();
