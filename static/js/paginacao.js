// Paginação dos destaques
// Os botões já existem no HTML (#paginacao-destaques).
// Aqui o JS só controla qual página aparece e qual botão fica ativo.

const grade = document.getElementById('grade-destaques');
const paginacao = document.getElementById('paginacao-destaques');

// Configuração
const produtosPorPagina = 8;

if (grade && paginacao) {

    const produtos = Array.from(grade.querySelectorAll('.item'));
    const botoesPagina = Array.from(paginacao.querySelectorAll('[data-pagina]'));
    const botaoAvancar = paginacao.querySelector('[data-avancar]');

    const totalPaginas = botoesPagina.length;
    let paginaAtual = 1;

    // Mostra apenas os produtos da página escolhida
    function mostrarPagina(numeroPagina) {

        paginaAtual = numeroPagina;

        const inicio = (paginaAtual - 1) * produtosPorPagina;
        const fim = inicio + produtosPorPagina;

        produtos.forEach((produto, indice) => {
            produto.style.display = (indice >= inicio && indice < fim) ? 'block' : 'none';
        });

        atualizarBotoes();
    }

    // Marca como ativo o botão da página atual
    function atualizarBotoes() {
        botoesPagina.forEach((botao) => {
            const ehAtual = Number(botao.dataset.pagina) === paginaAtual;
            botao.classList.toggle('ativo', ehAtual);
        });
    }

    // Clique nos números
    botoesPagina.forEach((botao) => {
        botao.addEventListener('click', () => {
            mostrarPagina(Number(botao.dataset.pagina));
        });
    });

    // Clique na seta de avançar
    if (botaoAvancar) {
        botaoAvancar.addEventListener('click', () => {
            if (paginaAtual < totalPaginas) {
                mostrarPagina(paginaAtual + 1);
            }
        });
    }

    // Inicia na página 1
    mostrarPagina(1);
}