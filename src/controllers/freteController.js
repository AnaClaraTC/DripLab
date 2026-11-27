async function calcular(req, res) {
  try {
    const cepBruto = req.body.cep || req.query.cep || '';
    const cepLimpo = String(cepBruto).replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return res.status(400).json({ mensagem: 'CEP inválido. O CEP deve conter 8 dígitos numéricos.' });
    }

    let uf = 'RJ';
    let localidade = 'Rio de Janeiro';
    let logradouro = '';
    let bairro = '';

      //ViaCEEP API call with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resposta.ok) {
        const dados = await resposta.json();
        if (!dados.erro) {
          uf = dados.uf || uf;
          localidade = dados.localidade || localidade;
          logradouro = dados.logradouro || '';
          bairro = dados.bairro || '';
        }
      }
    } catch (e) {
      console.warn('Aviso: Falha ao consultar ViaCEP. Usando valores padrão.', e.message);
    }

    let valorPac = 14.90;
    let prazoPac = '4 a 6 dias úteis';
    let valorSedex = 24.90;
    let prazoSedex = '1 a 2 dias úteis';

    if (['SP', 'RJ'].includes(uf)) {
      valorPac = 12.90;
      prazoPac = '3 a 5 dias úteis';
      valorSedex = 21.90;
      prazoSedex = '1 a 2 dias úteis';
    } else if (['MG', 'ES', 'PR', 'SC', 'RS'].includes(uf)) {
      valorPac = 18.50;
      prazoPac = '5 a 8 dias úteis';
      valorSedex = 32.90;
      prazoSedex = '2 a 3 dias úteis';
    } else if (['GO', 'MT', 'MS', 'DF'].includes(uf)) {
      valorPac = 21.90;
      prazoPac = '6 a 9 dias úteis';
      valorSedex = 38.50;
      prazoSedex = '2 a 4 dias úteis';
    } else if (['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'PI', 'MA'].includes(uf)) {
      valorPac = 26.90;
      prazoPac = '8 a 12 dias úteis';
      valorSedex = 47.90;
      prazoSedex = '3 a 5 dias úteis';
    } else { // Região Norte
      valorPac = 32.50;
      prazoPac = '10 a 16 dias úteis';
      valorSedex = 58.90;
      prazoSedex = '4 a 7 dias úteis';
    }

    const cepFormatado = `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;

    res.json({
      cep: cepFormatado,
      localidade,
      uf,
      bairro,
      logradouro,
      opcoes: [
        {
          id: 'pac',
          nome: 'Drip Standard (Econômico)',
          valor: Number(valorPac.toFixed(2)),
          prazo: prazoPac
        },
        {
          id: 'sedex',
          nome: 'Drip Express (Sedex)',
          valor: Number(valorSedex.toFixed(2)),
          prazo: prazoSedex
        },
        {
          id: 'retirada',
          nome: 'Retirada no Drip Lab Point',
          valor: 0.00,
          prazo: 'Disponível em 24h após confirmação'
        }
      ]
    });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao calcular frete', erro: erro.message });
  }
}

module.exports = { calcular };
