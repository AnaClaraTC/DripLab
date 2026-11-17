const grade = document.getElementById('grade-destaques');
const paginacao = document.getElementById('paginacao-destaques');

const produtosPorPagina = 8;

if (grade && paginacao) {

    const produtos = Array.from(grade.querySelectorAll('.item'));
    const botoesPagina = Array.from(paginacao.querySelectorAll('[data-pagina]'));
    const botaoAvancar = paginacao.querySelector('[data-avancar]');

    const totalPaginas = botoesPagina.length;
    let paginaAtual = 1;

    function mostrarPagina(numeroPagina) {

        paginaAtual = numeroPagina;

        const inicio = (paginaAtual - 1) * produtosPorPagina;
        const fim = inicio + produtosPorPagina;

        produtos.forEach((produto, indice) => {
            produto.style.display = (indice >= inicio && indice < fim) ? 'block' : 'none';
        });

        atualizarBotoes();
    }

    function atualizarBotoes() {
        botoesPagina.forEach((botao) => {
            const ehAtual = Number(botao.dataset.pagina) === paginaAtual;
            botao.classList.toggle('ativo', ehAtual);
        });
    }

    botoesPagina.forEach((botao) => {
        botao.addEventListener('click', () => {
            mostrarPagina(Number(botao.dataset.pagina));
        });
    });

    if (botaoAvancar) {
        botaoAvancar.addEventListener('click', () => {
            if (paginaAtual < totalPaginas) {
                mostrarPagina(paginaAtual + 1);
            }
        });
    }
    mostrarPagina(1);
}