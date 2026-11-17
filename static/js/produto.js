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
        } catch (e) {
            console.error('Erro ao carregar dados do produto:', e);
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

    if (inputCep) {
        inputCep.addEventListener("input", () => {
            const numeros = inputCep.value.replace(/\D/g, "").slice(0, 8);
            inputCep.value = numeros.length > 5
                ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
                : numeros;
        });
    }

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
-                     <strong>Destino: ${dados.localidade || ''}
${dados.uf || ''}</strong>
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
                div.style.border = "1px solid #e0e0e0";
                div.style.borderRadius = "8px";
                div.style.backgroundColor = "#fff";
                div.style.display = "flex";
                div.style.justifyContent = "space-between";
                div.style.alignItems = "center";

                div.innerHTML = `
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <strong style="font-size: 14px;">${autorNome}</strong>
                            <span class="dbx-nivel dbx-nivel-${autorTipo}" style="font-size: 10px; padding: 2px 8px;">${autorTipo.toUpperCase()}</span>
                        </div>
                        <p style="margin: 6px 0 0; font-size: 13px; color: #444;">${c.texto}</p>
                    </div>
                    ${podeExcluir ? `
                        <button type="button" class="dbx-btn dbx-laranja dbx-mini btn-del-coment" data-id="${c.id_comentario}">REMOVER</button>
                    ` : ''}
                `;

                listaComentarios.appendChild(div);
            });

            listaComentarios.querySelectorAll(".btn-del-coment").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const idComentario = btn.dataset.id;
                    const token = getToken();
                    if (!confirm("Tem certeza de que deseja remover este comentário?")) return;

                    try {
                        const respDel = await fetch(`/api/comentarios/${idComentario}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                        const resJson = await respDel.json();
                        if (respDel.ok) {
                            carregarComentarios();
                        } else {
                            alert(resJson.mensagem || "Erro ao excluir comentário.");
                        }
                    } catch (e) {
                        alert("Erro de conexão ao remover comentário.");
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
                alert("Faça login para deixar seu comentário.");
                window.location.href = "login.html";
                return;
            }

            const inputTexto = el("texto-comentario");
            const texto = inputTexto ? inputTexto.value.trim() : "";

            if (!texto) {
                alert("Escreva uma mensagem no comentário.");
                return;
            }

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
                    alert(resJson.mensagem || "Erro ao publicar comentário.");
                } else {
                    if (inputTexto) inputTexto.value = "";
                    carregarComentarios();
                }
            } catch (err) {
                alert("Erro de conexão ao publicar comentário.");
            }
        });
    }

    carregarProduto();
})();