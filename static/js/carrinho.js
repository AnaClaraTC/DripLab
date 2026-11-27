(() => {
    const el = (id) => document.getElementById(id);
    const listaProdutos = el("listaprodutos");
    const checkTodos = el("checktodos");
    const tituloCarrinho = el("titulocarrinho");
    const subtotalEl = el("subtotal");
    const totalCompraEl = el("totalcompra");
    const valorFreteEl = el("valorfrete");

    const getToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');
    const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    window.valorFreteAtual = 0;
    window.itensCarrinhoCache = [];

    window.recalcularTotais = () => {
        let subtotal = 0;
        const checks = [...document.querySelectorAll(".checkproduto")];

        checks.forEach(chk => {
            if (chk.checked) {
                const section = chk.closest(".itemcarrinho");
                const preco = Number(section.dataset.preco || 0);
                const qtd = Number(section.querySelector(".qtd").textContent || 1);
                subtotal += preco * qtd;
            }
        });

        if (subtotalEl) subtotalEl.textContent = moeda(subtotal);
        const frete = Number(window.valorFreteAtual || 0);
        if (valorFreteEl) valorFreteEl.textContent = moeda(frete);
        if (totalCompraEl) totalCompraEl.textContent = moeda(subtotal + frete);
    };

    function atualizarCheckTodos() {
        const checks = [...document.querySelectorAll(".checkproduto")];
        if (!checkTodos) return;
        const selecionados = checks.filter(c => c.checked).length;
        checkTodos.checked = checks.length > 0 && selecionados === checks.length;
        checkTodos.indeterminate = selecionados > 0 && selecionados < checks.length;
    }

    if (checkTodos) {
        checkTodos.addEventListener("change", () => {
            const checks = [...document.querySelectorAll(".checkproduto")];
            checks.forEach(c => (c.checked = checkTodos.checked));
            checkTodos.indeterminate = false;
            window.recalcularTotais();
        });
    }

    async function carregarCarrinho() {
        const token = getToken();
        if (!token) {
            if (listaProdutos) {
                listaProdutos.innerHTML = '<p style="text-align: center; color: #888; padding: 40px 10px; font-size: 15px;">Faça login para ver e sincronizar os itens do seu carrinho.</p>';
            }
            if (tituloCarrinho) tituloCarrinho.innerHTML = `[CARRINHO] <span>(0 ITENS)</span>`;
            if (subtotalEl) subtotalEl.textContent = moeda(0);
            if (totalCompraEl) totalCompraEl.textContent = moeda(0);
            if (valorFreteEl) valorFreteEl.textContent = moeda(0);
            return;
        }

        try {
            const resp = await fetch('/api/carrinho', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!resp.ok) return;

            const dados = await resp.json();
            const itens = dados.itens || [];
            window.itensCarrinhoCache = itens;

            if (listaProdutos) {
                listaProdutos.innerHTML = '';

                if (itens.length === 0) {
                    listaProdutos.innerHTML = '<p style="text-align: center; color: #888; padding: 40px 10px; font-size: 15px;">Seu carrinho está vazio.</p>';
                    if (tituloCarrinho) {
                        tituloCarrinho.innerHTML = `[CARRINHO] <span>(0 ITENS)</span>`;
                    }
                    if (subtotalEl) subtotalEl.textContent = moeda(0);
                    if (totalCompraEl) totalCompraEl.textContent = moeda(0);
                    if (valorFreteEl) valorFreteEl.textContent = moeda(0);
                    return;
                }

                if (tituloCarrinho) {
                    tituloCarrinho.innerHTML = `[CARRINHO] <span>(${itens.length} ITENS)</span>`;
                }

                itens.forEach(item => {
                    const prod = item.produto || {};
                    const preco = item.preco_unitario || Number(prod.preco || 0);
                    const imgSrc = prod.imagem || "../static/images/loja/camiseta-grafitti-404.png";

                    const section = document.createElement("section");
                    section.className = "itemcarrinho";
                    section.dataset.id = item.id_carrinho;
                    section.dataset.preco = preco;
                    section.dataset.estoque = item.estoque_disponivel;

                    section.innerHTML = `
                        <input type="checkbox" class="checkproduto" aria-label="Selecionar produto" checked>
                        <div class="itemcarrinho-img">
                            <img src="${imgSrc}" alt="${prod.nome || 'Produto'}">
                        </div>

                        <div class="itemcarrinho-info">
                            <h2>${(prod.nome || 'PRODUTO').toUpperCase()}</h2>
                            <span>Tamanho: ${item.tamanho} | Estoque: ${item.estoque_disponivel} un</span>
                        </div>

                        <div class="itemcarrinho-qtd">
                            <button type="button" class="menos" aria-label="Diminuir quantidade">−</button>
                            <span class="qtd">${item.quantidade}</span>
                            <button type="button" class="mais" aria-label="Aumentar quantidade">+</button>
                        </div>

                        <p class="preco">${moeda(preco * item.quantidade)}</p>
                        <button type="button" class="remover" aria-label="Remover item">×</button>
                    `;

                    listaProdutos.appendChild(section);
                });

                atualizarCheckTodos();
                window.recalcularTotais();
            }
        } catch (e) {
            console.error('Erro ao carregar carrinho:', e);
        }
    }
    carregarCarrinho();

    if (listaProdutos) {
        listaProdutos.addEventListener("click", async (e) => {
            const token = getToken();
            const section = e.target.closest(".itemcarrinho");
            if (!section) return;

            const idCarrinho = section.dataset.id;
            const qtdSpan = section.querySelector(".qtd");
            const precoUnit = Number(section.dataset.preco || 0);
            const estoqueMax = Number(section.dataset.estoque || 999);
            let qtdAtual = Number(qtdSpan.textContent || 1);

            if (e.target.closest(".mais")) {
                if (qtdAtual >= estoqueMax) {
                    alert(`Estoque máximo disponível atingido (${estoqueMax} unidades).`);
                    return;
                }

                const novaQtd = qtdAtual + 1;
                if (token && idCarrinho) {
                    try {
                        const resp = await fetch(`/api/carrinho/${idCarrinho}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify({ quantidade: novaQtd })
                        });
                        const resJson = await resp.json();
                        if (!resp.ok) {
                            alert(resJson.mensagem || 'Erro ao alterar quantidade.');
                            return;
                        }
                    } catch (err) {
                        alert('Erro de conexão.');
                        return;
                    }
                }

                qtdSpan.textContent = novaQtd;
                section.querySelector(".preco").textContent = moeda(precoUnit * novaQtd);
                window.recalcularTotais();
            }

            if (e.target.closest(".menos")) {
                if (qtdAtual <= 1) return;
                const novaQtd = qtdAtual - 1;

                if (token && idCarrinho) {
                    try {
                        const resp = await fetch(`/api/carrinho/${idCarrinho}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify({ quantidade: novaQtd })
                        });
                        const resJson = await resp.json();
                        if (!resp.ok) {
                            alert(resJson.mensagem || 'Erro ao alterar quantidade.');
                            return;
                        }
                    } catch (err) {
                        alert('Erro de conexão.');
                        return;
                    }
                }

                qtdSpan.textContent = novaQtd;
                section.querySelector(".preco").textContent = moeda(precoUnit * novaQtd);
                window.recalcularTotais();
            }

            if (e.target.closest(".remover")) {
                if (!confirm("Remover este item do carrinho?")) return;

                if (token && idCarrinho) {
                    try {
                        const resp = await fetch(`/api/carrinho/${idCarrinho}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                        if (!resp.ok) {
                            alert('Erro ao remover item.');
                            return;
                        }
                        section.remove();
                        carregarCarrinho();
                    } catch (err) {
                        alert('Erro de conexão ao remover item.');
                    }
                }
            }
        });

        listaProdutos.addEventListener("change", (e) => {
            if (e.target.classList.contains("checkproduto")) {
                atualizarCheckTodos();
                window.recalcularTotais();
            }
        });
    }
})();
