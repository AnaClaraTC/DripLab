const telaLogin = document.getElementById('arealogin');
const telaCadastro = document.getElementById('areacadastro');
const telaSenha = document.getElementById('areasenha');

function mostrarTela(telaEscolhida) {
    if (!telaLogin || !telaCadastro || !telaSenha) return;

    telaLogin.hidden = true;
    telaCadastro.hidden = true;
    telaSenha.hidden = true;

    telaEscolhida.hidden = false;
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

//LOGIN - Recuperar senha
const btnAbrirRec = document.getElementById('abrirRecuperacao');
if (btnAbrirRec) {
    btnAbrirRec.addEventListener('click', function(evento) {
        evento.preventDefault();
        mostrarTela(telaSenha);
    });
}

//LOGIN - Cadastrop
const btnAbrirCad = document.getElementById('abrirCadastro');
if (btnAbrirCad) {
    btnAbrirCad.addEventListener('click', function(evento) {
        evento.preventDefault();
        mostrarTela(telaCadastro);
    });
}

const btnVoltarLoginSenha = document.getElementById('voltarLoginSenha');
if (btnVoltarLoginSenha) {
    btnVoltarLoginSenha.addEventListener('click', function(evento) {
        evento.preventDefault();
        mostrarTela(telaLogin);
    });
}
const btnVoltarLoginCad = document.getElementById('voltarLoginCadastro');
if (btnVoltarLoginCad) {
    btnVoltarLoginCad.addEventListener('click', function(evento) {
        evento.preventDefault();
        mostrarTela(telaLogin);
    });
}

if (telaLogin && telaCadastro && telaSenha) {
    mostrarTela(telaLogin);
}

const etapaEmail = document.getElementById('etapaemail');
const etapaCodigo = document.getElementById('etapacodigo');
const etapaNovaSenha = document.getElementById('etapanovasenha');

function mostrarEtapa(etapaEscolhida) {
    if (!etapaEmail || !etapaCodigo || !etapaNovaSenha) return;
    etapaEmail.style.display = 'none';
    etapaCodigo.style.display = 'none';
    etapaNovaSenha.style.display = 'none';

    etapaEscolhida.style.display = 'flex';
}

const btnEnviarCodigo = document.getElementById('enviarCodigo');
if (btnEnviarCodigo) {
    btnEnviarCodigo.addEventListener('click', function() {
        const email = document.getElementById('emailrecuperacao').value;
        if (email.trim() === '') {
            alert('Insira seu e-mail!');
            return;
        }
        mostrarEtapa(etapaCodigo);
    });
}

const btnVerificarCodigo = document.getElementById('verificarCodigo');
if (btnVerificarCodigo) {
    btnVerificarCodigo.addEventListener('click', function() {
        const codigo = document.getElementById('codigoVerif').value;
        if (codigo.trim() === '') {
            alert('Insira o código de verificação!');
            return;
        }
        mostrarEtapa(etapaNovaSenha);
    });
}

const btnSalvarNovaSenha = document.getElementById('salvarNovaSenha');
if (btnSalvarNovaSenha) {
    btnSalvarNovaSenha.addEventListener('click', function() {
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

        alert('Senha redefinida com sucesso! Faça login com a nova senha.');
        mostrarTela(telaLogin);
    });
}

const btnLogin = document.getElementById('loginbtn');
if (btnLogin) {
    btnLogin.addEventListener('click', async function(e) {
        e.preventDefault();
        const emailInput = document.getElementById('emailLogin');
        const senhaInput = document.getElementById('senhaLogin');

        const email = emailInput ? emailInput.value.trim() : '';
        const senha = senhaInput ? senhaInput.value : '';

        if (!email || !senha) {
            alert('Preencha seu e-mail e senha.');
            return;
        }

        try {
            btnLogin.disabled = true;
            btnLogin.textContent = 'ENTRANDO...';

            const resposta = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem || 'Falha ao realizar login.');
            }

            localStorage.setItem('token', dados.token);
            localStorage.setItem('driplab_token', dados.token);
            localStorage.setItem('usuario', JSON.stringify(dados.usuario));
            localStorage.setItem('driplab_usuario', JSON.stringify(dados.usuario));

            const tipo = dados.usuario.tipo;
            if (tipo === 'admin' || tipo === 'operador') {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'perfil.html';
            }
        } catch (erro) {
            alert(erro.message);
        } finally {
            btnLogin.disabled = false;
            btnLogin.textContent = 'ENTRAR';
        }
    });
}

const btnCadastro = document.getElementById('cadastrobtn');
if (btnCadastro) {
    btnCadastro.addEventListener('click', async function(e) {
        e.preventDefault();

        const nome = (document.getElementById('nomeCadastro') || {}).value || '';
        const cpf = (document.getElementById('cpfCadastro') || {}).value || '';
        const email = (document.getElementById('emailCadastro') || {}).value || '';
        const telefone = (document.getElementById('telefoneCadastro') || {}).value || '';
        const senha = (document.getElementById('senhaCadastro') || {}).value || '';
        const confirmarSenha = (document.getElementById('confirmar-senha') || {}).value || '';

        if (!nome.trim() || !cpf.trim() || !email.trim() || !telefone.trim() || !senha) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        if (senha !== confirmarSenha) {
            alert('A confirmação da senha não coincide com a senha informada.');
            return;
        }

        try {
            btnCadastro.disabled = true;
            btnCadastro.textContent = 'CADASTRANDO...';

            const payload = {
                nome: nome.trim(),
                cpf: cpf.trim(),
                email: email.trim(),
                telefone: telefone.trim(),
                senha
            };

            const resposta = await fetch('/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const dados = await resposta.json();
            if (!resposta.ok) {
                throw new Error(dados.mensagem || 'Erro ao realizar cadastro.');
            }

            alert(dados.tipo === 'admin'
                ? 'Primeiro usuário cadastrado como administrador. Faça login para continuar.'
                : 'Cadastro de cliente realizado com sucesso! Faça login para continuar.');
            if (document.getElementById('emailLogin')) {
                document.getElementById('emailLogin').value = email;
            }
            mostrarTela(telaLogin);
        } catch (erro) {
            alert(erro.message);
        } finally {
            btnCadastro.disabled = false;
            btnCadastro.textContent = 'CADASTRAR';
        }
    });
}
