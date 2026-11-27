const btnPerfil = document.getElementById('btnperfil');
const menuExtra = document.getElementById('menuextra');
const loginfo = document.getElementById('loginfo');

const obterToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');

function limparSessao() {
    ['token', 'driplab_token', 'usuario', 'driplab_usuario'].forEach((chave) => {
        localStorage.removeItem(chave);
    });
    const linksPerfil = loginfo && loginfo.querySelectorAll('a[href="perfil.html"], a[data-link-perfil]');
    linksPerfil?.forEach((linkPerfil) => {
        linkPerfil.href = 'login.html';
        linkPerfil.removeAttribute('data-link-perfil');
    });
}

async function validarSessao() {
    const token = obterToken();
    if (!token) return null;

    const resposta = await fetch('/api/auth/perfil', {
        headers: { Authorization: 'Bearer ' + token }
    });

    if (resposta.status === 401 || resposta.status === 404) {
        limparSessao();
        return null;
    }
    if (!resposta.ok) {
        throw new Error(`Não foi possível validar a sessão (HTTP ${resposta.status}).`);
    }

    const usuario = await resposta.json();
    if (!usuario || !usuario.id_usuario) {
        throw new Error('A API retornou dados inválidos para a sessão.');
    }

    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('driplab_usuario', JSON.stringify(usuario));
    return usuario;
}

function atualizarMenu(usuario) {
    if (!loginfo) return;

    const linkLogin = loginfo.querySelector('a[href="login.html"]');
    const linkPerfil = loginfo.querySelector('a[href="perfil.html"], a[data-link-perfil]');
    const tipo = usuario.tipo || 'cliente';

    if (linkLogin) {
        linkLogin.textContent = `${usuario.nome.split(' ')[0].toUpperCase()} (${tipo.toUpperCase()})`;
        linkLogin.href = 'perfil.html';
        linkLogin.dataset.linkPerfil = 'true';
    }
    if (linkPerfil) {
        linkPerfil.href = 'perfil.html';
        linkPerfil.dataset.linkPerfil = 'true';
    }

    if ((tipo === 'admin' || tipo === 'operador') && !document.getElementById('link-dashboard-menu')) {
        const liDash = document.createElement('li');
        liDash.id = 'link-dashboard-menu';
        const linkDash = document.createElement('a');
        linkDash.href = 'dashboard.html';
        linkDash.textContent = 'PAINEL DE CONTROLE';
        linkDash.style.fontWeight = '700';
        linkDash.style.color = '#7B2CBF';
        liDash.appendChild(linkDash);
        loginfo.insertBefore(liDash, loginfo.firstChild);
    }
}

if (loginfo) {
    const usuarioSalvo = localStorage.getItem('usuario') || localStorage.getItem('driplab_usuario');
    const token = obterToken();
    const linkPerfil = loginfo.querySelector('a[href="perfil.html"]');

    if (!token) {
        if (linkPerfil) {
            linkPerfil.href = 'login.html';
            linkPerfil.dataset.linkPerfil = 'true';
        }
    } else if (usuarioSalvo) {
        try {
            atualizarMenu(JSON.parse(usuarioSalvo));
        } catch (erro) {
            console.error('Não foi possível ler os dados da sessão:', erro);
        }
    }

    loginfo.addEventListener('click', async (evento) => {
        const link = evento.target.closest('a');
        if (!link || (link.getAttribute('href') !== 'perfil.html' && !link.dataset.linkPerfil)) return;

        evento.preventDefault();
        if (!obterToken()) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const usuario = await validarSessao();
            if (!usuario) {
                window.location.href = 'login.html';
                return;
            }
            atualizarMenu(usuario);
            window.location.href = 'perfil.html';
        } catch (erro) {
            console.error('Erro ao validar a sessão antes de abrir o perfil:', erro);
            window.location.href = 'perfil.html';
        }
    });

    const btnDesconectar = loginfo.querySelector('button');
    if (btnDesconectar) {
        btnDesconectar.addEventListener('click', function () {
            limparSessao();
            window.location.href = 'login.html';
        });
    }
}

if (btnPerfil && menuExtra) {
    function alternarMenu() {
        menuExtra.classList.toggle('aberto');
        const menuAberto = menuExtra.classList.contains('aberto');
        btnPerfil.setAttribute('aria-expanded', menuAberto);
    }

    btnPerfil.addEventListener('click', async function (evento) {
        evento.stopPropagation();

        if (!obterToken()) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const usuario = await validarSessao();
            if (!usuario) {
                window.location.href = 'login.html';
                return;
            }
            atualizarMenu(usuario);
        } catch (erro) {
            console.error('Erro ao validar a sessão ao abrir o menu de perfil:', erro);
        }

        alternarMenu();
    });

    menuExtra.addEventListener('click', function (evento) {
        evento.stopPropagation();
    });

    document.addEventListener('click', function () {
        menuExtra.classList.remove('aberto');
        btnPerfil.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape') {
            menuExtra.classList.remove('aberto');
            btnPerfil.setAttribute('aria-expanded', 'false');
        }
    });
}
