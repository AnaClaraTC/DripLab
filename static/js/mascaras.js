(() => {
    const somenteDigitos = (valor, limite) => String(valor || '').replace(/\D/g, '').slice(0, limite);

    const formatadores = {
        cpf(valor) {
            const digitos = somenteDigitos(valor, 11);
            let formatado = digitos.slice(0, 3);
            if (digitos.length > 3) formatado += `.${digitos.slice(3, 6)}`;
            if (digitos.length > 6) formatado += `.${digitos.slice(6, 9)}`;
            if (digitos.length > 9) formatado += `-${digitos.slice(9, 11)}`;
            return formatado;
        },
        telefone(valor) {
            let digitos = somenteDigitos(valor, 13);
            if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) {
                digitos = digitos.slice(2);
            }
            digitos = digitos.slice(0, 11);
            if (digitos.length <= 2) return digitos ? `(${digitos}` : '';

            const tamanhoPrefixo = digitos.length > 10 ? 5 : 4;
            let formatado = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 2 + tamanhoPrefixo)}`;
            if (digitos.length > 2 + tamanhoPrefixo) {
                formatado += `-${digitos.slice(2 + tamanhoPrefixo)}`;
            }
            return formatado;
        },
        cep(valor) {
            const digitos = somenteDigitos(valor, 8);
            return digitos.length > 5
                ? `${digitos.slice(0, 5)}-${digitos.slice(5)}`
                : digitos;
        },
        uf(valor) {
            return String(valor || '').replace(/[^a-z]/gi, '').toUpperCase().slice(0, 2);
        }
    };

    window.DripMasks = formatadores;
    document.addEventListener('input', (evento) => {
        const campo = evento.target;
        const formatar = campo.dataset && formatadores[campo.dataset.mask];
        if (formatar) campo.value = formatar(campo.value);
    });
})();
