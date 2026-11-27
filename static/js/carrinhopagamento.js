(() => {
    const formCompra = document.getElementById("compra");
    const modal = document.getElementById("modalpagamento");
    const formCartao = document.getElementById("formcartao");
    const areaPix = document.getElementById("areapix");

    if (!formCompra || !modal) return;

    const getToken = () => localStorage.getItem('token') || localStorage.getItem('driplab_token');

    formCompra.addEventListener("submit", (evento) => {
        evento.preventDefault();

        // 1. Validacao de login obrigatoria
        const token = getToken();
        if (!token) {
            alert("Atenção: Faça login para prosseguir com o pagamento.");
            window.location.href = "login.html";
            return;
        }

        // 2. Validacao de itens no carrinho
        const checks = [...document.querySelectorAll(".checkproduto:checked")];
        if (checks.length === 0) {
            alert("Seu carrinho está vazio ou nenhum produto foi selecionado.");
            return;
        }

        // 3. Validacao de endereco selecionado
        const radioLocal = document.querySelector('input[name="local"]:checked');
        if (!radioLocal) {
            alert("Atenção: É obrigatório cadastrar ou selecionar um local de entrega antes de ir para o pagamento.");
            window.location.href = "perfil.html?origem=carrinho#pagconfig";
            return;
        }

        const metodo = formCompra.elements["pagamento"] ? formCompra.elements["pagamento"].value : "cartao";
        if (formCartao) formCartao.hidden = (metodo !== "cartao");
        if (areaPix) areaPix.hidden = (metodo !== "pix");

        const totalCompraEl = document.getElementById("totalcompra");
        const totalModalEl = document.getElementById("totalmodal");
        if (totalModalEl && totalCompraEl) {
            totalModalEl.textContent = totalCompraEl.textContent;
        }

        modal.showModal();
    });

    const btnFechar = document.getElementById("fecharmodal");
    if (btnFechar) btnFechar.addEventListener("click", () => modal.close());
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });

    const soNumeros = (valor) => valor.replace(/\D/g, "");

    const inputNumCartao = document.getElementById("numerocartao");
    if (inputNumCartao) {
        inputNumCartao.addEventListener("input", (evento) => {
            evento.target.value = soNumeros(evento.target.value)
                .slice(0, 16)
                .replace(/(\d{4})(?=\d)/g, "$1 ");
        });
    }

    const inputValCartao = document.getElementById("validadecartao");
    if (inputValCartao) {
        inputValCartao.addEventListener("input", (evento) => {
            const numeros = soNumeros(evento.target.value).slice(0, 4);
            evento.target.value = numeros.length > 2
                ? `${numeros.slice(0, 2)}/${numeros.slice(2)}`
                : numeros;
        });
    }

    const inputCvv = document.getElementById("cvvcartao");
    if (inputCvv) {
        inputCvv.addEventListener("input", (evento) => {
            evento.target.value = soNumeros(evento.target.value).slice(0, 4);
        });
    }

    async function finalizarPedido(metodo) {
        const token = getToken();
        if (!token) {
            alert("Sessão expirada. Faça login novamente.");
            window.location.href = "login.html";
            return;
        }

        const radioLocal = document.querySelector('input[name="local"]:checked');
        const id_endereco = radioLocal ? Number(radioLocal.value) : null;

        if (!id_endereco) {
            alert("Selecione um endereço de entrega.");
            return;
        }

        const valor_frete = window.valorFreteAtual || 0;

        try {
            const resp = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    id_endereco,
                    metodo_pagamento: metodo === 'pix' ? 'Pix' : 'Cartao',
                    valor_frete
                })
            });

            const dados = await resp.json();

            if (!resp.ok) {
                alert(dados.mensagem || 'Erro ao processar pedido.');
                return;
            }

            modal.close();
            alert(`Sucesso! Pedido #${dados.pedido.id_pedido} realizado com sucesso.`);
            window.location.href = 'perfil.html';
        } catch (e) {
            alert('Erro de conexão ao processar o pedido. Tente novamente.');
        }
    }

    if (formCartao) {
        formCartao.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            const btnPagar = formCartao.querySelector('button[type="submit"]');
            if (btnPagar) btnPagar.disabled = true;

            await finalizarPedido("cartao");

            if (btnPagar) btnPagar.disabled = false;
        });
    }

    const btnPix = document.getElementById("copiarpix");
    if (btnPix) {
        btnPix.addEventListener("click", async (evento) => {
            const botao = evento.currentTarget;
            const inputCodigo = document.getElementById("codigopix");
            if (inputCodigo) {
                await navigator.clipboard.writeText(inputCodigo.value);
            }
            botao.textContent = "CÓDIGO COPIADO! CONFIRMANDO...";
            setTimeout(async () => {
                await finalizarPedido("pix");
            }, 1000);
        });
    }
})();
