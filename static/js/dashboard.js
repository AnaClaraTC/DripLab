// DASHBOARD - Drops, Contas e Usuários (tudo dentro de uma função: não afeta outras páginas)

(() => {
    const el = (id) => document.getElementById(id);
    const $$ = (sel, base = document) => [...base.querySelectorAll(sel)];

    // Tamanhos exigidos para as imagens (px)
    const TAM_IMAGEM = { w: 1448, h: 1086 };   // Drop atual (Polarização)
    const TAM_BANNER = { w: 1696, h: 624 };    // Banner (Contramão)

    const TIPOS = ["Camisa", "Camiseta", "Casaco", "Calça", "Bermuda", "Bolsa", "Acessório", "Meia", "Jaqueta"];
    const TAMANHOS = ["P", "PP", "M", "G", "GG", "XGG"];
    const FORMATOS = ["image/png", "image/jpeg", "image/webp"];
    const soNumeros = (v) => v.replace(/\D/g, "");
    const moeda = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const dataBR = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

    /* ---------- Back-end (Ana) ---------- */
    async function chamarServidor(acao, dados) {
        // TODO (Ana): trocar por fetch real. Ações:
        //   "drop/criar" e "drop/editar" (FormData com imagens e produtos),
        //   "drop/excluir", "conta/adicionar", "conta/excluir"
        // O SERVIDOR deve conferir: tamanho/tipo das imagens, CPF, e se quem pede
        // (sessão) é Gerente e se a senha informada está correta. O JS não é segurança.
        // A data do drop é um timestamp gerado no banco.
        // Em "drop/editar": se "imagem" ou "banner" vierem vazios, manter a imagem atual.
        console.log("Enviar ao servidor:", acao, dados);
        return { ok: true, id: "novo-" + Date.now() };
    }

    /* ---------- Dados de exemplo (a Ana troca pelo banco) ---------- */
    const IMG = "../static/images/loja/jaqueta-corta-vento-storm.png";
    let drops = [{
        id: 1, nome: "POLARIZAÇÃO", slogan: "Dois lados, uma rua.", descricao: "Drop de inverno.",
        imagem: IMG, banner: IMG, criado: "2026-10-01T10:00:00",
        produtos: TIPOS.map((tipo, i) => ({ id: "p" + i, tipo, nome: tipo.toUpperCase() + " EXEMPLO",
            descricao: "Descrição de exemplo.", tamanhos: ["P", "M", "G"], preco: 49.99, imagem: IMG }))
    }];
    let contas = [{ cpf: "000.000.000-00", nome: "Gabriel Marques", email: "gabriel@driplab.com", nivel: "Gerente" }];
    const usuarios = [{ id: 1, nome: "Gabriel Marques de Oliveira", email: "gabrielmarquesdeoliveira@gmail.com",
        cpf: "000.000.000-00", telefone: "+55 (21) 99999-9999", nascimento: "05.08.2008", points: 15, pedidos: 1,
        foto: "../static/images/icones_menu/usuario.png" }];

    /* ---------- Utilidades ---------- */
    function t(tag, classe, texto) {
        const n = document.createElement(tag);
        if (classe) n.className = classe;
        if (texto !== undefined) n.textContent = texto;
        return n;
    }
    function erro(base, msg) {
        const p = base.querySelector(".dbx-erro");
        p.textContent = msg; p.hidden = !msg;
        return !!msg;
    }
    function lerImagem(arquivo) {
        return new Promise((ok, falha) => {
            const url = URL.createObjectURL(arquivo), img = new Image();
            img.onload = () => { URL.revokeObjectURL(url); ok({ w: img.naturalWidth, h: img.naturalHeight }); };
            img.onerror = () => { URL.revokeObjectURL(url); falha(); };
            img.src = url;
        });
    }
    // obrigatoria = true (criação): exige o arquivo. obrigatoria = false (edição): só valida se enviou um.
    async function validarImagem(input, tam, nome, obrigatoria = true) {
        const f = input.files[0];
        if (!f) return obrigatoria ? `Envie ${nome}.` : "";
        if (!FORMATOS.includes(f.type)) return `${nome}: use PNG, JPG ou WEBP.`;
        try {
            const { w, h } = await lerImagem(f);
            if (w !== tam.w || h !== tam.h) return `${nome} deve ter ${tam.w} × ${tam.h} px (a enviada tem ${w} × ${h}).`;
        } catch { return `${nome}: não foi possível ler a imagem.`; }
        return "";
    }
    // Atualiza a prévia (img) quando um novo arquivo é escolhido no input
    function previa(input, img) {
        input.addEventListener("change", () => {
            const f = input.files[0];
            if (f) img.src = URL.createObjectURL(f);
        });
    }

    /* ---------- Troca de páginas e pesquisa ---------- */
    function filtrar() {
        const termo = el("dbx-pesquisa").value.trim().toLowerCase();
        const pagina = $$(".dbx-pagina").find((p) => !p.hidden);
        let visiveis = 0;
        $$("[data-busca]", pagina).forEach((i) => {
            const mostra = i.dataset.busca.includes(termo);
            i.hidden = !mostra;
            if (mostra) visiveis++;
        });
        const aviso = pagina.querySelector(".dbx-vazio");
        if (aviso) aviso.hidden = visiveis > 0;
    }
    $$(".dbx-opc[data-pagina]").forEach((b) => b.addEventListener("click", () => {
        $$(".dbx-pagina").forEach((p) => (p.hidden = true));
        $$(".dbx-opc").forEach((o) => o.classList.remove("dbx-ativo"));
        el(b.dataset.pagina).hidden = false;
        b.classList.add("dbx-ativo");
        el("dbx-pesquisa").value = "";
        filtrar();
    }));
    el("dbx-pesquisa").addEventListener("input", filtrar);

    /* =============== EDITOR DE PRODUTOS (usado na criação e na edição) =============== */
    function criarBloco(tipo, p) {
        const b = t("div", "dbx-bloco");
        b.dataset.tipo = tipo;
        if (p) { b.dataset.id = p.id || ""; b.dataset.imagem = p.imagem || ""; }
        const x = t("button", "dbx-x", "\u00D7"); x.type = "button"; x.setAttribute("aria-label", "Remover " + tipo);
        b.append(t("h4", "", tipo), x);

        [["nome", "Nome do produto", "text"], ["descricao", "Descrição", "text"], ["preco", "Preço (R$)", "number"]].forEach(([n, ph, tp]) => {
            const i = t("input", "dbx-campo"); i.type = tp; i.dataset.campo = n; i.placeholder = ph;
            if (tp === "number") { i.min = "0"; i.step = "0.01"; }
            if (p) i.value = p[n];
            b.append(i);
        });

        const tam = t("div", "dbx-tamanhos");
        TAMANHOS.forEach((s) => {
            const l = t("label"), c = document.createElement("input");
            c.type = "checkbox"; c.value = s; c.dataset.campo = "tamanho";
            c.checked = !!p && p.tamanhos.includes(s);
            l.append(c, s); tam.append(l);
        });

        const foto = t("input", "dbx-arquivo"); foto.type = "file"; foto.accept = FORMATOS.join(","); foto.dataset.campo = "foto";
        b.append(tam, foto);
        if (p) b.append(t("span", "dbx-dica", "Sem enviar outra foto, a atual é mantida."));
        return b;
    }

    function iniciarEditor(botoes, blocos) {
        TIPOS.forEach((tipo) => {
            const b = t("button", "dbx-btn dbx-roxo dbx-mini", "+ " + tipo.toUpperCase());
            b.type = "button"; b.dataset.tipo = tipo; botoes.append(b);
        });
        botoes.addEventListener("click", (e) => {
            const b = e.target.closest("[data-tipo]");
            if (b) blocos.append(criarBloco(b.dataset.tipo));
        });
        blocos.addEventListener("click", (e) => {
            if (e.target.closest(".dbx-x")) e.target.closest(".dbx-bloco").remove();
        });
    }

    // Valida os blocos e coloca os produtos no FormData. Devolve { erro } ou { produtos }
    function lerBlocos(blocos, fd) {
        const lista = $$(".dbx-bloco", blocos);
        const faltam = TIPOS.filter((tp) => !lista.some((b) => b.dataset.tipo === tp));
        if (faltam.length) return { erro: "Faltam produtos dos tipos: " + faltam.join(", ") + "." };

        const produtos = [];
        for (const [i, b] of lista.entries()) {
            const g = (n) => b.querySelector(`[data-campo=${n}]`);
            const tams = $$("[data-campo=tamanho]:checked", b).map((c) => c.value);
            const foto = g("foto").files[0], antiga = b.dataset.imagem || "";
            const rotulo = `Complete o produto ${i + 1} (${b.dataset.tipo})`;
            if (!g("nome").value.trim() || !g("descricao").value.trim() || !(Number(g("preco").value) > 0) || !tams.length || (!foto && !antiga))
                return { erro: rotulo + ": nome, descrição, preço, tamanho e foto." };
            if (foto && !FORMATOS.includes(foto.type)) return { erro: rotulo + ": foto em PNG, JPG ou WEBP." };

            const p = { id: b.dataset.id || "", tipo: b.dataset.tipo, nome: g("nome").value.trim(),
                descricao: g("descricao").value.trim(), preco: g("preco").value, tamanhos: tams,
                imagem: foto ? URL.createObjectURL(foto) : antiga };
            ["id", "tipo", "nome", "descricao", "preco"].forEach((k) => fd.append(`produtos[${i}][${k}]`, p[k]));
            fd.append(`produtos[${i}][tamanhos]`, tams.join(","));
            if (foto) fd.append(`produtos[${i}][foto]`, foto);
            produtos.push(p);
        }
        return { produtos };
    }

    iniciarEditor(el("dbx-botoes-tipos"), el("dbx-blocos"));
    iniciarEditor(el("dbx-ed-botoes"), el("dbx-ed-blocos"));

    // Prévias das imagens no modal de edição
    previa(el("dbx-ed-img"), el("dbx-ed-img-previa"));
    previa(el("dbx-ed-banner"), el("dbx-ed-banner-previa"));

    /* =============== DROPS =============== */
    let dropAtual = null;

    function cardDrop(d) {
        const c = t("button", "dbx-card"); c.type = "button";
        c.dataset.busca = (d.nome + " " + d.slogan).toLowerCase(); c.dataset.id = d.id;
        const caixa = t("div", "dbx-card-img"), img = document.createElement("img");
        img.src = d.imagem; img.alt = d.nome; caixa.append(img);
        const info = t("div", "dbx-card-info");
        info.append(t("h3", "", d.nome), t("p", "", d.slogan), t("p", "", "Criado em " + dataBR(d.criado)));
        c.append(caixa, info);
        return c;
    }
    function renderDrops() { el("dbx-grade-drops").replaceChildren(...drops.map(cardDrop)); filtrar(); }

    function produtoModal(p) {
        const box = t("div", "dbx-prod"), im = t("div", "dbx-prod-img"), img = document.createElement("img");
        img.src = p.imagem; img.alt = p.nome; im.append(img);
        const info = t("div", "dbx-prod-info");
        info.append(t("strong", "", p.nome), t("span", "", p.descricao), t("span", "", "Tipo: " + p.tipo),
            t("span", "", "Tamanhos: " + p.tamanhos.join(", ")), t("span", "", moeda(p.preco)));
        box.append(im, info);
        return box;
    }
    function mostrar(qual) {
        el("dbx-visao").hidden = qual !== "visao";
        el("dbx-form-edicao").hidden = qual !== "edicao";
        el("dbx-confirma").hidden = qual !== "confirma";
    }

    el("dbx-grade-drops").addEventListener("click", (e) => {
        const c = e.target.closest(".dbx-card"); if (!c) return;
        dropAtual = drops.find((d) => String(d.id) === c.dataset.id);
        el("dbx-md-nome").textContent = dropAtual.nome;
        el("dbx-md-slogan").textContent = dropAtual.slogan;
        el("dbx-md-desc").textContent = dropAtual.descricao;
        el("dbx-md-produtos").replaceChildren(...dropAtual.produtos.map(produtoModal));
        mostrar("visao");
        el("dbx-modal-drop").showModal();
    });

    el("dbx-btn-editar").addEventListener("click", () => {
        el("dbx-ed-nome").value = dropAtual.nome;
        el("dbx-ed-slogan").value = dropAtual.slogan;
        el("dbx-ed-desc").value = dropAtual.descricao;

        // Imagens atuais como prévia (os inputs de arquivo começam vazios)
        el("dbx-ed-img-previa").src = dropAtual.imagem;
        el("dbx-ed-banner-previa").src = dropAtual.banner || dropAtual.imagem;
        el("dbx-ed-img").value = "";
        el("dbx-ed-banner").value = "";

        el("dbx-ed-blocos").replaceChildren(...dropAtual.produtos.map((p) => criarBloco(p.tipo, p)));
        erro(el("dbx-form-edicao"), "");
        mostrar("edicao");
    });
    el("dbx-btn-cancelar-edicao").addEventListener("click", () => mostrar("visao"));

    el("dbx-form-edicao").addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = e.target, v = Object.fromEntries(new FormData(f));
        if (!v.nome.trim() || !v.slogan.trim() || !v.descricao.trim()) return erro(f, "Preencha nome, slogan e descrição.");

        // Imagens: só valida se o gerente enviou uma nova
        let m = await validarImagem(el("dbx-ed-img"), TAM_IMAGEM, "A imagem do drop atual", false);
        if (!m) m = await validarImagem(el("dbx-ed-banner"), TAM_BANNER, "O banner de anúncio", false);
        if (m) return erro(f, m);

        const dados = new FormData(f);   // já inclui "imagem" e "banner" (vazios se não trocou)
        dados.append("id", dropAtual.id);
        const r = lerBlocos(el("dbx-ed-blocos"), dados);
        if (r.erro) return erro(f, r.erro);
        erro(f, "");

        try {
            const s = await chamarServidor("drop/editar", dados);
            if (!s.ok) return erro(f, s.mensagem || "Não foi possível salvar.");

            const novaImg = el("dbx-ed-img").files[0], novoBanner = el("dbx-ed-banner").files[0];
            Object.assign(dropAtual, {
                nome: v.nome.trim(), slogan: v.slogan.trim(), descricao: v.descricao.trim(),
                produtos: r.produtos,
                imagem: novaImg ? URL.createObjectURL(novaImg) : dropAtual.imagem,
                banner: novoBanner ? URL.createObjectURL(novoBanner) : dropAtual.banner
            });
            renderDrops();
            el("dbx-modal-drop").close();
        } catch { erro(f, "Erro de conexão. Tente novamente."); }
    });

    el("dbx-btn-deletar").addEventListener("click", () => mostrar("confirma"));
    el("dbx-btn-cancelar-excluir").addEventListener("click", () => mostrar("visao"));
    el("dbx-btn-confirmar-excluir").addEventListener("click", async () => {
        const box = el("dbx-confirma");
        try {
            const r = await chamarServidor("drop/excluir", { id: dropAtual.id });
            if (!r.ok) return erro(box, r.mensagem || "Não foi possível excluir.");
            drops = drops.filter((d) => d.id !== dropAtual.id);
            renderDrops();
            el("dbx-modal-drop").close();
        } catch { erro(box, "Erro de conexão. Tente novamente."); }
    });

    // Criar drop
    el("dbx-form-drop").addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = e.target, btn = el("dbx-btn-criar-drop");
        const v = Object.fromEntries(new FormData(f));
        erro(f, "");
        if (!v.nome.trim() || !v.slogan.trim() || !v.descricao.trim()) return erro(f, "Preencha nome, slogan e descrição.");

        btn.disabled = true;
        try {
            let m = await validarImagem(el("dbx-drop-img"), TAM_IMAGEM, "A imagem do drop atual");
            if (!m) m = await validarImagem(el("dbx-drop-banner"), TAM_BANNER, "O banner de anúncio");
            if (m) return erro(f, m);

            const dados = new FormData(f);
            const r = lerBlocos(el("dbx-blocos"), dados);
            if (r.erro) return erro(f, r.erro);

            const s = await chamarServidor("drop/criar", dados);
            if (!s.ok) return erro(f, s.mensagem || "Não foi possível criar o drop.");

            // Provisório: mostra na lista (a Ana troca por recarregar do banco)
            drops.push({ id: s.id, nome: v.nome.trim(), slogan: v.slogan.trim(), descricao: v.descricao.trim(),
                imagem: URL.createObjectURL(el("dbx-drop-img").files[0]),
                banner: URL.createObjectURL(el("dbx-drop-banner").files[0]),
                criado: new Date().toISOString(), produtos: r.produtos });
            renderDrops();
            f.reset();
            el("dbx-blocos").replaceChildren();
        } catch { erro(f, "Erro de conexão. Tente novamente."); }
        finally { btn.disabled = false; }
    });

    /* =============== CONTAS =============== */
    function renderContas() {
        el("dbx-lista-contas").replaceChildren(...contas.map((c) => {
            const l = t("div", "dbx-conta");
            l.dataset.busca = (c.nome + " " + c.email + " " + c.cpf + " " + c.nivel).toLowerCase();
            const a = t("div"); a.append(t("strong", "", c.nome), document.createElement("br"), t("span", "", c.email));
            l.append(a, t("span", "", "CPF " + c.cpf), t("span", "dbx-nivel dbx-nivel-" + c.nivel.toLowerCase(), c.nivel));
            return l;
        }));
        filtrar();
    }
    function cpfValido(cpf) {
        const n = soNumeros(cpf);
        if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
        const dv = (len) => { let s = 0; for (let i = 0; i < len; i++) s += n[i] * (len + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
        return dv(9) === +n[9] && dv(10) === +n[10];
    }
    document.addEventListener("input", (e) => {
        if (!e.target.classList.contains("dbx-cpf")) return;
        const d = soNumeros(e.target.value).slice(0, 11);
        e.target.value = d.replace(/(\d{3})(?=\d)/, "$1.").replace(/(\d{3})\.(\d{3})(?=\d)/, "$1.$2.").replace(/(\d{3})\.(\d{3})\.(\d{3})(?=\d)/, "$1.$2.$3-");
    });
    $$("#dbx-modo [data-modo]").forEach((b) => b.addEventListener("click", () => {
        el("dbx-form-add").hidden = b.dataset.modo !== "adicionar";
        el("dbx-form-del").hidden = b.dataset.modo !== "deletar";
    }));

    el("dbx-form-add").addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = e.target, v = Object.fromEntries(new FormData(f));
        if (v.nome.trim().split(/\s+/).length < 2) return erro(f, "Informe nome e sobrenome.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) return erro(f, "Informe um e-mail válido.");
        if (!cpfValido(v.cpf)) return erro(f, "CPF inválido.");
        if (v.senha.length < 8) return erro(f, "A senha deve ter pelo menos 8 caracteres.");
        if (!v.senhagerente) return erro(f, "Informe a sua senha de gerente.");
        erro(f, "");
        try {
            const r = await chamarServidor("conta/adicionar", v);
            if (!r.ok) return erro(f, r.mensagem || "Não foi possível adicionar.");
            contas.push({ nome: v.nome.trim(), email: v.email.trim().toLowerCase(), cpf: v.cpf, nivel: v.nivel });
            renderContas(); f.reset();
        } catch { erro(f, "Erro de conexão. Tente novamente."); }
    });
    el("dbx-form-del").addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = e.target, v = Object.fromEntries(new FormData(f));
        if (!cpfValido(v.cpf)) return erro(f, "CPF inválido.");
        if (!v.senhagerente) return erro(f, "Informe a sua senha de gerente.");
        erro(f, "");
        try {
            const r = await chamarServidor("conta/excluir", v);
            if (!r.ok) return erro(f, r.mensagem || "Não foi possível deletar.");
            contas = contas.filter((c) => c.cpf !== v.cpf);
            renderContas(); f.reset();
        } catch { erro(f, "Erro de conexão. Tente novamente."); }
    });

    /* =============== USUÁRIOS =============== */
    function renderUsuarios() {
        el("dbx-grade-usuarios").replaceChildren(...usuarios.map((u) => {
            const c = t("button", "dbx-card"); c.type = "button"; c.dataset.id = u.id;
            c.dataset.busca = (u.nome + " " + u.email + " " + u.cpf).toLowerCase();
            const caixa = t("div", "dbx-card-img"), img = t("img", "dbx-foto");
            img.src = u.foto; img.alt = u.nome; caixa.append(img);
            const info = t("div", "dbx-card-info"); info.append(t("h3", "", u.nome), t("p", "", u.email));
            c.append(caixa, info);
            return c;
        }));
        filtrar();
    }
    el("dbx-grade-usuarios").addEventListener("click", (e) => {
        const c = e.target.closest(".dbx-card"); if (!c) return;
        const u = usuarios.find((x) => String(x.id) === c.dataset.id);
        const dados = t("div", "dbx-dados");
        [["E-mail", u.email], ["CPF", u.cpf], ["Telefone", u.telefone], ["Nascimento", u.nascimento],
         ["Drip Points", u.points], ["Pedidos", u.pedidos]].forEach(([k, val]) => {
            const l = t("div"); l.append(t("strong", "", k), t("span", "", String(val))); dados.append(l);
        });
        el("dbx-mu-conteudo").replaceChildren(t("h2", "dbx-titulo", u.nome), dados);
        el("dbx-modal-usuario").showModal();
    });

    /* ---------- Fechar modais ---------- */
    $$(".dbx-modal").forEach((d) => {
        $$(".dbx-fechar", d).forEach((b) => b.addEventListener("click", () => d.close()));
        d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    });

    renderDrops(); renderContas(); renderUsuarios();
})();