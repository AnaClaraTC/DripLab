(() => {
    const modal      = document.getElementById("modalperfil");
    const form       = document.getElementById("formperfil");
    const titulo     = document.getElementById("tituloperfilmodal");
    const texto      = document.getElementById("textoperfilmodal");
    const area       = document.getElementById("camposperfil");
    const erro       = document.getElementById("erromodalperfil");
    const btnEnviar  = document.getElementById("btnenviarperfil");

    if (!modal || !form) return;

    let campoAtual = null;
    let etapa = 1;
    let dadosEtapa1 = {};
    let urlFotoAtual = null;

    const soNumeros = (v) => v.replace(/\D/g, "");
    const el = (id) => document.getElementById(id);
    const getToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');

    const CONFIG = {
        nome: {
            titulo: "ALTERAR NOME COMPLETO",
            texto: "Informe seu novo nome completo.",
            botao: "SALVAR ALTERAÇÃO",
            verificacao: false,
            alvo: "nomeperfil",
            campos: [{
                id: "novoNome", label: "Novo nome", type: "text",
                placeholder: "Digite seu nome completo", maxlength: 60, autocomplete: "name",
                atual: () => el("nomeperfil") ? el("nomeperfil").textContent.trim() : ""
            }],
            validar(v) {
                const n = (v.novoNome || "").replace(/\s+/g, " ").trim();
                if (!n) return "Informe seu nome completo.";
                if (n.length < 3 || n.length > 60) return "O nome deve ter entre 3 e 60 caracteres.";
                if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(n)) return "Use apenas letras, espaços, apóstrofo ou hífen.";
                if (n.split(" ").length < 2) return "Informe nome e sobrenome.";
                return "";
            },
            exibir: (v) => (v.novoNome || "").replace(/\s+/g, " ").trim()
        },

        foto: {
            titulo: "ALTERAR FOTO DE PERFIL",
            texto: "Escolha uma imagem JPG, PNG ou WEBP de até 2 MB.",
            botao: "SALVAR ALTERAÇÃO",
            verificacao: false,
            campos: [{
                id: "novaFoto", label: "Nova foto", type: "file",
                accept: "image/png,image/jpeg,image/webp"
            }],
            validar(v) {
                const arquivo = v.novaFoto;
                if (!arquivo || !arquivo.size) return "Selecione uma imagem.";
                if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type))
                    return "Use uma imagem JPG, PNG ou WEBP.";
                if (arquivo.size > 2 * 1024 * 1024) return "A imagem deve ter no máximo 2 MB.";
                return "";
            },
            aplicar(v) {
                if (urlFotoAtual) URL.revokeObjectURL(urlFotoAtual);
                urlFotoAtual = URL.createObjectURL(v.novaFoto);
                if (el("fotoperfil")) el("fotoperfil").src = urlFotoAtual;
            }
        },

        data: {
            titulo: "ALTERAR DATA DE NASCIMENTO",
            texto: "Selecione sua nova data de nascimento.",
            botao: "SALVAR ALTERAÇÃO",
            verificacao: false,
            alvo: "dataperfil",
            campos: [{
                id: "novaData", label: "Data de nascimento", type: "date",
                atual: () => el("dataperfil") ? el("dataperfil").textContent.trim().split(".").reverse().join("-") : ""
            }],
            validar(v) {
                if (!v.novaData) return "Selecione uma data.";
                const [a, m, d] = v.novaData.split("-").map(Number);
                const dt = new Date(a, m - 1, d);
                if (dt.getFullYear() !== a || dt.getMonth() !== m - 1 || dt.getDate() !== d)
                    return "Essa data não existe.";
                if (a < 1900) return "Data anterior ao limite permitido.";
                if (dt > new Date()) return "A data não pode estar no futuro.";
                return "";
            },
            exibir: (v) => (v.novaData || "").split("-").reverse().join(".")
        },

        email: {
            titulo: "ALTERAR E-MAIL",
            texto: "Informe o novo endereço de e-mail que deseja utilizar.",
            botao: "ENVIAR CÓDIGO DE VERIFICAÇÃO",
            verificacao: true,
            textoCodigo: "Enviamos um código de 6 dígitos para o novo e-mail. Insira-o abaixo.",
            alvo: "emailperfil",
            campos: [
                {
                    id: "novoEmail", label: "Novo e-mail", type: "email",
                    placeholder: "exemplo@dominio.com", maxlength: 80, autocomplete: "email",
                    atual: () => el("emailperfil") ? el("emailperfil").textContent.trim() : ""
                },
                {
                    id: "senhaAtual", label: "Sua senha atual", type: "password",
                    placeholder: "Digite sua senha", autocomplete: "current-password"
                }
            ],
            validar(v) {
                const e = (v.novoEmail || "").trim().toLowerCase();
                if (!e) return "Informe seu novo e-mail.";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Informe um endereço de e-mail válido.";
                if (!v.senhaAtual) return "Informe sua senha atual para confirmar a troca.";
                return "";
            },
            exibir: (v) => (v.novoEmail || "").trim().toLowerCase()
        },

        telefone: {
            titulo: "ALTERAR TELEFONE",
            texto: "Informe seu novo número de telefone com o DDD.",
            botao: "SALVAR ALTERAÇÃO",
            verificacao: false,
            alvo: "telefoneperfil",
            campos: [{
                id: "novoTelefone", label: "Novo telefone", type: "tel",
                placeholder: "+55 (21) 99999-9999", maxlength: 19, autocomplete: "tel",
                atual: () => el("telefoneperfil") ? el("telefoneperfil").textContent.trim() : ""
            }],
            validar(v) {
                const digitos = soNumeros(v.novoTelefone || "");
                if (digitos.length !== 13) return "Informe o telefone no formato +XX (XX) XXXXX-XXXX.";
                return "";
            },
            exibir: (v) => v.novoTelefone
        }
    };

    async function chamarServidor(acao, dados) {
        const token = getToken();
        if (!token) return { ok: false, mensagem: "Faça login para continuar." };

        try {
            const body = {};
            if (acao.startsWith("nome/")) body.nome = dados.novoNome;
            if (acao.startsWith("telefone/")) body.telefone = dados.novoTelefone;

            const resp = await fetch("/api/usuarios/perfil", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(body)
            });

            const resJson = await resp.json();
            return { ok: resp.ok, mensagem: resJson.mensagem };
        } catch (e) {
            return { ok: false, mensagem: e.message };
        }
    }

    async function carregarPerfil() {
        const token = getToken();
        if (!token) {
            window.location.href = "login.html";
            return;
        }

        try {
            const resp = await fetch("/api/usuarios/perfil", {
                headers: { "Authorization": "Bearer " + token }
            });

            if (!resp.ok) {
                if (resp.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "login.html";
                }
                return;
            }

            const usuario = await resp.json();

            if (el("nomeuser")) el("nomeuser").textContent = usuario.nome.toUpperCase();
            if (el("emailuser")) el("emailuser").textContent = usuario.email;
            if (el("qtdpoints")) el("qtdpoints").textContent = usuario.pontos || 0;

            if (el("nomeperfil")) el("nomeperfil").textContent = usuario.nome;
            if (el("cpfperfil")) el("cpfperfil").textContent = usuario.cpf;
            if (el("emailperfil")) el("emailperfil").textContent = usuario.email;
            if (el("telefoneperfil")) el("telefoneperfil").textContent = usuario.telefone;

            const tipo = usuario.tipo || 'cliente';
            let badge = document.getElementById("badge-tipo-usuario");
            if (!badge && el("infoperfil")) {
                badge = document.createElement("span");
                badge.id = "badge-tipo-usuario";
                badge.className = `dbx-nivel dbx-nivel-${tipo}`;
                badge.style.marginLeft = "10px";
                badge.style.fontSize = "11px";
                badge.style.verticalAlign = "middle";
                if (el("nomeuser")) el("nomeuser").appendChild(badge);
            }
            if (badge) {
                badge.textContent = tipo.toUpperCase();
                badge.className = `dbx-nivel dbx-nivel-${tipo}`;
            }

        } catch (e) {
            console.error("Erro ao carregar perfil:", e);
        }
    }
    carregarPerfil();

    function mostrarErro(msg) {
        erro.textContent = msg;
        erro.hidden = false;
    }

    function limparErro() {
        erro.textContent = "";
        erro.hidden = true;
    }

    function renderCampos(campos) {
        area.replaceChildren();
        campos.forEach((c) => {
            const grupo = document.createElement("div");
            grupo.className = "infoperfil";

            const label = document.createElement("label");
            label.htmlFor = c.id;
            label.textContent = c.label.toUpperCase();

            const input = document.createElement("input");
            input.id = c.id;
            input.name = c.id;
            input.type = c.type;
            input.className = "inputlocalconfig";
            if (c.placeholder) input.placeholder = c.placeholder;
            if (c.maxlength) input.maxLength = c.maxlength;
            if (c.accept) input.accept = c.accept;
            if (c.inputmode) input.inputMode = c.inputmode;
            if (c.autocomplete) input.autocomplete = c.autocomplete;
            if (c.atual) input.value = c.atual();

            grupo.append(label, input);
            area.append(grupo);
        });

        const primeiro = area.querySelector("input");
        if (primeiro) primeiro.focus();
    }

    function abrir(campo) {
        const cfg = CONFIG[campo];
        if (!cfg) return;

        campoAtual = campo;
        etapa = 1;
        dadosEtapa1 = {};
        titulo.textContent = cfg.titulo;
        texto.textContent = cfg.texto;
        btnEnviar.textContent = cfg.botao;
        limparErro();
        renderCampos(cfg.campos);
        modal.showModal();
    }

    document.querySelectorAll(".editarperfil[data-campo]").forEach((botao) => {
        botao.addEventListener("click", () => abrir(botao.dataset.campo));
    });

    if (el("fecharmodalperfil")) el("fecharmodalperfil").addEventListener("click", () => modal.close());
    if (el("cancelarperfil")) el("cancelarperfil").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });

    area.addEventListener("input", (evento) => {
        const campo = evento.target;
        if (campo.id === "novoTelefone") {
            const d = soNumeros(campo.value).slice(0, 13);
            let f = "";
            if (d.length > 0) f = "+" + d.slice(0, 2);
            if (d.length > 2) f += " (" + d.slice(2, 4);
            if (d.length > 4) f += ") " + d.slice(4, 9);
            if (d.length > 9) f += "-" + d.slice(9, 13);
            campo.value = f;
        }
    });

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        limparErro();

        const cfg = CONFIG[campoAtual];
        const valores = Object.fromEntries(new FormData(form));

        try {
            const msg = cfg.validar(valores);
            if (msg) return mostrarErro(msg);

            dadosEtapa1 = valores;
            btnEnviar.disabled = true;

            const r = await chamarServidor(campoAtual + "/salvar", valores);
            if (!r.ok) return mostrarErro(r.mensagem || "Não foi possível salvar.");

            if (cfg.aplicar) cfg.aplicar(dadosEtapa1);
            else if (el(cfg.alvo)) el(cfg.alvo).textContent = cfg.exibir(dadosEtapa1);

            if (campoAtual === 'nome' && el("nomeuser")) {
                el("nomeuser").textContent = cfg.exibir(dadosEtapa1).toUpperCase();
            }

            modal.close();
        } catch (err) {
            mostrarErro("Erro de conexão. Tente novamente.");
        } finally {
            btnEnviar.disabled = false;
        }
    });

    modal.addEventListener("close", () => {
        area.replaceChildren();
        dadosEtapa1 = {};
        campoAtual = null;
        etapa = 1;
        limparErro();
    });
})();