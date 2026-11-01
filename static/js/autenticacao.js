
// Capturando as três áreas
const telaLogin = document.getElementById('arealogin');
const telaCadastro = document.getElementById('areacadastro');
const telaSenha = document.getElementById('areasenha');

// Função responsável por alternar as telas
function mostrarTela(telaEscolhida) {

    // Esconde todas as telas
    telaLogin.hidden = true;
    telaCadastro.hidden = true;
    telaSenha.hidden = true;

    // Mostra somente a tela escolhida
    telaEscolhida.hidden = false;

    // Leva o usuário ao início da área de autenticação
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// LOGIN → RECUPERAÇÃO DE SENHA
document.getElementById('abrirRecuperacao')
    .addEventListener('click', function(evento) {

        evento.preventDefault();
        mostrarTela(telaSenha);

    });

// LOGIN → CADASTRO
document.getElementById('abrirCadastro')
    .addEventListener('click', function(evento) {

        evento.preventDefault();
        mostrarTela(telaCadastro);

    });

// RECUPERAÇÃO → LOGIN
document.getElementById('voltarLoginSenha')
    .addEventListener('click', function(evento) {

        evento.preventDefault();
        mostrarTela(telaLogin);

    });

// CADASTRO → LOGIN
document.getElementById('voltarLoginCadastro')
    .addEventListener('click', function(evento) {

        evento.preventDefault();
        mostrarTela(telaLogin);

    });

// Inicialização: começa no login
mostrarTela(telaLogin);

// Etapas da recuperação de senha
const etapaEmail = document.getElementById('etapaemail');
const etapaCodigo = document.getElementById('etapacodigo');
const etapaNovaSenha = document.getElementById('etapanovasenha');

// Função para mostrar a etapa escolhida
function mostrarEtapa(etapaEscolhida) {
    etapaEmail.style.display = 'none';
    etapaCodigo.style.display = 'none';
    etapaNovaSenha.style.display = 'none';

    etapaEscolhida.style.display = 'flex';
}


// Botão: enviar código
document.getElementById('enviarCodigo')
    .addEventListener('click', function() {

        const email = document.getElementById('emailrecuperacao').value;

        if (email.trim() === '') {
            alert('Insira seu e-mail!');
            return;
        }

        mostrarEtapa(etapaCodigo);
    });


// Botão: verificar código
document.getElementById('verificarCodigo')
    .addEventListener('click', function() {

        const codigo = document.getElementById('codigoVerif').value;

        if (codigo.trim() === '') {
            alert('Insira o código de verificação!');
            return;
        }

        mostrarEtapa(etapaNovaSenha);
    });


// Botão: alterar senha
document.getElementById('salvarNovaSenha')
    .addEventListener('click', function() {

        const senha = document.getElementById('novaSenha').value;
        const confirmarSenha = document.getElementById('confirmarNovaSenha').value;

        if (senha.trim() === '' || confirmarSenha.trim() === '') {
            alert('Preencha os dois campos!');
            return;
        }

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        alert('Senhas conferidas! Agora podemos integrar a alteração ao backend.');
    });
