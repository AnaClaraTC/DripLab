// Elementos da paginação
const grade = document.getElementById('grade-destaques');
const paginacao = document.getElementById('paginacao-destaques');

// Configurações
const produtosPorPagina = 8;

if (grade && paginacao) {

    // Busca todos os produtos da grade
    const produtos = Array.from(grade.querySelectorAll('.item'));

    // Calcula a quantidade de páginas
    const totalPaginas = Math.ceil(produtos.length / produtosPorPagina);

    // Página inicial
    let paginaAtual = 1;

    // Mostra os produtos da página selecionada
    function mostrarPagina(numeroPagina) {

        paginaAtual = numeroPagina;

        const inicio = (paginaAtual - 1) * produtosPorPagina;
        const fim = inicio + produtosPorPagina;

        produtos.forEach((produto, indice) => {

            if (indice >= inicio && indice < fim) {
                produto.style.display = 'block';
            } else {
                produto.style.display = 'none';
            }

        });

        atualizarBotoes();
    }

    // Cria os botões de navegação
    function criarBotoes() {

        paginacao.innerHTML = '';

        for (let i = 1; i <= totalPaginas; i++) {

            const botao = document.createElement('button');

            botao.textContent = i;
            botao.type = 'button';

            botao.addEventListener('click', () => {
                mostrarPagina(i);
            });

            paginacao.appendChild(botao);
        }

        // Botão para avançar
        const avancar = document.createElement('button');

        avancar.textContent = '➜';
        avancar.type = 'button';
        avancar.setAttribute('aria-label', 'Próxima página');

        avancar.addEventListener('click', () => {

            if (paginaAtual < totalPaginas) {
                mostrarPagina(paginaAtual + 1);
            }

        });

        paginacao.appendChild(avancar);
    }

    // Atualiza o botão da página selecionada
    function atualizarBotoes() {

        const botoes = paginacao.querySelectorAll('button');

        botoes.forEach((botao, indice) => {

            botao.classList.remove('ativo');

            if (indice === paginaAtual - 1) {
                botao.classList.add('ativo');
            }

        });
    }

    // Inicializa a paginação
    criarBotoes();
    mostrarPagina(1);
}