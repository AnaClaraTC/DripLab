(() => {
    const el = (id) => document.getElementById(id);
    const grade = el("grade-propostas-votacao");
    if (!grade) return;

    const getToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');

    async function carregarPropostas() {
        const token = getToken();
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};

        try {
            const resp = await fetch('/api/propostas', { headers });
            if (!resp.ok) return;

            const propostas = await resp.json();
            grade.innerHTML = '';

            if (propostas.length === 0) {
                grade.innerHTML = '<p style="color: #777; font-size: 14px;">Nenhuma proposta em votação no momento. Fique ligado nos próximos drops!</p>';
                return;
            }

            propostas.forEach(p => {
                const card = document.createElement('div');
                card.className = 'dbx-card';
                card.style.padding = '20px';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.justifyContent = 'space-between';

                const criadorNome = p.criador ? p.criador.nome : 'DripLab';
                const criadorTipo = p.criador ? (p.criador.tipo || 'admin').toUpperCase() : 'ADMIN';

                card.innerHTML = `
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <span class="dbx-nivel dbx-nivel-operador" style="font-size: 11px;">${p.categoria.toUpperCase()}</span>
                            <span style="font-weight: 800; font-size: 14px; color: #7B2CBF;">${p.quantidade_votos || 0} VOTOS</span>
                        </div>
                        <h3 style="font-size: 18px; font-weight: 800; margin: 8px 0 4px; color: #111;">${p.titulo}</h3>
                        <p style="font-size: 13px; color: #555; line-height: 1.4; margin-bottom: 12px;">${p.descricao || 'Sem descrição.'}</p>
                        <span class="transparencia-criador">Criado por: ${criadorNome} (${criadorTipo})</span>
                    </div>

                    <div style="margin-top: 16px;">
                        ${p.jaVotou ? `
                            <button type="button" class="dbx-btn dbx-laranja btn-votar" data-id="${p.id_proposta}" data-acao="remover" style="width: 100%;">REMOVER MEU VOTO</button>
                        ` : `
                            <button type="button" class="dbx-btn dbx-roxo btn-votar" data-id="${p.id_proposta}" data-acao="votar" style="width: 100%;">VOTAR (+10 POINTS)</button>
                        `}
                    </div>
                `;

                grade.appendChild(card);
            });

            grade.querySelectorAll('.btn-votar').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const idProposta = btn.dataset.id;
                    const acao = btn.dataset.acao;
                    const tokenAtual = getToken();

                    if (!tokenAtual) {
                        alert('Faça login para participar das votações e acumular Drip Points!');
                        window.location.href = 'login.html';
                        return;
                    }

                    btn.disabled = true;

                    try {
                        let respVoto;
                        if (acao === 'votar') {
                            respVoto = await fetch('/api/votar', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + tokenAtual
                                },
                                body: JSON.stringify({ id_proposta: idProposta })
                            });
                        } else {
                            respVoto = await fetch(`/api/votos/${idProposta}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': 'Bearer ' + tokenAtual
                                }
                            });
                        }

                        const resJson = await respVoto.json();
                        if (!respVoto.ok) {
                            alert(resJson.mensagem || 'Erro ao processar voto.');
                        } else {
                            alert(resJson.mensagem);
                            carregarPropostas();
                        }
                    } catch (e) {
                        alert('Erro de conexão ao processar voto.');
                    } finally {
                        btn.disabled = false;
                    }
                });
            });

        } catch (e) {
            console.error('Erro ao carregar propostas:', e);
        }
    }

    carregarPropostas();
})();