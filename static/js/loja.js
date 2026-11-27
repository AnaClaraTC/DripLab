(() => {
    const el = (id) => document.getElementById(id);
    const grade = el("graderoupas");
    const formPesquisa = el("pesquisaloja");
    const opcTipoContainer = el("opcroupatipo");
    const selectOrdenar = el("ordenar");

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

                    // Adiciona evento aos radios de categoria para busca imediata
                    opcTipoContainer.querySelectorAll('input[name="roupa"]').forEach(radio => {
                        radio.addEventListener('change', () => {
                            executarBusca();
                        });
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
            if (filtros.busca) params.append('busca', filtros.busca);
            if (filtros.categoria) params.append('categoria', filtros.categoria);
            if (filtros.tamanho) params.append('tamanho', filtros.tamanho);
            if (filtros.ordenar) params.append('ordenar', filtros.ordenar);

            const url = `/api/produtos?${params.toString()}`;
            const resp = await fetch(url);

            if (!resp.ok) return;

            const produtos = await resp.json();
            grade.innerHTML = '';

            if (!produtos || produtos.length === 0) {
                const msgVazia = document.createElement('p');
                msgVazia.className = 'grade-vazia-mensagem';
                msgVazia.style.gridColumn = '1 / -1';
                msgVazia.style.textAlign = 'center';
                msgVazia.style.padding = '40px 20px';
                msgVazia.style.color = '#777';
                msgVazia.style.fontSize = '15px';
                msgVazia.textContent = 'Nenhum produto encontrado.';
                grade.appendChild(msgVazia);
                return;
            }

            produtos.forEach(p => {
                const criadorNome = p.criador ? p.criador.nome : 'DripLab';
                const criadorTipo = p.criador ? (p.criador.tipo || 'admin').toUpperCase() : 'ADMIN';
                const imgSrc = p.imagem || '../static/images/loja/camiseta-grafitti-404.png';

                const item = document.createElement('div');
                item.className = 'item';
                item.innerHTML = `
                    <a href="produto.html?id=${p.id_produto}">
                        <div class="item-img">
                            <img src="${imgSrc}" alt="${p.nome}">
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
        } catch (e) {
            console.error('Erro ao carregar produtos:', e);
        }
    }

    function executarBusca() {
        const termo = (el('campopesquisa') || {}).value || '';
        const radioCategoria = formPesquisa ? formPesquisa.querySelector('input[name="roupa"]:checked') : null;
        const categoria = radioCategoria ? radioCategoria.value : '';
        const ordem = selectOrdenar ? selectOrdenar.value : 'recente';

        carregarProdutos({
            busca: termo.trim(),
            categoria,
            ordenar: ordem
        });
    }

    if (formPesquisa) {
        formPesquisa.addEventListener('submit', (e) => {
            e.preventDefault();
            executarBusca();
        });

        const inputBusca = el('campopesquisa');
        if (inputBusca) {
            inputBusca.addEventListener('input', () => {
                executarBusca();
            });
        }

        const btnLimpar = formPesquisa.querySelector('.btn-limpar');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                formPesquisa.reset();
                setTimeout(() => carregarProdutos(), 50);
            });
        }
    }

    if (selectOrdenar) {
        selectOrdenar.addEventListener('change', () => {
            executarBusca();
        });
    }

    carregarCategorias();
    carregarProdutos();
})();
