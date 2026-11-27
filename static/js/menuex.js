
// Elementos do menu
const btnPerfil = document.getElementById('btnperfil');
const menuExtra = document.getElementById('menuextra');

// Verifica se os elementos existem na página
if (btnPerfil && menuExtra) {

    // Função para abrir ou fechar o menu
    function alternarMenu() {
        menuExtra.classList.toggle('aberto');

        const menuAberto = menuExtra.classList.contains('aberto');

        btnPerfil.setAttribute('aria-expanded', menuAberto);
    }

    // Abre ou fecha ao clicar na imagem do usuário
    btnPerfil.addEventListener('click', function (evento) {
        evento.stopPropagation();
        alternarMenu();
    });

    // Impede que um clique dentro do menu feche o menu
    menuExtra.addEventListener('click', function (evento) {
        evento.stopPropagation();
    });

    // Fecha o menu ao clicar fora dele
    document.addEventListener('click', function () {
        menuExtra.classList.remove('aberto');
        btnPerfil.setAttribute('aria-expanded', 'false');
    });

    // Fecha o menu ao pressionar a tecla ESC
    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape') {
            menuExtra.classList.remove('aberto');
            btnPerfil.setAttribute('aria-expanded', 'false');
        }
    });
}
