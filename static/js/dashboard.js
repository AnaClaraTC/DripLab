(() => {
    const el = (id) => document.getElementById(id);
    const $$ = (sel, base = document) => [...base.querySelectorAll(sel)];

    const getToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');
    const getUsuario = () => {
        try {
            return JSON.parse(localStorage.getItem('usuario') || localStorage.getItem('driplab_usuario') || '{}');
        } catch (e) {
            return {};
        }
    };

    const token = getToken();
    const usuario = getUsuario();
    const tipoUsuario = usuario.tipo || '';

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    if (tipoUsuario !== 'admin' && tipoUsuario !== 'operador') {
        alert('Acesso restrito a Operadores e Administradores.');
        window.location.href = 'perfil.html';
        return;
    }

    const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const dataBR = (iso) => iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : '';

    const badgeRole = el('dbx-role-badge');
    if (badgeRole) {
        badgeRole.textContent = tipoUsuario.toUpperCase();
        badgeRole.className = `dbx-nivel dbx-nivel-${tipoUsuario}`;
    }

    const itemMetricas = el('item-nav-metricas');
    const itemDrops = el('item-nav-drops');
    const itemPropostas = el('item-nav-propostas');
    const itemContas = el('item-nav-contas');
    const itemPedidos = el('item-nav-pedidos');
    const itemUsuarios = el('item-nav-usuarios');

    if (tipoUsuario === 'operador') {
        if (itemMetricas) itemMetricas.hidden = true;
        if (itemPropostas) itemPropostas.hidden = true;
        if (itemContas) itemContas.hidden = true;

        $$(".dbx-pagina").forEach(p => p.hidden = true);
        $$(".dbx-opc").forEach(o => o.classList.remove("dbx-ativo"));

        if (el('dbx-pg-pedidos')) el('dbx-pg-pedidos').hidden = false;
        const btnPed = itemPedidos ? itemPedidos.querySelector('button') : null;
        if (btnPed) btnPed.classList.add('dbx-ativo');
    }

    $$(".dbx-opc[data-pagina]").forEach((b) => b.addEventListener("click", () => {
        $$(".dbx-pagina").forEach((p) => (p.hidden = true));
        $$(".dbx-opc").forEach((o) => o.classList.remove("dbx-ativo"));
        const alvo = el(b.dataset.pagina);
        if (alvo) alvo.hidden = false;
        b.classList.add("dbx-ativo");
    }));

    const btnSair = el('dbx-btn-desconectar');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    async function carregarMetricas() {
        if (tipoUsuario !== 'admin') return;

        try {
            const resp = await fetch('/api/dashboard/metricas', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!resp.ok) return;

            const m = await resp.json();
            if (el('metrica-pedidos')) el('metrica-pedidos').textContent = m.totalPedidos;
            if (el('metrica-vendas')) el('metrica-vendas').textContent = moeda(m.totalVendas);
            if (el('metrica-produtos')) el('metrica-produtos').textContent = m.totalProdutos;
            if (el('metrica-estoque-baixo')) el('metrica-estoque-baixo').textContent = m.qtdEstoqueBaixo;
            if (el('metrica-propostas')) el('metrica-propostas').textContent = m.propostasAtivas;
            if (el('metrica-clientes')) el('metrica-clientes').textContent = m.totalClientes;
            if (el('metrica-operadores')) el('metrica-operadores').textContent = m.totalOperadores;

            const containerEstoque = el('dbx-lista-estoque-baixo');
            const avisoSemEstoque = el('aviso-sem-estoque-baixo');
            if (containerEstoque) {
                containerEstoque.innerHTML = '';
                if (!m.produtosEstoqueBaixo || m.produtosEstoqueBaixo.length === 0) {
                    if (avisoSemEstoque) avisoSemEstoque.hidden = false;
                } else {
                    if (avisoSemEstoque) avisoSemEstoque.hidden = true;
                    m.produtosEstoqueBaixo.forEach(prod => {
                        const div = document.createElement('div');
                        div.className = 'dbx-conta';
                        div.style.borderColor = '#e63946';
                        div.innerHTML = `
                            <div>
                                <strong>${prod.nome}</strong> (${prod.categoria})
                                <br><small>Preço: ${moeda(prod.preco)}</small>
                            </div>
                            <div>
                                <span class="dbx-nivel dbx-nivel-gerente" style="background-color: #d62828;">ESTOQUE: ${prod.estoque} un</span>
                            </div>
                        `;
                        containerEstoque.appendChild(div);
                    });
                }
            }
        } catch (e) {
            console.error('Erro ao buscar métricas:', e);
        }
    }

    let pedidosCache = [];

    function renderizarPedidos(pedidos) {
        const container = el('dbx-lista-pedidos');
        const avisoVazio = el('dbx-pedidos-vazio');
        if (!container) return;

        container.innerHTML = '';
        if (!pedidos || pedidos.length === 0) {
            if (avisoVazio) avisoVazio.hidden = false;
            return;
        }

        if (avisoVazio) avisoVazio.hidden = true;

        pedidos.forEach(p => {
            const div = document.createElement('div');
            div.className = 'dbx-pedido-item';
            div.dataset.busca = `${p.id_pedido} ${p.cliente ? p.cliente.nome : ''} ${p.status_atual}`.toLowerCase();

            const clienteNome = p.cliente ? p.cliente.nome : 'Cliente não informado';
            const clienteEmail = p.cliente ? p.cliente.email : '';
            const itensDesc = (p.itens || []).map(i => `${i.quantidade}x ${i.produto ? i.produto.nome : 'Item'} (${i.tamanho})`).join(', ') || 'Nenhum item listado';

            let statusClass = 'badge-aguardando';
            const s = (p.status_atual || '').toLowerCase();
            if (s.includes('pago')) statusClass = 'badge-pago';
            else if (s.includes('separação')) statusClass = 'badge-separacao';
            else if (s.includes('embalado')) statusClass = 'badge-embalado';
            else if (s.includes('enviado') || s.includes('transito')) statusClass = 'badge-enviado';
            else if (s.includes('entregue')) statusClass = 'badge-entregue';
            else if (s.includes('cancelado')) statusClass = 'badge-cancelado';

            div.innerHTML = `
                <div class="dbx-pedido-item-info">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <strong style="font-size: 16px;">Pedido #${p.id_pedido}</strong>
                        <span class="dbx-pedido-status-badge ${statusClass}">${p.status_atual}</span>
                        <small style="color: #666;">${dataBR(p.data_pedido)}</small>
                    </div>
                    <div style="font-size: 13px; color: #333; margin-top: 4px;">
                        <strong>Cliente:</strong> ${clienteNome} (${clienteEmail})
                    </div>
                    <div style="font-size: 13px; color: #666;">
                        <strong>Itens:</strong> ${itensDesc}
                    </div>
                    <div style="font-size: 14px; font-weight: 700; color: #111; margin-top: 2px;">
                        Total: ${moeda(p.valor_total)} <small style="font-weight: 400; color: #777;">(Frete: ${moeda(p.valor_frete)})</small>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                    <select class="dbx-campo sel-status-pedido" data-id="${p.id_pedido}" style="width: auto; min-width: 180px;">
                        <option value="Aguardando pagamento" ${p.status_atual === 'Aguardando pagamento' ? 'selected' : ''}>Aguardando pagamento</option>
                        <option value="Pago" ${p.status_atual === 'Pago' ? 'selected' : ''}>Pago</option>
                        <option value="Em separação" ${p.status_atual === 'Em separação' ? 'selected' : ''}>Em separação</option>
                        <option value="Embalado" ${p.status_atual === 'Embalado' ? 'selected' : ''}>Embalado</option>
                        <option value="Enviado/Em transito" ${p.status_atual === 'Enviado/Em transito' ? 'selected' : ''}>Enviado/Em transito</option>
                        <option value="Entregue" ${p.status_atual === 'Entregue' ? 'selected' : ''}>Entregue</option>
                        <option value="Cancelado" ${p.status_atual === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                    <button type="button" class="dbx-btn dbx-roxo dbx-mini btn-atualizar-status" data-id="${p.id_pedido}">SALVAR</button>
                </div>
            `;

            container.appendChild(div);
        });

        container.querySelectorAll('.btn-atualizar-status').forEach(btn => {
            btn.addEventListener('click', async () => {
                const idPedido = btn.dataset.id;
                const select = container.querySelector(`.sel-status-pedido[data-id="${idPedido}"]`);
                if (!select) return;

                const novoStatus = select.value;
                btn.disabled = true;
                btn.textContent = '...';

                try {
                    const resp = await fetch(`/api/pedidos/${idPedido}/status`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ status_atual: novoStatus })
                    });

                    const dados = await resp.json();
                    if (!resp.ok) {
                        alert(dados.mensagem || 'Erro ao atualizar status.');
                    } else {
                        btn.textContent = 'OK!';
                        setTimeout(() => (btn.textContent = 'SALVAR'), 1500);
                        carregarPedidos();
                        carregarMetricas();
                    }
                } catch (e) {
                    alert('Erro de conexão ao salvar status.');
                } finally {
                    btn.disabled = false;
                }
            });
        });
    }

    async function carregarPedidos() {
        try {
            const resp = await fetch('/api/pedidos', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (resp.ok) {
                pedidosCache = await resp.json();
                renderizarPedidos(pedidosCache);
            }
        } catch (e) {
            console.error('Erro ao buscar pedidos:', e);
        }
    }

    const filtroStatus = el('filtro-status-pedidos');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', () => {
            const val = filtroStatus.value;
            if (!val) {
                renderizarPedidos(pedidosCache);
            } else {
                renderizarPedidos(pedidosCache.filter(p => p.status_atual === val));
            }
        });
    }

    async function carregarOperadores() {
        if (tipoUsuario !== 'admin') return;

        const container = el('dbx-lista-contas');
        const avisoVazio = el('dbx-vazio-contas');
        const selectDel = el('dbx-del-id');
        if (!container) return;

        try {
            const resp = await fetch('/api/operadores', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!resp.ok) return;

            const operadores = await resp.json();
            container.innerHTML = '';
            if (selectDel) selectDel.innerHTML = '';

            if (operadores.length === 0) {
                if (avisoVazio) avisoVazio.hidden = false;
                return;
            }

            if (avisoVazio) avisoVazio.hidden = true;

            operadores.forEach(op => {
                const div = document.createElement('div');
                div.className = 'dbx-conta';
                div.dataset.busca = `${op.nome} ${op.email} ${op.cpf}`.toLowerCase();

                div.innerHTML = `
                    <div>
                        <strong>${op.nome}</strong>
                        <br><small>${op.email} · Tel: ${op.telefone} · CPF: ${op.cpf}</small>
                    </div>
                    <div>
                        <span class="dbx-nivel dbx-nivel-operador">${op.nivel || 'Operador'}</span>
                    </div>
                `;
                container.appendChild(div);

                if (selectDel) {
                    const opt = document.createElement('option');
                    opt.value = op.id_usuario;
                    opt.textContent = `${op.nome} (${op.email}) - CPF: ${op.cpf}`;
                    selectDel.appendChild(opt);
                }
            });
        } catch (e) {
            console.error('Erro ao carregar operadores:', e);
        }
    }

    const modoContas = el('dbx-modo');
    const formAddOp = el('dbx-form-add');
    const formDelOp = el('dbx-form-del');

    if (modoContas) {
        modoContas.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-modo]');
            if (!btn) return;
            const modo = btn.dataset.modo;
            if (modo === 'adicionar') {
                if (formAddOp) formAddOp.hidden = false;
                if (formDelOp) formDelOp.hidden = true;
            } else {
                if (formAddOp) formAddOp.hidden = true;
                if (formDelOp) formDelOp.hidden = false;
            }
        });
    }

    if (formAddOp) {
        formAddOp.addEventListener('submit', async (e) => {
            e.preventDefault();
            const erroP = el('dbx-erro-add');
            if (erroP) erroP.hidden = true;

            const nome = (formAddOp.elements['nome'] || {}).value;
            const email = (formAddOp.elements['email'] || {}).value;
            const telefone = (formAddOp.elements['telefone'] || {}).value;
            const cpf = (formAddOp.elements['cpf'] || {}).value;
            const senha = (formAddOp.elements['senha'] || {}).value;
            const nivel = (formAddOp.elements['nivel'] || {}).value;

            if (!nome || !email || !cpf || !senha) {
                if (erroP) {
                    erroP.textContent = 'Preencha todos os campos obrigatórios.';
                    erroP.hidden = false;
                }
                return;
            }

            try {
                const resp = await fetch('/api/operadores', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ nome, email, telefone, cpf, senha, nivel })
                });

                const resJson = await resp.json();
                if (!resp.ok) {
                    if (erroP) {
                        erroP.textContent = resJson.mensagem || 'Erro ao cadastrar operador.';
                        erroP.hidden = false;
                    }
                } else {
                    alert('Operador cadastrado com sucesso!');
                    formAddOp.reset();
                    carregarOperadores();
                    carregarMetricas();
                }
            } catch (err) {
                if (erroP) {
                    erroP.textContent = 'Erro de conexão ao criar operador.';
                    erroP.hidden = false;
                }
            }
        });
    }

    if (formDelOp) {
        formDelOp.addEventListener('submit', async (e) => {
            e.preventDefault();
            const erroP = el('dbx-erro-del');
            if (erroP) erroP.hidden = true;

            const idUsuario = (formDelOp.elements['id_usuario'] || {}).value;
            if (!idUsuario) {
                if (erroP) {
                    erroP.textContent = 'Selecione um operador para remover.';
                    erroP.hidden = false;
                }
                return;
            }

            if (!confirm('Tem certeza de que deseja remover este operador da equipe?')) {
                return;
            }

            try {
                const resp = await fetch(`/api/operadores/${idUsuario}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });

                const resJson = await resp.json();
                if (!resp.ok) {
                    if (erroP) {
                        erroP.textContent = resJson.mensagem || 'Erro ao remover operador.';
                        erroP.hidden = false;
                    }
                } else {
                    alert('Operador removido com sucesso!');
                    carregarOperadores();
                    carregarMetricas();
                }
            } catch (err) {
                if (erroP) {
                    erroP.textContent = 'Erro de conexão ao remover operador.';
                    erroP.hidden = false;
                }
            }
        });
    }

    async function carregarClientes() {
        const container = el('dbx-grade-usuarios');
        const avisoVazio = el('dbx-usuarios-vazio');
        if (!container) return;

        try {
            const resp = await fetch('/api/dashboard/clientes', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!resp.ok) return;

            const clientes = await resp.json();
            container.innerHTML = '';

            if (clientes.length === 0) {
                if (avisoVazio) avisoVazio.hidden = false;
                return;
            }

            if (avisoVazio) avisoVazio.hidden = true;

            clientes.forEach(c => {
                const card = document.createElement('div');
                card.className = 'dbx-card';
                card.dataset.busca = `${c.nome} ${c.email} ${c.cpf}`.toLowerCase();

                card.innerHTML = `
                    <div class="dbx-card-img" style="background-color: #2b7bbf;">
                        <img src="../static/images/icones_menu/usuario.png" class="dbx-foto" alt="Foto de ${c.nome}">
                    </div>
                    <div class="dbx-card-info">
                        <h3>${c.nome}</h3>
                        <p>${c.email}</p>
                        <p style="font-size: 12px; margin-top: 4px;"><strong>CPF:</strong> ${c.cpf}</p>
                        <p style="font-size: 12px;"><strong>Tel:</strong> ${c.telefone}</p>
                        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-weight: 700; font-size: 13px;">
                            <span>${c.totalPedidos} Pedido(s)</span>
                            <span style="color: #7B2CBF;">${c.pontos || 0} Points</span>
                        </div>
                    </div>
                `;

                container.appendChild(card);
            });
        } catch (e) {
            console.error('Erro ao buscar clientes:', e);
        }
    }

    async function carregarDrops() {
        const container = el('dbx-grade-drops');
        const avisoVazio = el('dbx-drops-vazio');
        const selectDropProd = el('dbx-prod-drop');
        if (!container) return;

        try {
            const resp = await fetch('/api/drops', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!resp.ok) return;

            const drops = await resp.json();
            container.innerHTML = '';

            if (selectDropProd) {
                selectDropProd.innerHTML = '<option value="">Sem Drop vinculado</option>';
            }

            if (!drops || drops.length === 0) {
                if (avisoVazio) avisoVazio.hidden = false;
                return;
            }

            if (avisoVazio) avisoVazio.hidden = true;

            drops.forEach(d => {
                const totalProds = d.produtos ? d.produtos.length : 0;
                if (selectDropProd) {
                    const opt = document.createElement('option');
                    opt.value = d.id_drop;
                    opt.textContent = `${d.nome} (${totalProds} produtos)`;
                    selectDropProd.appendChild(opt);
                }

                const card = document.createElement('div');
                card.className = 'dbx-card';
                card.dataset.busca = `${d.nome}`.toLowerCase();
                card.style.padding = '16px';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.justifyContent = 'space-between';

                card.innerHTML = `
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="font-size: 16px;">${d.nome}</strong>
                            <span class="dbx-nivel dbx-nivel-operador">Limite: ${d.limite_pecas} pçs</span>
                        </div>
                        <p style="font-size: 12px; color: #555; margin: 4px 0;"><strong>Período:</strong> ${dataBR(d.data_inicio)} até ${dataBR(d.data_fim)}</p>
                        <p style="font-size: 12px; color: #555; margin: 4px 0;"><strong>Produtos no Drop:</strong> ${totalProds}</p>
                        ${d.banner_index ? `<div style="font-size: 11px; color: #666; margin-top: 6px;"><strong>Banner Início:</strong><br><img src="${d.banner_index}" alt="Banner de início" style="max-width: 100%; max-height: 80px; object-fit: contain;"></div>` : ''}
                        ${d.banner_produto ? `<div style="font-size: 11px; color: #666; margin-top: 2px;"><strong>Banner Produto:</strong><br><img src="${d.banner_produto}" alt="Banner de produto" style="max-width: 100%; max-height: 80px; object-fit: contain;"></div>` : ''}
                    </div>

                    <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
                        <button type="button" class="dbx-btn dbx-laranja dbx-mini btn-del-drop" data-id="${d.id_drop}">EXCLUIR DROP</button>
                    </div>
                `;

                container.appendChild(card);
            });

            container.querySelectorAll('.btn-del-drop').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Deseja realmente remover este Drop?')) return;
                    try {
                        const r = await fetch(`/api/drops/${btn.dataset.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                        if (r.ok) {
                            carregarDrops();
                        } else {
                            const err = await r.json();
                            alert(err.mensagem || 'Erro ao remover drop.');
                        }
                    } catch (e) {
                        alert('Erro de conexão ao remover drop.');
                    }
                });
            });
        } catch (e) {
            console.error('Erro ao carregar drops:', e);
        }
    }

    const formNovoDrop = el('dbx-form-drop');
    const imagemDropIndex = el('dbx-drop-banner-index');
    const imagemDropProduto = el('dbx-drop-banner-prod');
    const imagemProduto = el('dbx-prod-imagem');

    function configurarPreviaImagem(input, preview) {
        if (!input || !preview) return;
        let urlPrevia = null;

        function limparPrevia() {
            if (urlPrevia) URL.revokeObjectURL(urlPrevia);
            urlPrevia = null;
            preview.removeAttribute('src');
            preview.hidden = true;
        }

        input.addEventListener('change', () => {
            const arquivo = input.files && input.files[0];
            if (!arquivo) {
                limparPrevia();
                return;
            }

            if (!arquivo.type.startsWith('image/')) {
                input.value = '';
                limparPrevia();
                return;
            }

            limparPrevia();
            urlPrevia = URL.createObjectURL(arquivo);
            preview.src = urlPrevia;
            preview.hidden = false;
        });

        if (input.form) input.form.addEventListener('reset', limparPrevia);
    }

    configurarPreviaImagem(imagemDropIndex, el('dbx-drop-banner-index-preview'));
    configurarPreviaImagem(imagemDropProduto, el('dbx-drop-banner-prod-preview'));
    configurarPreviaImagem(imagemProduto, el('dbx-prod-imagem-preview'));

    function imagemParaDataUrl(input, larguraMaxima) {
        const arquivo = input.files && input.files[0];
        if (!arquivo) return Promise.resolve(null);
        if (!arquivo.type.startsWith('image/')) {
            return Promise.reject(new Error('Selecione um arquivo de imagem válido.'));
        }

        return new Promise((resolve, reject) => {
            const urlTemporaria = URL.createObjectURL(arquivo);
            const imagem = new Image();

            imagem.onload = () => {
                URL.revokeObjectURL(urlTemporaria);
                const escala = Math.min(1, larguraMaxima / imagem.naturalWidth);
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(imagem.naturalWidth * escala));
                canvas.height = Math.max(1, Math.round(imagem.naturalHeight * escala));

                const contexto = canvas.getContext('2d');
                if (!contexto) {
                    reject(new Error('Não foi possível processar a imagem selecionada.'));
                    return;
                }

                let dataUrl;
                try {
                    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
                    dataUrl = canvas.toDataURL('image/webp', 0.8);
                    if (!dataUrl.startsWith('data:image/webp;')) {
                        dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    }
                } catch {
                    reject(new Error('Não foi possível comprimir a imagem selecionada.'));
                    return;
                }

                if (!dataUrl.startsWith('data:image/')) {
                    reject(new Error('Não foi possível gerar uma imagem compatível para envio.'));
                    return;
                }
                if (dataUrl.length > 15 * 1024 * 1024) {
                    reject(new Error('A imagem processada excede o tamanho permitido. Escolha uma imagem menor.'));
                    return;
                }
                resolve(dataUrl);
            };

            imagem.onerror = () => {
                URL.revokeObjectURL(urlTemporaria);
                reject(new Error('Não foi possível abrir a imagem selecionada.'));
            };
            imagem.src = urlTemporaria;
        });
    }

    if (formNovoDrop) {
        formNovoDrop.addEventListener('submit', async (e) => {
            e.preventDefault();
            const erroP = el('dbx-erro-drop');
            if (erroP) erroP.hidden = true;

            const nome = (formNovoDrop.elements['nome'] || {}).value;
            const data_inicio = (formNovoDrop.elements['data_inicio'] || {}).value;
            const data_fim = (formNovoDrop.elements['data_fim'] || {}).value;
            const limite_pecas = (formNovoDrop.elements['limite_pecas'] || {}).value;
            if (!nome || !data_inicio || !data_fim || !limite_pecas) {
                if (erroP) {
                    erroP.textContent = 'Preencha todos os campos obrigatórios do Drop.';
                    erroP.hidden = false;
                }
                return;
            }

            try {
                const banner_index = await imagemParaDataUrl(imagemDropIndex, 1448);
                const banner_produto = await imagemParaDataUrl(imagemDropProduto, 1920);
                const resp = await fetch('/api/drops', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        nome,
                        data_inicio,
                        data_fim,
                        limite_pecas,
                        banner_index,
                        banner_produto
                    })
                });

                const resJson = await resp.json();
                if (!resp.ok) {
                    if (erroP) {
                        erroP.textContent = resJson.mensagem || 'Erro ao criar drop.';
                        erroP.hidden = false;
                    }
                } else {
                    alert(`Drop "${nome}" criado com sucesso!`);
                    formNovoDrop.reset();
                    carregarDrops();
                }
            } catch (err) {
                if (erroP) {
                    erroP.textContent = err.message || 'Erro de conexão ao criar drop.';
                    erroP.hidden = false;
                }
            }
        });
    }

    const formNovoProd = el('dbx-form-prod-simples');
    if (formNovoProd) {
        formNovoProd.addEventListener('submit', async (e) => {
            e.preventDefault();
            const erroP = el('dbx-erro-prod');
            if (erroP) erroP.hidden = true;

            const nome = (formNovoProd.elements['nome'] || {}).value;
            const id_drop = (formNovoProd.elements['id_drop'] || {}).value;
            const descricao = (formNovoProd.elements['descricao'] || {}).value;
            const preco = (formNovoProd.elements['preco'] || {}).value;
            const estoque = (formNovoProd.elements['estoque'] || {}).value;
            const categoria = (formNovoProd.elements['categoria'] || {}).value;
            const SKU = (formNovoProd.elements['SKU'] || {}).value;
            const tamanho = (formNovoProd.elements['tamanho'] || {}).value;

            if (!nome || !preco || estoque === undefined || !SKU) {
                if (erroP) {
                    erroP.textContent = 'Preencha todos os campos obrigatórios do produto.';
                    erroP.hidden = false;
                }
                return;
            }

            try {
                const imagem = await imagemParaDataUrl(imagemProduto, 800);
                const resp = await fetch('/api/produtos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        nome,
                        imagem: imagem || null,
                        id_drop: id_drop ? Number(id_drop) : null,
                        descricao,
                        preco,
                        estoque,
                        categoria,
                        SKU,
                        tamanho
                    })
                });

                const resJson = await resp.json();
                if (!resp.ok) {
                    if (erroP) {
                        erroP.textContent = resJson.mensagem || 'Erro ao cadastrar produto.';
                        erroP.hidden = false;
                    }
                } else {
                    alert(`Produto "${nome}" cadastrado com sucesso com transparência de criador!`);
                    formNovoProd.reset();
                    carregarMetricas();
                    carregarDrops();
                }
            } catch (err) {
                if (erroP) {
                    erroP.textContent = err.message || 'Erro de conexão ao criar produto.';
                    erroP.hidden = false;
                }
            }
        });
    }

    async function carregarPropostas() {
        if (tipoUsuario !== 'admin') return;

        const container = el('dbx-lista-propostas');
        const avisoVazio = el('dbx-propostas-vazio');
        if (!container) return;

        try {
            const resp = await fetch('/api/propostas', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!resp.ok) return;

            const propostas = await resp.json();
            container.innerHTML = '';

            if (propostas.length === 0) {
                if (avisoVazio) avisoVazio.hidden = false;
                return;
            }

            if (avisoVazio) avisoVazio.hidden = true;

            propostas.forEach(prop => {
                const div = document.createElement('div');
                div.className = 'dbx-conta';
                div.dataset.busca = `${prop.titulo} ${prop.categoria}`.toLowerCase();

                const criador = prop.criador ? `${prop.criador.nome} (${(prop.criador.tipo || 'admin').toUpperCase()})` : 'DripLab';

                div.innerHTML = `
                    <div>
                        <strong>${prop.titulo}</strong> (${prop.categoria})
                        <br><small>${prop.descricao || 'Sem descrição'}</small>
                        <br><span class="transparencia-criador">Criado por: ${criador}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="dbx-nivel dbx-nivel-gerente" style="background-color: #7B2CBF;">${prop.quantidade_votos || 0} VOTO(S)</span>
                        <button type="button" class="dbx-btn dbx-laranja dbx-mini btn-del-prop" data-id="${prop.id_proposta}">EXCLUIR</button>
                    </div>
                `;

                container.appendChild(div);
            });

            container.querySelectorAll('.btn-del-prop').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Deseja excluir esta proposta de votação?')) return;
                    try {
                        const r = await fetch(`/api/propostas/${btn.dataset.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                        if (r.ok) {
                            carregarPropostas();
                            carregarMetricas();
                        } else {
                            const err = await r.json();
                            alert(err.mensagem || 'Erro ao excluir proposta.');
                        }
                    } catch (e) {
                        alert('Erro de conexão ao remover proposta.');
                    }
                });
            });
        } catch (e) {
            console.error('Erro ao carregar propostas:', e);
        }
    }

    const formNovaProp = el('dbx-form-proposta');
    if (formNovaProp) {
        formNovaProp.addEventListener('submit', async (e) => {
            e.preventDefault();
            const erroP = el('dbx-erro-prop');
            if (erroP) erroP.hidden = true;

            const titulo = (formNovaProp.elements['titulo'] || {}).value;
            const descricao = (formNovaProp.elements['descricao'] || {}).value;
            const categoria = (formNovaProp.elements['categoria'] || {}).value;

            if (!titulo || !categoria) {
                if (erroP) {
                    erroP.textContent = 'Preencha título e categoria da proposta.';
                    erroP.hidden = false;
                }
                return;
            }

            try {
                const resp = await fetch('/api/propostas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ titulo, descricao, categoria })
                });

                const resJson = await resp.json();
                if (!resp.ok) {
                    if (erroP) {
                        erroP.textContent = resJson.mensagem || 'Erro ao publicar proposta.';
                        erroP.hidden = false;
                    }
                } else {
                    alert('Proposta criada e publicada com sucesso!');
                    formNovaProp.reset();
                    carregarPropostas();
                    carregarMetricas();
                }
            } catch (err) {
                if (erroP) {
                    erroP.textContent = 'Erro de conexão ao criar proposta.';
                    erroP.hidden = false;
                }
            }
        });
    }

    const campoPesquisa = el('dbx-pesquisa');
    if (campoPesquisa) {
        campoPesquisa.addEventListener('input', () => {
            const termo = campoPesquisa.value.trim().toLowerCase();
            const paginaAtiva = $$('.dbx-pagina').find(p => !p.hidden);
            if (!paginaAtiva) return;

            $$('[data-busca]', paginaAtiva).forEach(item => {
                const bate = item.dataset.busca.includes(termo);
                item.hidden = !bate;
            });
        });
    }

    carregarMetricas();
    carregarDrops();
    carregarPropostas();
    carregarPedidos();
    carregarOperadores();
    carregarClientes();
})();