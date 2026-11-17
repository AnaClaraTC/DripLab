(() => {
    const el = (id) => document.getElementById(id);
    const grade = el("graderoupas");
    const formPesquisa = el("pesquisaloja");
    const opcTipoContainer = el("opcroupatipo");

    const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    async function carregarCategorias() {
        if (!opcTipoContainer) return;
        try {
            const resp = await fetch('/api/categorias');
            if (resp.ok) {
                const categorias = await resp.json();
                if (categorias && categorias.length > 0) {
                    opcTipoContainer.innerHTML = '';
                    categorias.forEach(cat => {
                        const label = document.createElement('label');
                        label.className = 'opcroupa';
                        label.innerHTML = `
                            <input type="radio" name="roupa" value="${cat.nome.toLowerCase()}">
                            <span>${cat.nome.toUpperCase()}</span>
                        `;
                        opcTipoContainer.appendChild(label);
                    });
                }
            }
        } catch (e) {
            console.error('Erro ao carregar categorias:', e);
        }
    }

    async function carregarProdutos(filtros = {}) {
        if (!grade) return;

        try {
            const params = new URLSearchParams();
            if (filtros.nome) params.append('nome', filtros.nome);
            if (filtros.categoria) params.append('categoria', filtros.categoria);
            if (filtros.tamanho) params.append('tamanho', filtros.tamanho);

            const url = `/api/produtos?${params.toString()}`;
            const resp = await fetch(url);

            if (!resp.ok) return;

            const produtos = await resp.json();
            if (produtos && produtos.length > 0) {
                grade.innerHTML = '';
                produtos.forEach(p => {
                    const criadorNome = p.criador ? p.criador.nome : 'DripLab';
                    const criadorTipo = p.criador ? (p.criador.tipo || 'admin').toUpperCase() : 'ADMIN';

                    const item = document.createElement('div');
                    item.className = 'item';
                    item.innerHTML = `
                        <a href="produto.html?id=${p.id_produto}">
                            <div class="item-img">
                                <img src="../static/images/loja/camiseta-grafitti-404.png" alt="${p.nome}">
                            </div>
                            <div class="item-content">
                                <h3>${p.nome.toUpperCase()}</h3>
                                <p>${moeda(p.preco)}</p>
                                <span class="transparencia-criador">Cadastrado por: ${criadorNome} (${criadorTipo})</span>
                            </div>
                        </a>
                    `;
                    grade.appendChild(item);
                });
            }
        } catch (e) {
            console.error('Erro ao carregar produtos:', e);
        }
    }

    if (formPesquisa) {
        formPesquisa.addEventListener('submit', (e) => {
            e.preventDefault();
            const termo = (el('campopesquisa') || {}).value || '';
            const radioCategoria = formPesquisa.querySelector('input[name="roupa"]:checked');
            const categoria = radioCategoria ? radioCategoria.value : '';

            carregarProdutos({ nome: termo.trim(), categoria });
        });

        const btnLimpar = formPesquisa.querySelector('.btn-limpar');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                formPesquisa.reset();
                carregarProdutos();
            });
        }
    }

    carregarCategorias();
    carregarProdutos();
})();