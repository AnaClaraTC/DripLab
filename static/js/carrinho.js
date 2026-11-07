// PÁGINA DE COMPRA - Seleção dos itens do carrinho ("Selecionar todos")

(() => {
    const checkTodos = document.getElementById("checktodos");
    const checksProdutos = [...document.querySelectorAll(".checkproduto")];

    // Marca/desmarca o "Selecionar todos" conforme os itens escolhidos
    const atualizarCheckTodos = () => {
        const selecionados = checksProdutos.filter((check) => check.checked).length;
        checkTodos.checked = checksProdutos.length > 0 && selecionados === checksProdutos.length;
        checkTodos.indeterminate = selecionados > 0 && selecionados < checksProdutos.length;
    };

    checkTodos.addEventListener("change", () => {
        checksProdutos.forEach((check) => {
            check.checked = checkTodos.checked;
        });
        checkTodos.indeterminate = false;
    });

    checksProdutos.forEach((check) => {
        check.addEventListener("change", atualizarCheckTodos);
    });
})();
