// PÁGINA DE COMPRA - Modal de pagamento (cartão e Pix)

(() => {
    const formCompra = document.getElementById("compra");
    const modal = document.getElementById("modalpagamento");
    const formCartao = document.getElementById("formcartao");
    const areaPix = document.getElementById("areapix");

    // Só chega aqui se todos os campos "required" da entrega estiverem preenchidos
    formCompra.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const metodo = formCompra.elements["pagamento"].value;
        formCartao.hidden = metodo !== "cartao";
        areaPix.hidden = metodo !== "pix";

        document.getElementById("totalmodal").textContent =
            document.getElementById("totalcompra").textContent;

        modal.showModal();
    });

    // Fechar: botão X ou clique fora da caixa (Esc já funciona sozinho)
    document.getElementById("fecharmodal").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });

    // Máscaras do cartão
    const soNumeros = (valor) => valor.replace(/\D/g, "");

    document.getElementById("numerocartao").addEventListener("input", (evento) => {
        evento.target.value = soNumeros(evento.target.value)
            .slice(0, 16)
            .replace(/(\d{4})(?=\d)/g, "$1 ");
    });

    document.getElementById("validadecartao").addEventListener("input", (evento) => {
        const numeros = soNumeros(evento.target.value).slice(0, 4);
        evento.target.value = numeros.length > 2
            ? `${numeros.slice(0, 2)}/${numeros.slice(2)}`
            : numeros;
    });

    document.getElementById("cvvcartao").addEventListener("input", (evento) => {
        evento.target.value = soNumeros(evento.target.value).slice(0, 4);
    });

    // Pagar com cartão
    formCartao.addEventListener("submit", (evento) => {
        evento.preventDefault();
        // TODO (Ana): aqui entra a chamada ao gateway de pagamento
        modal.close();
    });

    // Copiar código Pix
    document.getElementById("copiarpix").addEventListener("click", async (evento) => {
        const botao = evento.currentTarget;
        await navigator.clipboard.writeText(document.getElementById("codigopix").value);
        botao.textContent = "CÓDIGO COPIADO!";
        setTimeout(() => (botao.textContent = "COPIAR CÓDIGO"), 2000);
    });
})();
