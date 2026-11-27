const UFS = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO'
]);

function digitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

function normalizarCpf(valor) {
  const numero = digitos(valor);
  if (numero.length !== 11) {
    throw new Error('CPF inválido: informe os 11 dígitos.');
  }
  return `${numero.slice(0, 3)}.${numero.slice(3, 6)}.${numero.slice(6, 9)}-${numero.slice(9)}`;
}

function normalizarTelefone(valor) {
  let numero = digitos(valor);
  if ((numero.length === 12 || numero.length === 13) && numero.startsWith('55')) {
    numero = numero.slice(2);
  }
  if (numero.length !== 10 && numero.length !== 11) {
    throw new Error('Telefone inválido: informe DDD e número, com 10 dígitos para fixo ou 11 para celular.');
  }

  const digitosNumero = numero.length === 11 ? 5 : 4;
  return `(${numero.slice(0, 2)}) ${numero.slice(2, 2 + digitosNumero)}-${numero.slice(2 + digitosNumero)}`;
}

function normalizarCep(valor) {
  const numero = digitos(valor);
  if (numero.length !== 8) {
    throw new Error('CEP inválido: informe os 8 dígitos.');
  }
  return `${numero.slice(0, 5)}-${numero.slice(5)}`;
}

function normalizarUf(valor) {
  const uf = String(valor ?? '').trim().toUpperCase();
  if (!UFS.has(uf)) {
    throw new Error('Estado inválido: informe a sigla de uma UF brasileira com 2 letras.');
  }
  return uf;
}

function detalharErro(erro) {
  if (Array.isArray(erro.errors) && erro.errors.length) {
    return erro.errors.map((item) => item.message).join('; ');
  }
  return erro.message || 'Erro desconhecido.';
}

module.exports = {
  normalizarCpf,
  normalizarTelefone,
  normalizarCep,
  normalizarUf,
  detalharErro
};
