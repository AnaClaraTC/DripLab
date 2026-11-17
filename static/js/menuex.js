const btnPerfil = document.getElementById('btnperfil');
const menuExtra = document.getElementById('menuextra');

if (btnPerfil && menuExtra) {

    function alternarMenu() {
        menuExtra.classList.toggle('aberto');
        const menuAberto = menuExtra.classList.contains('aberto');
        btnPerfil.setAttribute('aria-expanded', menuAberto);
    }

    btnPerfil.addEventListener('click', function (evento) {
        evento.stopPropagation();
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

    const token = localStorage.getItem('token') || localStorage.getItem('driplab_token');
    const usuarioSalvo = localStorage.getItem('usuario') || localStorage.getItem('driplab_usuario');
    const loginfo = document.getElementById('loginfo');

    if (loginfo) {
        if (token && usuarioSalvo) {
            try {
                const usuario = JSON.parse(usuarioSalvo);
                const tipo = usuario.tipo;

                if ((tipo === 'admin' || tipo === 'operador') && !document.getElementById('link-dashboard-menu')) {
                    const liDash = document.createElement('li');
                    liDash.id = 'link-dashboard-menu';
                    liDash.innerHTML = '<a href="dashboard.html" style="font-weight: 700; color: #7B2CBF;">PAINEL DE CONTROLE</a>';
                    loginfo.insertBefore(liDash, loginfo.firstChild);
                }

                const links = loginfo.querySelectorAll('a');
                links.forEach(link => {
                    if (link.getAttribute('href') === 'login.html') {
                        link.textContent = `${usuario.nome.split(' ')[0].toUpperCase()} (${tipo.toUpperCase()})`;
                        link.setAttribute('href', 'perfil.html');
                    }
                });
            } catch (e) {}
        }

        const btnDesconectar = loginfo.querySelector('button');
        if (btnDesconectar) {
            btnDesconectar.addEventListener('click', function () {
                localStorage.removeItem('token');
                localStorage.removeItem('driplab_token');
                localStorage.removeItem('usuario');
                localStorage.removeItem('driplab_usuario');
                window.location.href = 'login.html';
            });
        }
    }
}