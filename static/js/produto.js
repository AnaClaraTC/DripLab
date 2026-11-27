(() => {
    const el = (id) => document.getElementById(id);

    const getToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');
    const getUsuario = () => {
        try {
            return JSON.parse(localStorage.getItem('usuario') || localStorage.getItem('driplab_usuario') || '{}');
        } catch (e) {
            return {};
        }
    };

    const params = new URLSearchParams(window.location.search);
    let produtoId = params.get('id');

    const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    async function carregarProduto() {
        try {
            let url = produtoId ? `/api/produtos/${produtoId}` : '/api/produtos?limite=1';
            let resp = await fetch(url);
            if (!resp.ok && produtoId) {
                resp = await fetch('/api/produtos?limite=1');
            }

            if (!resp.ok) return;

            const resJson = await resp.json();
            const p = Array.isArray(resJson) ? resJson[0] : resJson;
            if (!p) return;

            produtoId = p.id_produto;

            if (el("produtonome")) el("produtonome").textContent = p.nome.toUpperCase();
            if (el("produtovalor")) el("produtovalor").textContent = moeda(p.preco);
            if (el("produtodescricao") && p.descricao) el("produtodescricao").textContent = p.descricao;

            // Imagem do produto
            const produtoImg = el("produtoimg");
            if (produtoImg) {
                const imgTag = produtoImg.querySelector("img");
                if (imgTag && p.imagem) {
                    imgTag.src = p.imagem;
                    imgTag.alt = p.nome;
                }
            }

            // Banner do Drop no produto.html
            const bannerDropEl = el("produtobanner");
            if (bannerDropEl) {
                if (p.drop && p.drop.banner_produto) {
                    bannerDropEl.src = p.drop.banner_produto;
                    bannerDropEl.alt = `Banner do drop ${p.drop.nome}`;
                } else {
                    // Busca banner do drop ativo
                    fetch('/api/drops/ativo')
                        .then(r => r.json())
                        .then(dAtivo => {
                            if (dAtivo && dAtivo.banner_produto) {
                                bannerDropEl.src = dAtivo.banner_produto;
                                bannerDropEl.alt = `Banner do drop ${dAtivo.nome}`;
                            }
                        })
                        .catch(() => {});
                }
            }

            const criadorNome = p.criador ? p.criador.nome : 'DripLab';
            const criadorTipo = p.criador ? (p.criador.tipo || 'admin').toUpperCase() : 'ADMIN';

            let badgeCriador = el("transparencia-criador-badge");
            if (!badgeCriador && el("produtoinfo")) {
                badgeCriador = document.createElement("span");
                badgeCriador.id = "transparencia-criador-badge";
                badgeCriador.className = "transparencia-criador";
                badgeCriador.style.display = "inline-block";
                badgeCriador.style.marginBottom = "10px";
                const nomeEl = el("produtonome");
                if (nomeEl && nomeEl.parentNode) {
                    nomeEl.parentNode.insertBefore(badgeCriador, nomeEl.nextSibling);
                }
            }
            if (badgeCriador) {
                badgeCriador.textContent = `Cadastrado por: ${criadorNome} (${criadorTipo})`;
            }

            carregarComentarios();
            carregarSecoesRelacionadas(p);
        } catch (e) {
            console.error('Erro ao carregar dados do produto:', e);
        }
    }

    async function carregarSecoesRelacionadas(produtoAtual) {
        // 1. Destaques / Mais Vendidos
        const secoes = document.querySelectorAll('.secao-produtos');
        let secaoDestaques = null;
        let secaoDrop = null;

        secoes.forEach(s => {
            const h2 = s.querySelector('h2');
            if (h2 && h2.textContent.includes('DESTAQUE')) {
                secaoDestaques = s;
            } else if (h2 && h2.textContent.includes('DROP')) {
                secaoDrop = s;
            }
        });

        // Carrega Mais Vendidos
        if (secaoDestaques) {
            try {
                const resp = await fetch('/api/produtos/mais-vendidos');
                const maisVendidos = resp.ok ? await resp.json() : [];

                const trilhoDestaques = secaoDestaques.querySelector('.trilho');
                if (trilhoDestaques) {
                    trilhoDestaques.innerHTML = '';
                    if (!maisVendidos || maisVendidos.length === 0) {
                        secaoDestaques.style.display = 'none';
                    } else {
                        secaoDestaques.style.display = '';
                        maisVendidos.forEach(p => {
                            const item = document.createElement('div');
                            item.className = 'item';
                            item.innerHTML = `
                                <a href="produto.html?id=${p.id_produto}">
                                    <div class="item-img">
                                        <img src="${p.imagem || '../static/images/loja/moletom-oversized.png'}" alt="${p.nome}">
                                    </div>
                                    <div class="item-content">
                                        <h3>${p.nome.toUpperCase()}</h3>
                                        <p>${moeda(p.preco)}</p>
                                    </div>
                                </a>
                            `;
                            trilhoDestaques.appendChild(item);
                        });
                    }
                }
            } catch (e) {
                secaoDestaques.style.display = 'none';
            }
        }

        // Carrega Mais do Drop
        if (secaoDrop) {
            const h2Drop = secaoDrop.querySelector('h2');
            const nomeDrop = (produtoAtual.drop && produtoAtual.drop.nome) ? produtoAtual.drop.nome : 'COLEÇÃO';
            if (h2Drop) h2Drop.textContent = `[MAIS DO DROP: ${nomeDrop.toUpperCase()}]`;

            try {
                const query = produtoAtual.id_drop ? `id_drop=${produtoAtual.id_drop}` : `categoria=${encodeURIComponent(produtoAtual.categoria)}`;
                const resp = await fetch(`/api/produtos?${query}`);
                const produtosRelacionados = resp.ok ? await resp.json() : [];

                const outros = (produtosRelacionados || []).filter(item => item.id_produto !== produtoAtual.id_produto);
                const trilhoDrop = secaoDrop.querySelector('.trilho');
                if (trilhoDrop) {
                    trilhoDrop.innerHTML = '';
                    if (outros.length === 0) {
                        secaoDrop.style.display = 'none';
                    } else {
                        secaoDrop.style.display = '';
                        outros.forEach(p => {
                            const item = document.createElement('div');
                            item.className = 'item';
                            item.innerHTML = `
                                <a href="produto.html?id=${p.id_produto}">
                                    <div class="item-img">
                                        <img src="${p.imagem || '../static/images/loja/moletom-oversized.png'}" alt="${p.nome}">
                                    </div>
                                    <div class="item-content">
                                        <h3>${p.nome.toUpperCase()}</h3>
                                        <p>${moeda(p.preco)}</p>
                                    </div>
                                </a>
                            `;
                            trilhoDrop.appendChild(item);
                        });
                    }
                }
            } catch (e) {
                secaoDrop.style.display = 'none';
            }
        }
    }

    const btnAddCarrinho = el("adicionar-carrinho");
    if (btnAddCarrinho) {
        btnAddCarrinho.addEventListener("click", async () => {
            const token = getToken();
            if (!token) {
                alert("Faça login para adicionar produtos ao carrinho.");
                window.location.href = "login.html";
                return;
            }

            if (!produtoId) {
                alert("Produto não identificado.");
                return;
            }

            const radioTam = document.querySelector('input[name="tamanho"]:checked');
            const tamanho = radioTam ? radioTam.value : 'P';

            btnAddCarrinho.disabled = true;
            btnAddCarrinho.textContent = "ADICIONANDO...";

            try {
                const resp = await fetch('/api/carrinho', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        id_produto: produtoId,
                        quantidade: 1,
                        tamanho
                    })
                });

                const resJson = await resp.json();
                if (!resp.ok) {
                    alert(resJson.mensagem || "Não foi possível adicionar ao carrinho.");
                } else {
                    alert("Produto adicionado ao seu carrinho!");
                }
            } catch (err) {
                alert("Erro de conexão ao adicionar produto.");
            } finally {
                btnAddCarrinho.disabled = false;
                btnAddCarrinho.textContent = "Adicionar ao Carrinho";
            }
        });
    }

    const btnCalcFrete = el("btn-calc-frete");
    const inputCep = el("calc-frete-cep");
    const resultadoFrete = el("calc-frete-resultado");

    if (btnCalcFrete && inputCep && resultadoFrete) {
        btnCalcFrete.addEventListener("click", async () => {
            const cep = inputCep.value.trim();
            if (!cep) {
                alert("Informe um CEP para cálculo.");
                return;
            }

            btnCalcFrete.disabled = true;
            btnCalcFrete.textContent = "...";

            try {
                const resp = await fetch('/api/frete/calcular', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cep })
                });

                const dados = await resp.json();
                if (!resp.ok) {
                    alert(dados.mensagem || "Erro ao calcular frete.");
                    return;
                }

                resultadoFrete.hidden = false;
                resultadoFrete.innerHTML = `
                    <strong>Destino: ${dados.localidade || ''} / ${dados.uf || ''}</strong>
                    ${(dados.opcoes || []).map(o => `
                        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee;">
                            <span>${o.nome} (${o.prazo}):</span>
                            <strong>${o.valor === 0 ? 'GRÁTIS' : moeda(o.valor)}</strong>
                        </div>
                    `).join('')}
                `;
            } catch (err) {
                alert("Erro ao conectar com o serviço de frete.");
            } finally {
                btnCalcFrete.disabled = false;
                btnCalcFrete.textContent = "CALCULAR";
            }
        });
    }

    const listaComentarios = el("lista-comentarios");
    const avisoSemComentarios = el("sem-comentarios");
    const formComentario = el("form-novo-comentario");

    async function carregarComentarios() {
        if (!listaComentarios || !produtoId) return;

        try {
            const resp = await fetch(`/api/produtos/${produtoId}/comentarios`);
            if (!resp.ok) return;

            const comentarios = await resp.json();
            listaComentarios.innerHTML = '';

            if (comentarios.length === 0) {
                if (avisoSemComentarios) avisoSemComentarios.hidden = false;
                return;
            }

            if (avisoSemComentarios) avisoSemComentarios.hidden = true;

            const usuarioAtual = getUsuario();
            const ehModerador = ['admin', 'operador'].includes(usuarioAtual.tipo);

            comentarios.forEach(c => {
                const autorNome = c.autor ? c.autor.nome : 'Cliente';
                const autorTipo = c.autor ? c.autor.tipo : 'cliente';
                const podeExcluir = ehModerador || (usuarioAtual.id_usuario && c.id_usuario === usuarioAtual.id_usuario);

                const div = document.createElement("div");
                div.style.padding = "12px";
                div.style.background = "#fafafa";
                div.style.border = "1px solid #e0e0e0";
                div.style.borderRadius = "6px";

                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <strong>${autorNome} <small style="color: #888;">(${autorTipo.toUpperCase()})</small></strong>
                        ${podeExcluir ? `<button type="button" class="btn-excluir-comentario" data-id="${c.id_comentario}" style="background: none; border: none; color: #d62828; cursor: pointer; font-size: 12px; font-weight: 700;">EXCLUIR</button>` : ''}
                    </div>
                    <p style="font-size: 14px; color: #333; margin: 0;">${c.texto}</p>
                `;

                listaComentarios.appendChild(div);
            });

            listaComentarios.querySelectorAll('.btn-excluir-comentario').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const idComentario = btn.dataset.id;
                    const token = getToken();
                    if (!confirm("Remover este comentário?")) return;

                    try {
                        const r = await fetch(`/api/comentarios/${idComentario}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                        if (r.ok) {
                            carregarComentarios();
                        } else {
                            const err = await r.json();
                            alert(err.mensagem || "Erro ao remover comentário.");
                        }
                    } catch (e) {
                        alert("Erro de conexão ao excluir comentário.");
                    }
                });
            });
        } catch (e) {
            console.error('Erro ao carregar comentários:', e);
        }
    }

    if (formComentario) {
        formComentario.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = getToken();
            if (!token) {
                alert("Faça login para comentar sobre este produto.");
                window.location.href = "login.html";
                return;
            }

            const inputTexto = el("texto-comentario");
            const texto = inputTexto ? inputTexto.value.trim() : '';
            if (!texto) return;

            try {
                const resp = await fetch(`/api/produtos/${produtoId}/comentarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ texto })
                });

                const resJson = await resp.json();
                if (!resp.ok) {
                    alert(resJson.mensagem || "Erro ao enviar comentário.");
                } else {
                    inputTexto.value = '';
                    carregarComentarios();
                }
            } catch (err) {
                alert("Erro de conexão ao enviar comentário.");
            }
        });
    }

    carregarProduto();
})();
