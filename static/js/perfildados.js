// PÁGINA DE PERFIL - Modal de edição das informações pessoais
// (nome, data de nascimento, e-mail e telefone)

(() => {
    const modal      = document.getElementById("modalperfil");
    const form       = document.getElementById("formperfil");
    const titulo     = document.getElementById("tituloperfilmodal");
    const texto      = document.getElementById("textoperfilmodal");
    const area       = document.getElementById("camposperfil");
    const erro       = document.getElementById("erromodalperfil");
    const btnEnviar  = document.getElementById("btnenviarperfil");

    let campoAtual = null;   // "nome", "data", "email" ou "telefone"
    let etapa = 1;           // 1 = formulário, 2 = código de verificação
    let dadosEtapa1 = {};
    let urlFotoAtual = null; // endereço temporário da foto escolhida

    const soNumeros = (v) => v.replace(/\D/g, "");
    const el = (id) => document.getElementById(id);

    /* ---------- O que muda em cada edição ---------- */
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
                atual: () => el("nomeperfil").textContent.trim()
            }],
            validar(v) {
                const n = v.novoNome.replace(/\s+/g, " ").trim();
                if (!n) return "Informe seu nome completo.";
                if (n.length < 3 || n.length > 60) return "O nome deve ter entre 3 e 60 caracteres.";
                if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(n)) return "Use apenas letras, espaços, apóstrofo ou hífen.";
                if (n.split(" ").length < 2) return "Informe nome e sobrenome.";
                return "";
            },
            exibir: (v) => v.novoNome.replace(/\s+/g, " ").trim()
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
            // Em vez de trocar um texto, troca a imagem mostrada na página
            aplicar(v) {
                if (urlFotoAtual) URL.revokeObjectURL(urlFotoAtual);
                urlFotoAtual = URL.createObjectURL(v.novaFoto);
                el("fotoperfil").src = urlFotoAtual;
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
                // exibida como 05.08.2008 -> o input date precisa de 2008-08-05
                atual: () => el("dataperfil").textContent.trim().split(".").reverse().join("-")
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
            exibir: (v) => v.novaData.split("-").reverse().join(".")
        },

        email: {
            titulo: "ALTERAR E-MAIL",
            texto: "Informe o novo endereço de e-mail que deseja utilizar.",
            botao: "ENVIAR CÓDIGO DE VERIFICAÇÃO",
            verificacao: true,
            textoCodigo: "Enviamos um código de 6 dígitos para o novo e-mail. Insira-o abaixo.",
            alvo: "emailperfil",
            campos: [
                { id: "novoEmail",      label: "Novo e-mail",       type: "email",    placeholder: "Digite seu novo e-mail", autocomplete: "email" },
                { id: "confirmarEmail", label: "Confirmar e-mail",  type: "email",    placeholder: "Repita seu novo e-mail" },
                { id: "senhaAtual",     label: "Senha atual",       type: "password", placeholder: "Confirme sua senha atual", autocomplete: "current-password" }
            ],
            validar(v) {
                const novo = v.novoEmail.trim().toLowerCase();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novo)) return "Informe um e-mail válido.";
                if (novo !== v.confirmarEmail.trim().toLowerCase()) return "Os e-mails não coincidem.";
                if (novo === el("emailperfil").textContent.trim().toLowerCase()) return "Esse já é o seu e-mail atual.";
                if (!v.senhaAtual) return "Informe sua senha atual.";
                return "";
            },
            exibir: (v) => v.novoEmail.trim().toLowerCase()
        },

        telefone: {
            titulo: "ALTERAR TELEFONE",
            texto: "Informe seu novo número de telefone.",
            botao: "ENVIAR CÓDIGO POR SMS",
            verificacao: true,   // coloque false para a opção A (sem código)
            textoCodigo: "Enviamos um código de 6 dígitos por SMS para o novo número.",
            alvo: "telefoneperfil",
            campos: [{
                id: "novoTelefone", label: "Novo telefone", type: "tel",
                placeholder: "+XX (XX) XXXXX-XXXX", maxlength: 19, inputmode: "numeric",
                atual: () => el("telefoneperfil").textContent.trim()
            }],
            validar(v) {
                return soNumeros(v.novoTelefone).length === 13
                    ? "" : "Informe o telefone no formato +XX (XX) XXXXX-XXXX.";
            },
            exibir: (v) => v.novoTelefone
        }
    };

    // A opção A do telefone não precisa de código: o botão vira "SALVAR"
    if (!CONFIG.telefone.verificacao) CONFIG.telefone.botao = "SALVAR ALTERAÇÃO";

    /* ---------- Back-end (Ana) ---------- */
    async function chamarServidor(acao, dados) {
        // TODO (Ana): trocar por fetch real. Exemplos de ação:
        //   "nome/salvar", "data/salvar",
        //   "email/solicitar-codigo", "email/salvar" (com o código),
        //   "telefone/solicitar-codigo", "telefone/salvar"
        // O servidor DEVE validar tudo de novo (nunca confie só no JavaScript),
        // conferir a senha atual, gerar/validar o código com prazo e limite de tentativas.
        console.log("Enviar ao servidor:", acao, dados);
        return { ok: true };
    }

    /* ---------- Montagem do modal ---------- */
    function mostrarErro(msg) {
        erro.textContent = msg;
        erro.hidden = false;
    }

    function limparErro() {
        erro.textContent = "";
        erro.hidden = true;
    }

    function renderCampos(lista) {
        area.replaceChildren();

        lista.forEach((c) => {
            const label = document.createElement("label");
            label.htmlFor = c.id;
            label.textContent = c.label;

            const input = document.createElement("input");
            input.id = c.id;
            input.name = c.id;
            input.type = c.type;
            input.placeholder = c.placeholder || "";
            if (c.maxlength)     input.maxLength = c.maxlength;
            if (c.autocomplete)  input.autocomplete = c.autocomplete;
            if (c.inputmode)     input.inputMode = c.inputmode;
            if (c.accept)        input.accept = c.accept;
            if (c.atual)         input.value = c.atual();

            if (c.type === "date") {
                input.min = "1900-01-01";
                input.max = new Date().toLocaleDateString("sv-SE"); // hoje, AAAA-MM-DD
            }

            area.append(label, input);
        });

        area.querySelector("input").focus();
    }

    function abrir(campo) {
        const cfg = CONFIG[campo];
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

    function irParaEtapaCodigo(cfg) {
        etapa = 2;
        titulo.textContent = "CÓDIGO DE VERIFICAÇÃO";
        texto.textContent = cfg.textoCodigo;
        btnEnviar.textContent = "CONFIRMAR CÓDIGO";
        limparErro();
        renderCampos([{
            id: "codigo", label: "Código", type: "text",
            placeholder: "000000", maxlength: 6, inputmode: "numeric", autocomplete: "one-time-code"
        }]);
    }

    /* ---------- Eventos ---------- */
    document.querySelectorAll(".editarperfil[data-campo]").forEach((botao) => {
        botao.addEventListener("click", () => abrir(botao.dataset.campo));
    });

    document.getElementById("fecharmodalperfil").addEventListener("click", () => modal.close());
    document.getElementById("cancelarperfil").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });

    // Máscaras (telefone e código só com números)
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

        if (campo.id === "codigo") {
            campo.value = soNumeros(campo.value).slice(0, 6);
        }
    });

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        limparErro();

        const cfg = CONFIG[campoAtual];
        const valores = Object.fromEntries(new FormData(form));

        try {
            if (etapa === 1) {
                const msg = cfg.validar(valores);
                if (msg) return mostrarErro(msg);

                dadosEtapa1 = valores;
                btnEnviar.disabled = true;

                if (cfg.verificacao) {
                    const r = await chamarServidor(campoAtual + "/solicitar-codigo", valores);
                    if (!r.ok) return mostrarErro(r.mensagem || "Não foi possível enviar o código.");
                    irParaEtapaCodigo(cfg);
                    return;
                }

                const r = await chamarServidor(campoAtual + "/salvar", valores);
                if (!r.ok) return mostrarErro(r.mensagem || "Não foi possível salvar.");
            } else {
                if (!/^\d{6}$/.test(valores.codigo || "")) return mostrarErro("O código tem 6 dígitos.");

                btnEnviar.disabled = true;
                const r = await chamarServidor(campoAtual + "/salvar", { ...dadosEtapa1, codigo: valores.codigo });
                if (!r.ok) return mostrarErro(r.mensagem || "Código inválido ou expirado.");
            }

            // Sucesso: atualiza o valor mostrado na página
            if (cfg.aplicar) cfg.aplicar(dadosEtapa1);
            else el(cfg.alvo).textContent = cfg.exibir(dadosEtapa1);
            modal.close();
        } catch (err) {
            mostrarErro("Erro de conexão. Tente novamente.");
        } finally {
            btnEnviar.disabled = false;
        }
    });

    // Limpa tudo ao fechar (inclusive senha digitada)
    modal.addEventListener("close", () => {
        area.replaceChildren();
        dadosEtapa1 = {};
        campoAtual = null;
        etapa = 1;
        limparErro();
    });
})();
