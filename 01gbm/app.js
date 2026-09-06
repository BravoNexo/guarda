const URL_API = 'https://script.google.com/macros/s/AKfycby0yR2Y1R-PQyvh19DeqAduqrFdjYJLjZvt1OskagfqyLjgB4n6RaNHCXgCNgig5J1S/exec';
const parametrosUrl = new URLSearchParams(window.location.search);

window.PARAM_EMAIL_GUARDA = parametrosUrl.get('email') || '';
window.PARAM_CODIGO_GUARDA = parametrosUrl.get('codigo') || '';
window.PARAM_PERFIL = parametrosUrl.get('perfil') || '';

const DURACAO_SESSAO_LOCAL = {
  guarda: 36 * 60 * 60 * 1000,
  comandante: 36 * 60 * 60 * 1000,
  oficial: 36 * 60 * 60 * 1000,
  toque: 36 * 60 * 60 * 1000,
  encarregadoMotoristas: 36 * 60 * 60 * 1000,
  consultaEfetivo: 12 * 60 * 60 * 1000
};

function obterTokenSessaoLocal(chaveToken, chaveInicio, duracao) {
  const token = localStorage.getItem(chaveToken) || '';
  if (!token) return '';

  let iniciadaEm = Number(localStorage.getItem(chaveInicio) || 0);
  if (!Number.isFinite(iniciadaEm) || iniciadaEm <= 0) {
    // Migra com segurança as sessões criadas antes deste controle local.
    iniciadaEm = Date.now();
    localStorage.setItem(chaveInicio, String(iniciadaEm));
  }

  return Date.now() - iniciadaEm < duracao ? token : '';
}

function marcarInicioSessaoLocal(chaveInicio) {
  localStorage.setItem(chaveInicio, String(Date.now()));
}

async function chamarApi(acao, dados = {}) {
  let resposta;

  try {
    resposta = await fetch(URL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        acao: acao,
        dados: dados
      })
    });
  } catch (erro) {
    throw new Error('Não foi possível conectar ao servidor. Verifique a internet e tente novamente.');
  }

  if (!resposta.ok) {
    throw new Error('Falha de comunicação com o servidor.');
  }

  const resultado = await resposta.json();

  if (!resultado.sucesso) {
    throw new Error(resultado.mensagem || 'Erro ao executar a ação.');
  }

  return resultado.resposta;
}

function obterSessaoTokenLocal() {
  return obterTokenSessaoLocal(
    'guarda_sessao_token',
    'guarda_sessao_iniciada_em',
    DURACAO_SESSAO_LOCAL.guarda
  );
}

function obterSessaoTokenComandanteLocal() {
  return obterTokenSessaoLocal(
    'comandante_sessao_token',
    'comandante_sessao_iniciada_em',
    DURACAO_SESSAO_LOCAL.comandante
  );
}

function obterSessaoTokenToqueLocal() {
  return obterTokenSessaoLocal(
    'toque_fogo_sessao_token',
    'toque_fogo_sessao_iniciada_em',
    DURACAO_SESSAO_LOCAL.toque
  );
}

function obterSessaoTokenOficialLocal() {
  return obterTokenSessaoLocal(
    'oficial_dia_sessao_token',
    'oficial_dia_sessao_iniciada_em',
    DURACAO_SESSAO_LOCAL.oficial
  );
}

function obterSessaoTokenConsultaEfetivoLocal() {
  return obterTokenSessaoLocal(
    'consulta_efetivo_sessao_token',
    'consulta_efetivo_sessao_iniciada_em',
    DURACAO_SESSAO_LOCAL.consultaEfetivo
  );
}

function obterSessaoTokenEncarregadoMotoristasLocal() {
  return obterTokenSessaoLocal(
    'encarregado_motoristas_sessao_token',
    'encarregado_motoristas_sessao_iniciada_em',
    DURACAO_SESSAO_LOCAL.encarregadoMotoristas
  );
}

function montarDadosChamadaApi(nome, argumentos) {
  const sessaoToken = obterSessaoTokenLocal();
  const sessaoComandanteToken = obterSessaoTokenComandanteLocal();
  const sessaoToqueToken = obterSessaoTokenToqueLocal();
  const sessaoOficialToken = obterSessaoTokenOficialLocal();
  const sessaoConsultaEfetivoToken = obterSessaoTokenConsultaEfetivoLocal();
  const sessaoEncarregadoMotoristasToken = obterSessaoTokenEncarregadoMotoristasLocal();

  switch (nome) {
    case 'getListasFormulario':
      return {};
    case 'getEstadoEquipeServico':
      return {
        sessaoGuardaToken: sessaoToken,
        sessaoComandanteToken: sessaoComandanteToken,
        sessaoOficialToken: sessaoOficialToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoEncarregadoMotoristasToken: sessaoEncarregadoMotoristasToken,
        sessaoConsultaEfetivoToken: sessaoConsultaEfetivoToken
      };
    case 'getGuardaAtivo':
      return {
        sessaoToken: sessaoToken,
        sessaoGuardaToken: sessaoToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoComandanteToken: sessaoComandanteToken,
        sessaoOficialToken: sessaoOficialToken,
        sessaoEncarregadoMotoristasToken: sessaoEncarregadoMotoristasToken,
        sessaoConsultaEfetivoToken: sessaoConsultaEfetivoToken
      };
    case 'getComandanteAtivo':
      return {
        sessaoToken: sessaoComandanteToken,
        sessaoGuardaToken: sessaoToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoComandanteToken: sessaoComandanteToken,
        sessaoOficialToken: sessaoOficialToken,
        sessaoEncarregadoMotoristasToken: sessaoEncarregadoMotoristasToken,
        sessaoConsultaEfetivoToken: sessaoConsultaEfetivoToken
      };
    case 'getOficialDiaAtivo':
      return {
        sessaoGuardaToken: sessaoToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoComandanteToken: sessaoComandanteToken,
        sessaoOficialToken: sessaoOficialToken,
        sessaoEncarregadoMotoristasToken: sessaoEncarregadoMotoristasToken,
        sessaoConsultaEfetivoToken: sessaoConsultaEfetivoToken
      };
    case 'getDadosOficialDiaParaComandante':
      return { sessaoToken: sessaoComandanteToken };
    case 'designarOficialDia':
      return { rgOficial: argumentos[0], sessaoToken: sessaoComandanteToken };
    case 'getStatusToqueFogo':
      return {
        sessaoToken: sessaoToqueToken,
        sessaoGuardaToken: sessaoToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoComandanteToken: sessaoComandanteToken,
        sessaoOficialToken: sessaoOficialToken,
        sessaoEncarregadoMotoristasToken: sessaoEncarregadoMotoristasToken,
        sessaoConsultaEfetivoToken: sessaoConsultaEfetivoToken
      };
    case 'getPainelComandante':
      return {
        sessaoToken: sessaoComandanteToken,
        sessaoComandanteToken: sessaoComandanteToken,
        sessaoGuardaToken: sessaoToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoOficialToken: sessaoOficialToken,
        sessaoEncarregadoMotoristasToken: sessaoEncarregadoMotoristasToken,
        sessaoConsultaEfetivoToken: sessaoConsultaEfetivoToken
      };
    case 'getPainelMotoristas':
      return {
        sessaoToken: sessaoEncarregadoMotoristasToken,
        sessaoEncarregadoMotoristasToken: sessaoEncarregadoMotoristasToken
      };
    case 'registrarEventoMotoristas':
      return {
        evento: argumentos[0] || {},
        sessaoToken: sessaoEncarregadoMotoristasToken,
        sessaoEncarregadoMotoristasToken: sessaoEncarregadoMotoristasToken
      };
    case 'consultarHistoricoMovimentacoes':
      return {
        filtros: argumentos[0] || {},
        sessaoToken: sessaoComandanteToken,
        sessaoComandanteToken: sessaoComandanteToken,
        sessaoGuardaToken: sessaoToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoOficialToken: sessaoOficialToken,
        sessaoEncarregadoMotoristasToken: sessaoEncarregadoMotoristasToken,
        sessaoConsultaEfetivoToken: sessaoConsultaEfetivoToken
      };
    case 'enviarCodigoAcessoEncarregadoMotoristas':
      return { email: argumentos[0] };
    case 'validarCodigoAcessoEncarregadoMotoristas':
      return { email: argumentos[0], codigo: argumentos[1] };
    case 'revogarSessaoEncarregadoMotoristas':
      return {
        sessaoToken: argumentos[0] || sessaoEncarregadoMotoristasToken,
        sessaoEncarregadoMotoristasToken: argumentos[0] || sessaoEncarregadoMotoristasToken
      };
    case 'getPessoasDentroGuarda':
      return { sessaoToken: sessaoToken, sessaoToqueToken: sessaoToqueToken };
    case 'getMovimentacoesRecentesGuarda':
      return { sessaoToken: sessaoToken, sessaoToqueToken: sessaoToqueToken };
    case 'enviarCodigoConsultaEfetivo':
      return { email: argumentos[0] };
    case 'validarCodigoConsultaEfetivo':
      return { email: argumentos[0], codigo: argumentos[1] };
    case 'getMovimentacoesConsultaEfetivo':
      return { sessaoToken: obterSessaoTokenConsultaEfetivoLocal() };
    case 'registrarSaidaRapidaPessoa':
      return { idMovimentacaoEntrada: argumentos[0], sessaoToken: sessaoToken, sessaoToqueToken: sessaoToqueToken };
    case 'getDadosSOS':
      return {
        sessaoToken: sessaoToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoComandanteToken: sessaoComandanteToken,
        sessaoOficialToken: sessaoOficialToken
      };
    case 'salvarGuarnicoesServico':
      return {
        guarnicoes: argumentos[0],
        sessaoToken: sessaoToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoComandanteToken: sessaoComandanteToken,
        sessaoOficialToken: sessaoOficialToken
      };
    case 'registrarMovimentacaoSOS':
      return {
        sos: argumentos[0],
        sessaoToken: sessaoToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoComandanteToken: sessaoComandanteToken,
        sessaoOficialToken: sessaoOficialToken
      };
    case 'buscarPessoasPorRgCpf':
      return {
        rgCpf: argumentos[0],
        categoriaPessoa: argumentos[1],
        sessaoToken: sessaoToken,
        sessaoToqueToken: sessaoToqueToken,
        sessaoComandanteToken: sessaoComandanteToken
      };
    case 'registrarMovimentacao':
      return { movimentacao: argumentos[0], sessaoToken: sessaoToken, sessaoToqueToken: sessaoToqueToken };
    case 'registrarMovimentacaoRetroativa':
      return { movimentacao: argumentos[0], sessaoComandanteToken: sessaoComandanteToken };
    case 'enviarCodigoAssumirToqueFogo':
      return { email: argumentos[0], periodoAlvo: argumentos[1] };
    case 'validarCodigoAssumirToqueFogo':
      return { email: argumentos[0], codigo: argumentos[1], periodoAlvo: argumentos[2] };
    case 'assumirToqueFogoComEmailValidado':
      return argumentos[0] || {};
    case 'retomarPostoAposSOS':
      return { sessaoToken: sessaoToken, idCobertura: argumentos[0] || '' };
    case 'assumirHoraToqueFogo':
      return { sessaoToqueToken: sessaoToqueToken };
    case 'enviarCodigoAssumirGuarda':
      return { email: argumentos[0] };
    case 'validarCodigoAssumirGuarda':
      return { email: argumentos[0], codigo: argumentos[1] };
    case 'assumirGuardaComEmailValidado':
      return argumentos[0] || {};
    case 'enviarCodigoEncerrarGuarda':
      return { sessaoToken: sessaoToken };
    case 'validarCodigoEEncerrarGuarda':
      return {
        email: argumentos[0],
        codigo: argumentos[1],
        sessaoToken: sessaoToken
      };
    case 'enviarCodigoAssumirComandante':
      return { email: argumentos[0] };
    case 'validarCodigoAssumirComandante':
      return { email: argumentos[0], codigo: argumentos[1] };
    case 'assumirComandanteComEmailValidado':
      return argumentos[0] || {};
    case 'enviarCodigoAssumirOficialDia':
      return { email: argumentos[0] };
    case 'validarCodigoAssumirOficialDia':
      return { email: argumentos[0], codigo: argumentos[1] };
    case 'assumirOficialDiaComEmailValidado':
      return argumentos[0] || {};
    case 'enviarCodigoEncerrarOficialDia':
      return { sessaoToken: sessaoOficialToken };
    case 'validarCodigoEEncerrarOficialDia':
      return { email: argumentos[0], codigo: argumentos[1], sessaoToken: sessaoOficialToken };
    case 'enviarCodigoEncerrarComandante':
      return { sessaoToken: sessaoComandanteToken };
    case 'validarCodigoEEncerrarComandante':
      return {
        email: argumentos[0],
        codigo: argumentos[1],
        observacoesServico: argumentos[2] || '',
        sessaoToken: sessaoComandanteToken
      };
    default:
      return argumentos[0] || {};
  }
}

function ajustarRespostaApi(nome, resposta) {
  if (nome === 'getEstadoEquipeServico') {
    const estado = resposta || {};
    const possuiEnvelopes =
      ('guardaAtivo' in estado || 'guarda' in estado) &&
      ('comandanteAtivo' in estado || 'comandante' in estado) &&
      ('oficialDiaAtivo' in estado || 'oficial' in estado) &&
      ('statusToqueFogo' in estado || 'statusToque' in estado);
    if (!possuiEnvelopes) throw new Error('Resposta incompleta do estado da equipe de serviço.');

    const blocoGuarda = estado.guardaAtivo || estado.guarda || {};
    const blocoComandante = estado.comandanteAtivo || estado.comandante || {};
    const blocoOficial = estado.oficialDiaAtivo || estado.oficial || {};
    const possuiBlocoEncarregadoMotoristas =
      Object.prototype.hasOwnProperty.call(estado, 'encarregadoMotoristasAtivo') ||
      Object.prototype.hasOwnProperty.call(estado, 'encarregadoMotoristas');
    const blocoEncarregadoMotoristas = possuiBlocoEncarregadoMotoristas
      ? (estado.encarregadoMotoristasAtivo || estado.encarregadoMotoristas || {})
      : {};
    const statusToque = estado.statusToqueFogo || estado.statusToque || {};
    const guarda = blocoGuarda.guarda || null;
    const comandante = blocoComandante.comandante || null;
    const oficial = blocoOficial.oficial || null;
    const encarregadoMotoristas = blocoEncarregadoMotoristas.encarregado || null;

    if (guarda) guarda.Sessao_Valida = blocoGuarda.sessaoValida === true;
    if (comandante) comandante.Sessao_Valida = blocoComandante.sessaoValida === true;
    if (oficial) oficial.Sessao_Valida = blocoOficial.sessaoValida === true;
    if (encarregadoMotoristas) {
      encarregadoMotoristas.Sessao_Valida = blocoEncarregadoMotoristas.sessaoValida === true;
    }
    if (statusToque.toque) {
      statusToque.toque.Sessao_Valida = statusToque.sessaoPeriodoAtual === true;
    }

    const estadoAjustado = {
      guarda: guarda,
      comandante: comandante,
      oficial: oficial,
      statusToque: statusToque
    };
    if (possuiBlocoEncarregadoMotoristas) {
      estadoAjustado.encarregadoMotoristas = encarregadoMotoristas;
    }
    return estadoAjustado;
  }

  if (nome === 'getGuardaAtivo') {
    const guarda = resposta && resposta.guarda ? resposta.guarda : null;

    if (guarda) {
      guarda.Sessao_Valida = resposta.sessaoValida === true;
    }

    return guarda;
  }

  if (nome === 'getComandanteAtivo') {
    const comandante = resposta && resposta.comandante ? resposta.comandante : null;

    if (comandante) {
      comandante.Sessao_Valida = resposta.sessaoValida === true;
    }

    return comandante;
  }

  if (nome === 'getOficialDiaAtivo') {
    const oficial = resposta && resposta.oficial ? resposta.oficial : null;
    if (oficial) oficial.Sessao_Valida = resposta.sessaoValida === true;
    return oficial;
  }

  if (nome === 'getStatusToqueFogo') {
    const status = resposta || {};
    if (status.toque) status.toque.Sessao_Valida = status.sessaoPeriodoAtual === true;
    return status;
  }

  if (
    nome === 'assumirGuardaComEmailValidado' &&
    resposta &&
    resposta.guarda &&
    resposta.sessaoToken
  ) {
    resposta.guarda.Sessao_Valida = true;
    resposta.guarda.Sessao_Token = resposta.sessaoToken;
  }

  if (
    nome === 'assumirComandanteComEmailValidado' &&
    resposta &&
    resposta.comandante &&
    resposta.sessaoToken
  ) {
    resposta.comandante.Sessao_Valida = true;
    resposta.comandante.Sessao_Token = resposta.sessaoToken;
  }

  if (
    nome === 'assumirToqueFogoComEmailValidado' &&
    resposta && resposta.toque && resposta.sessaoToken
  ) {
    resposta.toque.Sessao_Valida = true;
    resposta.toque.Sessao_Token = resposta.sessaoToken;
  }

  if (nome === 'assumirOficialDiaComEmailValidado' && resposta && resposta.oficial && resposta.sessaoToken) {
    resposta.oficial.Sessao_Valida = true;
    resposta.oficial.Sessao_Token = resposta.sessaoToken;
  }

  return resposta;
}

function criarExecutorAppsScript() {
  let sucesso = () => {};
  let falha = () => {};

  const executor = {
    withSuccessHandler(callback) {
      sucesso = typeof callback === 'function' ? callback : sucesso;
      return executor;
    },
    withFailureHandler(callback) {
      falha = typeof callback === 'function' ? callback : falha;
      return executor;
    }
  };

  [
    'getListasFormulario',
    'getEstadoEquipeServico',
    'getGuardaAtivo',
    'getComandanteAtivo',
    'getOficialDiaAtivo',
    'getDadosOficialDiaParaComandante',
    'designarOficialDia',
    'getStatusToqueFogo',
    'getPainelComandante',
    'getPainelMotoristas',
    'enviarCodigoAcessoEncarregadoMotoristas',
    'validarCodigoAcessoEncarregadoMotoristas',
    'revogarSessaoEncarregadoMotoristas',
    'registrarEventoMotoristas',
    'consultarHistoricoMovimentacoes',
    'getPessoasDentroGuarda',
    'getMovimentacoesRecentesGuarda',
    'enviarCodigoConsultaEfetivo',
    'validarCodigoConsultaEfetivo',
    'getMovimentacoesConsultaEfetivo',
    'registrarSaidaRapidaPessoa',
    'getDadosSOS',
    'salvarGuarnicoesServico',
    'registrarMovimentacaoSOS',
    'buscarPessoasPorRgCpf',
    'registrarMovimentacao',
    'registrarMovimentacaoRetroativa',
    'enviarCodigoAssumirToqueFogo',
    'validarCodigoAssumirToqueFogo',
    'assumirToqueFogoComEmailValidado',
    'assumirHoraToqueFogo',
    'retomarPostoAposSOS',
    'enviarCodigoAssumirGuarda',
    'validarCodigoAssumirGuarda',
    'assumirGuardaComEmailValidado',
    'enviarCodigoEncerrarGuarda',
    'validarCodigoEEncerrarGuarda',
    'enviarCodigoAssumirComandante',
    'validarCodigoAssumirComandante',
    'assumirComandanteComEmailValidado',
    'enviarCodigoAssumirOficialDia',
    'validarCodigoAssumirOficialDia',
    'assumirOficialDiaComEmailValidado',
    'enviarCodigoEncerrarOficialDia',
    'validarCodigoEEncerrarOficialDia',
    'enviarCodigoEncerrarComandante',
    'validarCodigoEEncerrarComandante'
  ].forEach(nome => {
    executor[nome] = (...argumentos) => {
      chamarApi(nome, montarDadosChamadaApi(nome, argumentos))
        .then(resposta => sucesso(ajustarRespostaApi(nome, resposta)))
        .catch(erro => falha({ message: erro.message }));
    };
  });

  return executor;
}

window.google = window.google || {};
window.google.script = window.google.script || {};
Object.defineProperty(window.google.script, 'run', {
  configurable: false,
  get: criarExecutorAppsScript
});

let tipoMovimentacaoAtual = 'Entrada';
  let modoRegistroAtual = 'Individual';
  let categoriaPessoaIndividualAtual = 'Militar';
  let pessoaSelecionada = null;
  let temporizadorSugestaoPessoa = null;
  let numeroBuscaPessoa = 0;
  let condutorExternoAtivo = false;
  let ocupantesViatura = [];
  let destinos = [];
  let procedencias = [];
  let viaturasSOS = [];
  let militaresSOS = [];
  let selecoesViaturasSOS = {};
  let guarnicoesServico = [];
  let cicloGuarnicoesServico = null;
  let idsGuarnicaoServicoEdicao = [];
  let guarnicoesServicoCarregadas = false;
  let tipoSeletorMilitarGuarnicaoServico = '';
  let focoAntesDoSeletorMilitarGuarnicao = null;
  let modoLancamentoRetroativoAtivo = false;
  let idSolicitacaoRetroativaAtual = '';
  let assinaturaSolicitacaoRetroativaAtual = '';

  let dadosCodigoGuarda = null;
  let guardaAtual = null;
  let emailEncerramentoGuarda = null;
  let dadosCodigoComandante = null;
  let comandanteAtual = null;
  let emailEncerramentoComandante = null;
  let painelComandanteCarregado = false;
  let painelComandanteEmCarregamento = false;
  let permissoesPainelGestaoAtual = { podeLancarHorarioAnterior: false };
  let painelMotoristasAtual = null;
  let painelMotoristasCarregado = false;
  let painelMotoristasEmCarregamento = false;
  let painelMotoristasAutorizado = false;
  let assinaturaPainelMotoristasCarregado = '';
  let dadosCodigoEncarregadoMotoristas = null;
  let encarregadoMotoristasEquipeAtual = null;
  let abaPainelMotoristasAtual = 'frota';
  let tipoEventoMotoristasAtual = '';
  let viaturaPreselecionadaMotoristas = '';
  let idSolicitacaoEventoMotoristasAtual = '';
  let focoAntesDoModalMotoristas = null;
  let historicoInicializado = false;
  let dadosCodigoOficial = null;
  let oficialAtual = null;
  let oficialAcessoAtual = null;
  let emailEncerramentoOficial = null;
  let pessoasDentroGuardaCarregadas = false;
  let movimentacoesGuardaCarregadas = false;
  let statusToqueFogoAtual = null;
  let estadoToqueFogoCarregado = false;
  let geracaoConsultaGuarda = 0;
  let geracaoConsultaToque = 0;
  let geracaoConsultaComandante = 0;
  let geracaoConsultaOficial = 0;
  let geracaoConsultaEstadoEquipe = 0;
  let geracaoSessaoEquipe = 0;
  let estadoEquipeServicoEmCarregamento = false;
  let atualizacaoEstadoEquipeServicoPendente = false;
  let atualizacaoEstadoEquipeServicoPendenteSilenciosa = true;
  let usarFallbackEstadoEquipeServico = false;
  let dadosCodigoToqueFogo = null;
  let loginToqueFogoAberto = false;
  let geracaoValidacaoToqueFogo = 0;
  let consultaEfetivoAtual = null;

  const ABAS_PAINEL_MOTORISTAS = {
    frota: {
      titulo: 'Situação da frota',
      descricao: 'Condição operacional e localização atual das viaturas.',
      tipo: 'CONDICAO',
      acao: 'Atualizar condição'
    },
    abastecimento: {
      titulo: 'Abastecimentos',
      descricao: 'Condutor, horário, valor e quilometragem de cada abastecimento.',
      tipo: 'ABASTECIMENTO',
      acao: 'Lançar abastecimento'
    },
    alteracao: {
      titulo: 'Alterações de viatura',
      descricao: 'Avarias, conferências e demais fatos relacionados à frota.',
      tipo: 'ALTERACAO',
      acao: 'Lançar alteração',
      tiposRegistro: ['ALTERACAO', 'ALTERACAO_CADASTRO', 'CONDICAO', 'CADASTRO', 'SUBSTITUICAO']
    },
    administrativa: {
      titulo: 'Viaturas administrativas',
      descricao: 'Entradas e saídas registradas automaticamente pelo Controle de Acesso da Guarda.',
      tipo: 'MOV_ADMINISTRATIVA',
      automatico: true
    },
    manutencao: {
      titulo: 'Manutenção',
      descricao: 'Saídas para oficina e retornos à unidade.',
      tipo: 'MANUTENCAO',
      acao: 'Lançar manutenção'
    },
    sisgeo: {
      titulo: 'SISGEO',
      descricao: 'Confirmação do cumprimento do prazo e registro das viaturas com pendência.',
      tipo: 'SISGEO',
      acao: 'Atualizar SISGEO'
    },
    observacao: {
      titulo: 'Observações gerais',
      descricao: 'Informações pertinentes ao serviço do Encarregado de Motoristas.',
      tipo: 'OBSERVACAO_GERAL',
      acao: 'Adicionar observação'
    }
  };

  function aparelhoTemSessaoEquipeLocal() {
    return !!(
      obterSessaoTokenLocal() ||
      obterSessaoTokenToqueLocal() ||
      obterSessaoTokenComandanteLocal() ||
      obterSessaoTokenOficialLocal() ||
      obterSessaoTokenEncarregadoMotoristasLocal() ||
      obterSessaoTokenConsultaEfetivoLocal()
    );
  }

  function aplicarVisibilidadePublicaEquipeLocal() {
    if (aparelhoTemSessaoEquipeLocal()) return;

    const toqueAtual = statusToqueFogoAtual && statusToqueFogoAtual.toque;
    const coberturaAtual = statusToqueFogoAtual && statusToqueFogoAtual.cobertura;
    const programacaoToqueAtual = statusToqueFogoAtual &&
      Array.isArray(statusToqueFogoAtual.programacao)
      ? statusToqueFogoAtual.programacao
      : [];
    const possuiIdentidadeRestrita = !!(
      (guardaAtual && guardaAtual.RG_Guarda) ||
      (comandanteAtual && (comandanteAtual.Nome_Comandante || comandanteAtual.RG_Comandante)) ||
      (oficialAtual && (oficialAtual.Nome_Oficial || oficialAtual.RG_Oficial)) ||
      (encarregadoMotoristasEquipeAtual &&
        (encarregadoMotoristasEquipeAtual.nome || encarregadoMotoristasEquipeAtual.rg)) ||
      (toqueAtual && (toqueAtual.Nome_Toque || toqueAtual.RG_Toque)) ||
      (coberturaAtual && (coberturaAtual.Nome_Toque || coberturaAtual.Nome_Guarda_Titular)) ||
      programacaoToqueAtual.some(item => item && item.toque &&
        (item.toque.Nome_Toque || item.toque.RG_Toque))
    );

    if (!possuiIdentidadeRestrita) return;

    geracaoSessaoEquipe += 1;
    invalidarConsultasEquipeServico();

    // Invalida respostas autenticadas que ainda estejam em trânsito e remove
    // imediatamente as identidades privadas quando a última sessão sair.
    if (guardaAtual) {
      guardaAtual = {
        ID_GuardaServico: guardaAtual.ID_GuardaServico || '',
        Nome_Guarda: guardaAtual.Nome_Guarda || '',
        DataHora_Inicio: guardaAtual.DataHora_Inicio || '',
        Identidade_Visivel: false,
        Sessao_Valida: false
      };
    }

    if (comandanteAtual) {
      comandanteAtual = {
        ID_ComandanteGuarda: comandanteAtual.ID_ComandanteGuarda || '',
        DataHora_Assuncao_Real: comandanteAtual.DataHora_Assuncao_Real || '',
        DataHora_Inicio_Ciclo: comandanteAtual.DataHora_Inicio_Ciclo || '',
        DataHora_Fim_Ciclo: comandanteAtual.DataHora_Fim_Ciclo || '',
        Identidade_Visivel: false,
        Sessao_Valida: false
      };
    }

    if (oficialAtual) {
      oficialAtual = {
        ID_OficialDia: oficialAtual.ID_OficialDia || '',
        DataHora_Assuncao: oficialAtual.DataHora_Assuncao || '',
        Identidade_Visivel: false,
        Sessao_Valida: false
      };
    }

    if (encarregadoMotoristasEquipeAtual) {
      encarregadoMotoristasEquipeAtual = {
        idServico: encarregadoMotoristasEquipeAtual.idServico || '',
        origem: encarregadoMotoristasEquipeAtual.origem || '',
        Identidade_Visivel: false,
        Sessao_Valida: false
      };
    }

    if (statusToqueFogoAtual) {
      statusToqueFogoAtual = {
        periodo: statusToqueFogoAtual.periodo || null,
        toque: toqueAtual ? {
          ID_ToqueFogo: toqueAtual.ID_ToqueFogo || '',
          Identidade_Visivel: false,
          Sessao_Valida: false
        } : null,
        cobertura: coberturaAtual ? {
          ID_Cobertura: coberturaAtual.ID_Cobertura || '',
          ID_ToqueFogo: coberturaAtual.ID_ToqueFogo || '',
          ID_GuardaServico_Titular: coberturaAtual.ID_GuardaServico_Titular || '',
          DataHora_Inicio: coberturaAtual.DataHora_Inicio || '',
          Identidade_Visivel: false
        } : null,
        programacao: programacaoToqueAtual.map(item => ({
          periodo: item && item.periodo ? item.periodo : null,
          toque: item && item.toque ? {
            ID_ToqueFogo: item.toque.ID_ToqueFogo || '',
            Identidade_Visivel: false,
            Sessao_Valida: false
          } : null
        })),
        sessaoValida: false,
        sessaoPeriodoAtual: false,
        sessaoCoberturaAtiva: false
      };
    }

    atualizarTelaGuarda();
    atualizarTelaComandante();
    atualizarTelaOficial();
    atualizarTelaEncarregadoMotoristas();
    atualizarTelaToqueFogo();
  }

  function respostaPertenceASessaoEquipe(geracao) {
    return geracao === geracaoSessaoEquipe && aparelhoTemSessaoEquipeLocal();
  }

  function obterAssinaturaSessoesEquipeLocal() {
    return [
      obterSessaoTokenLocal(),
      obterSessaoTokenComandanteLocal(),
      obterSessaoTokenOficialLocal(),
      obterSessaoTokenToqueLocal(),
      obterSessaoTokenEncarregadoMotoristasLocal(),
      obterSessaoTokenConsultaEfetivoLocal()
    ].join('|');
  }

  function invalidarConsultasEquipeServico() {
    geracaoConsultaGuarda += 1;
    geracaoConsultaComandante += 1;
    geracaoConsultaOficial += 1;
    geracaoConsultaToque += 1;
    geracaoConsultaEstadoEquipe += 1;
  }

  function iniciarConsultaEquipeServico() {
    invalidarConsultasEquipeServico();
    return {
      guarda: geracaoConsultaGuarda,
      comandante: geracaoConsultaComandante,
      oficial: geracaoConsultaOficial,
      toque: geracaoConsultaToque,
      estadoEquipe: geracaoConsultaEstadoEquipe
    };
  }

  function consultaEquipeServicoAindaAtual(geracoes, assinaturaSessoes) {
    return !!geracoes &&
      geracoes.guarda === geracaoConsultaGuarda &&
      geracoes.comandante === geracaoConsultaComandante &&
      geracoes.oficial === geracaoConsultaOficial &&
      geracoes.toque === geracaoConsultaToque &&
      geracoes.estadoEquipe === geracaoConsultaEstadoEquipe &&
      assinaturaSessoes === obterAssinaturaSessoesEquipeLocal();
  }

  function executarConsultaEquipeServico(nomeAcao) {
    return new Promise((resolver, rejeitar) => {
      google.script.run
        .withSuccessHandler(resolver)
        .withFailureHandler(rejeitar)[nomeAcao]();
    });
  }

  function carregarEstadoEquipeServicoLegado() {
    return Promise.all([
      executarConsultaEquipeServico('getGuardaAtivo'),
      executarConsultaEquipeServico('getComandanteAtivo'),
      executarConsultaEquipeServico('getOficialDiaAtivo'),
      executarConsultaEquipeServico('getStatusToqueFogo')
    ]).then(([guarda, comandante, oficial, statusToque]) => ({
      guarda: guarda,
      comandante: comandante,
      oficial: oficial,
      statusToque: statusToque || {}
    }));
  }

  function erroIndicaEstadoEquipeServicoIndisponivel(erro) {
    const mensagem = String(erro && erro.message ? erro.message : erro || '').toLowerCase();
    return /a[cç][aã]o/.test(mensagem) &&
      /(inv[aá]lid|desconhecid|n[aã]o encontr|n[aã]o suport|inexistent|permitid)/.test(mensagem);
  }

  function aplicarEstadoEquipeServico(estado) {
    guardaAtual = estado && Object.prototype.hasOwnProperty.call(estado, 'guarda')
      ? estado.guarda
      : null;
    comandanteAtual = estado && Object.prototype.hasOwnProperty.call(estado, 'comandante')
      ? estado.comandante
      : null;
    oficialAtual = estado && Object.prototype.hasOwnProperty.call(estado, 'oficial')
      ? estado.oficial
      : null;
    const recebeuEstadoEncarregadoMotoristas = estado &&
      Object.prototype.hasOwnProperty.call(estado, 'encarregadoMotoristas');
    if (recebeuEstadoEncarregadoMotoristas) {
      encarregadoMotoristasEquipeAtual = estado.encarregadoMotoristas;
    }
    statusToqueFogoAtual = estado && estado.statusToque ? estado.statusToque : {};
    estadoToqueFogoCarregado = true;

    // As referências da equipe já foram substituídas antes de qualquer renderização.
    // Guarda atualiza também o Toque; Comandante atualiza também o Oficial.
    atualizarTelaGuarda();
    atualizarTelaComandante();
    if (recebeuEstadoEncarregadoMotoristas) atualizarTelaEncarregadoMotoristas();
  }

  function carregarIdentidadesEquipeServico(silencioso = false, invalidarEmAndamento = true) {
    aplicarVisibilidadePublicaEquipeLocal();

    if (estadoEquipeServicoEmCarregamento) {
      atualizacaoEstadoEquipeServicoPendente = true;
      atualizacaoEstadoEquipeServicoPendenteSilenciosa =
        atualizacaoEstadoEquipeServicoPendenteSilenciosa && silencioso;
      if (invalidarEmAndamento) invalidarConsultasEquipeServico();
      return;
    }

    estadoEquipeServicoEmCarregamento = true;
    const geracoes = iniciarConsultaEquipeServico();
    const assinaturaSessoes = obterAssinaturaSessoesEquipeLocal();
    const consulta = usarFallbackEstadoEquipeServico
      ? carregarEstadoEquipeServicoLegado()
      : executarConsultaEquipeServico('getEstadoEquipeServico').catch((erro) => {
          if (!erroIndicaEstadoEquipeServicoIndisponivel(erro)) throw erro;
          usarFallbackEstadoEquipeServico = true;
          return carregarEstadoEquipeServicoLegado();
        });

    consulta
      .then((estado) => {
        if (!consultaEquipeServicoAindaAtual(geracoes, assinaturaSessoes)) return;
        aplicarEstadoEquipeServico(estado || {});
      })
      .catch((erro) => {
        if (!silencioso) {
          mostrarMensagem('Erro ao carregar equipe de serviço: ' + (erro.message || erro), 'erro');
        }
      })
      .finally(() => {
        estadoEquipeServicoEmCarregamento = false;
        if (!atualizacaoEstadoEquipeServicoPendente) {
          atualizacaoEstadoEquipeServicoPendenteSilenciosa = true;
          return;
        }

        const proximaSilenciosa = atualizacaoEstadoEquipeServicoPendenteSilenciosa;
        atualizacaoEstadoEquipeServicoPendente = false;
        atualizacaoEstadoEquipeServicoPendenteSilenciosa = true;
        setTimeout(() => carregarIdentidadesEquipeServico(proximaSilenciosa, false), 0);
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    inicializarEquipeServico();
    carregarListas();
    selecionarModoRegistro('Individual');
    alternarTipoRegistro();
    carregarIdentidadesEquipeServico();
    restaurarCodigoGuardaPendente();
    restaurarCodigoComandantePendente();
    restaurarCodigoOficialPendente();
    restaurarAcessoOficial();
    restaurarCodigoEncarregadoMotoristasPendente();
    aplicarCodigoDoLink();
    inicializarFiltrosHistorico();
  inicializarSecoesPainelComandante();
  inicializarPainelMotoristas();
  restaurarConsultaEfetivo();

    const campoBuscaPessoa = document.getElementById('rgCpfBusca');
    campoBuscaPessoa.addEventListener('input', sugerirPessoasEnquantoDigita);
    campoBuscaPessoa.addEventListener('keydown', evento => {
      if (evento.key === 'Enter') {
        evento.preventDefault();
        clearTimeout(temporizadorSugestaoPessoa);
        buscarPessoa(false);
      }
    });

    document.addEventListener('keydown', evento => {
      const modalMotoristasAberto = obterModalMotoristasAberto();
      if (modalMotoristasAberto) {
        if (evento.key === 'Escape') {
          evento.preventDefault();
          fecharModalEventoMotoristas();
          return;
        }

        if (evento.key === 'Tab') {
          manterFocoDentroDoModal(evento, modalMotoristasAberto);
        }
        return;
      }

      const modalConfirmacao = document.getElementById('modalConfirmacao');
      if (modalConfirmacao && !modalConfirmacao.classList.contains('oculto')) {
        if (evento.key === 'Escape') {
          evento.preventDefault();
          fecharModalConfirmacao();
          return;
        }

        if (evento.key === 'Tab') {
          const focaveis = Array.from(modalConfirmacao.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          ));
          if (!focaveis.length) {
            evento.preventDefault();
            return;
          }

          const primeiro = focaveis[0];
          const ultimo = focaveis[focaveis.length - 1];
          if (!modalConfirmacao.contains(document.activeElement)) {
            evento.preventDefault();
            (evento.shiftKey ? ultimo : primeiro).focus();
          } else if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
          } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
          }
        }
        return;
      }

      const modal = document.getElementById('modalSeletorMilitarGuarnicao');
      if (!modal || modal.classList.contains('oculto')) return;

      if (evento.key === 'Escape') {
        fecharSeletorMilitarGuarnicaoServico();
        return;
      }

      if (evento.key === 'Tab') {
        const focaveis = Array.from(modal.querySelectorAll('button:not([disabled]), input:not([disabled])'));
        if (!focaveis.length) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];

        if (evento.shiftKey && document.activeElement === primeiro) {
          evento.preventDefault();
          ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault();
          primeiro.focus();
        }
      }
    });

    setInterval(() => {
      carregarIdentidadesEquipeServico(true, false);

      if (aparelhoPodeOperarGuardaAtual()) {
        carregarPessoasDentroGuarda(true);
        carregarMovimentacoesGuarda(true);
      }

      if (aparelhoTemAcessoPainelGestao()) {
        carregarPainelComandante(true);
      }

      atualizarVisibilidadePainelMotoristas();
      if (obterSessaoTokenEncarregadoMotoristasLocal()) {
        carregarPainelMotoristas(true);
      }

      if (obterSessaoConsultaEfetivo()) carregarMovimentacoesConsultaEfetivo(true);
    }, 60000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        atualizarVisibilidadePainelMotoristas();
        carregarIdentidadesEquipeServico(true, true);
      }
    });

    // Nos celulares do guarda e do Toque de Fogo, mantém a troca de operador
    // visível em poucos segundos. Os demais aparelhos usam a atualização
    // consolidada de 60 segundos e a atualização imediata ao voltar à aba.
    setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (!obterSessaoTokenLocal() && !obterSessaoTokenToqueLocal()) return;
      carregarIdentidadesEquipeServico(true, false);
    }, 8000);
  });

  const secoesPainelComandante = {
    viaturas: {
      secao: 'secaoPainelViaturas',
      conteudo: 'conteudoPainelViaturas',
      armazenamento: 'painel_gestao_viaturas_recolhido',
      recolhidaPorPadrao: false
    },
    dentro: {
      secao: 'secaoPainelDentro',
      conteudo: 'conteudoPainelDentro',
      armazenamento: 'painel_gestao_dentro_recolhido',
      recolhidaPorPadrao: false
    },
    movimentacoes: {
      secao: 'secaoPainelMovimentacoes',
      conteudo: 'conteudoPainelMovimentacoes',
      armazenamento: 'painel_gestao_movimentacoes_recolhido',
      recolhidaPorPadrao: true
    }
  };

  function aplicarEstadoSecaoPainel(chave, recolhida, salvar = true) {
    const configuracao = secoesPainelComandante[chave];
    if (!configuracao) return;

    const secao = document.getElementById(configuracao.secao);
    const conteudo = document.getElementById(configuracao.conteudo);
    const botao = secao?.querySelector('.botao-alternar-secao-painel');
    if (!secao || !conteudo || !botao) return;

    conteudo.hidden = recolhida;
    secao.classList.toggle('recolhida', recolhida);
    botao.setAttribute('aria-expanded', String(!recolhida));

    if (salvar) {
      localStorage.setItem(configuracao.armazenamento, recolhida ? 'sim' : 'nao');
    }
  }

  function alternarSecaoPainel(chave) {
    const configuracao = secoesPainelComandante[chave];
    const conteudo = configuracao && document.getElementById(configuracao.conteudo);
    if (!conteudo) return;

    aplicarEstadoSecaoPainel(chave, !conteudo.hidden);
  }

  function inicializarSecoesPainelComandante() {
    Object.entries(secoesPainelComandante).forEach(([chave, configuracao]) => {
      const estadoSalvo = localStorage.getItem(configuracao.armazenamento);
      const recolhida = estadoSalvo === null
        ? configuracao.recolhidaPorPadrao
        : estadoSalvo === 'sim';
      aplicarEstadoSecaoPainel(chave, recolhida, false);
    });
  }

  function selecionarMovimentacao(tipo) {
    tipoMovimentacaoAtual = tipo;

    document.getElementById('btnEntrada').classList.toggle('ativo', tipo === 'Entrada');
    document.getElementById('btnSaida').classList.toggle('ativo', tipo === 'Saída');

    preencherDestinos();
    preencherProcedencias();

    if (modoRegistroAtual === 'SOS') {
      renderizarSelecaoViaturasSOS();
    }
  }

  function normalizarPrefixoPlaca(campo) {
    campo.value = String(campo.value || '')
      .replace(/\s+/g, '')
      .toUpperCase();
  }

  function selecionarModoRegistro(modo) {
    if (modoLancamentoRetroativoAtivo && modo !== 'Individual') {
      mostrarMensagem('O lançamento retroativo está disponível inicialmente apenas no modo Individual.', 'erro');
      return;
    }

    modoRegistroAtual = ['Viatura', 'SOS'].includes(modo) ? modo : 'Individual';

    document.getElementById('btnModoIndividual').classList.toggle('ativo', modoRegistroAtual === 'Individual');
    document.getElementById('btnModoViatura').classList.toggle('ativo', modoRegistroAtual === 'Viatura');
    document.getElementById('btnModoSOS').classList.toggle('ativo', modoRegistroAtual === 'SOS');

    const isViatura = modoRegistroAtual === 'Viatura';
    const isSOS = modoRegistroAtual === 'SOS';
    const tipoRegistro = document.getElementById('tipoRegistro');

    if (isSOS) {
      tipoMovimentacaoAtual = 'Saída';
      selecoesViaturasSOS = {};
      document.getElementById('btnEntrada').classList.remove('ativo');
      document.getElementById('btnSaida').classList.add('ativo');
      carregarDadosSOS();
    } else if (isViatura) {
      tipoRegistro.value = 'Pessoa cadastrada';
    } else {
      condutorExternoAtivo = false;
      ocupantesViatura = [];
      renderizarOcupantesViatura();
    }

    document.getElementById('areaRegistroPadrao').classList.toggle('oculto', isSOS);
    document.getElementById('areaRegistroSOS').classList.toggle('oculto', !isSOS);
    document.getElementById('labelTipoMovimentacao').textContent = isSOS ? 'Movimentação de SOS' : 'Tipo de movimentação';
    document.getElementById('textoBtnEntrada').textContent = isSOS ? 'Retorno' : 'Entrada';
    document.getElementById('textoBtnSaida').textContent = 'Saída';

    document.getElementById('areaOcupantesViatura').classList.toggle('oculto', !isViatura);
    document.getElementById('areaCategoriaPessoa').classList.toggle('oculto', isViatura);
    document.getElementById('areaOpcaoCondutorExterno').classList.toggle('oculto', !isViatura || condutorExternoAtivo);
    document.getElementById('areaCondutorExterno').classList.toggle('oculto', !isViatura || !condutorExternoAtivo);
    document.getElementById('campoBuscaPessoaPrincipal').classList.toggle('oculto', isViatura && condutorExternoAtivo);
    document.getElementById('labelPessoaPrincipal').textContent = isViatura
      ? 'Nome ou RG/CPF do condutor'
      : 'Nome ou RG/CPF da pessoa';
    document.getElementById('labelPrefixoPlaca').textContent = isViatura
      ? 'Prefixo/Placa do Auto/VTR *'
      : 'Prefixo/Placa';
    document.getElementById('prefixoPlaca').placeholder = isViatura
      ? 'Obrigatório'
      : 'Opcional';
    document.getElementById('btnRegistrarMovimentacao').textContent = isViatura
      ? 'Registrar Auto/VTR'
      : isSOS
        ? 'Registrar saída SOS'
        : 'Registrar';

    if (!isSOS) {
      alternarTipoRegistro();
    }
  }

  function alternarTipoRegistro() {
    document.getElementById('tipoRegistro').value = 'Pessoa cadastrada';
    document.getElementById('areaPessoaCadastrada').classList.remove('oculto');
    document.getElementById('areaPessoaNaoEncontrada').classList.add('oculto');

    pessoaSelecionada = null;

    const resultado = document.getElementById('resultadoPessoa');
    resultado.innerHTML = '';
    resultado.classList.add('oculto');
    resultado.classList.remove('erro');

    preencherDestinos();
    preencherProcedencias();
  }

  function carregarListas() {
    google.script.run
      .withSuccessHandler((dados) => {
        destinos = dados.destinos || [];
        procedencias = dados.procedencias || [];
        preencherDestinos();
        preencherProcedencias();
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao carregar listas: ' + erro.message, 'erro');
      })
      .getListasFormulario();
  }

  function carregarDadosSOS() {
    google.script.run
      .withSuccessHandler((dados) => {
        viaturasSOS = dados.viaturas || [];
        militaresSOS = dados.militares || [];
        guarnicoesServico = dados.guarnicoesServico || [];
        cicloGuarnicoesServico = dados.ciclo || null;
        guarnicoesServicoCarregadas = true;
        renderizarSelecaoViaturasSOS();
        renderizarEditorGuarnicoesServico();
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao carregar viaturas de SOS: ' + erro.message, 'erro');
      })
      .getDadosSOS();
  }

  function renderizarSelecaoViaturasSOS() {
    const lista = document.getElementById('listaViaturasSOS');
    const configuracoes = document.getElementById('configuracoesViaturasSOS');

    if (!lista || !configuracoes) return;

    const retorno = tipoMovimentacaoAtual === 'Entrada';
    const situacaoNecessaria = retorno ? 'Em ocorrência' : 'No quartel';
    const disponiveis = viaturasSOS.filter(item => item.Situacao_Atual === situacaoNecessaria);
    document.getElementById('tituloSelecaoSOS').textContent = retorno
      ? 'Selecionar viaturas que retornaram'
      : 'Selecionar viaturas para saída';
    document.getElementById('btnRegistrarMovimentacao').textContent = retorno
      ? 'Registrar retorno SOS'
      : 'Registrar saída SOS';

    Object.keys(selecoesViaturasSOS).forEach(id => {
      if (!disponiveis.some(item => item.ID_Viatura === id)) {
        delete selecoesViaturasSOS[id];
      }
    });

    lista.innerHTML = '';

    if (!disponiveis.length) {
      lista.appendChild(criarEstadoVazioPainel(
        retorno
          ? 'Não há viaturas em ocorrência.'
          : 'Não há viaturas disponíveis no quartel.'
      ));
      configuracoes.innerHTML = '';
      return;
    }

    disponiveis.forEach(viatura => {
      const rotulo = document.createElement('label');
      rotulo.className = 'opcao-viatura-sos';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(selecoesViaturasSOS[viatura.ID_Viatura]);
      checkbox.onchange = () => alternarViaturaSOS(viatura, checkbox.checked);

      const texto = document.createElement('span');
      const prefixo = document.createElement('strong');
      prefixo.textContent = viatura.Prefixo;
      const descricao = document.createElement('small');
      descricao.textContent = viatura.Descricao || viatura.Situacao_Atual;
      texto.appendChild(prefixo);
      texto.appendChild(descricao);
      rotulo.appendChild(checkbox);
      rotulo.appendChild(texto);
      lista.appendChild(rotulo);
    });

    renderizarConfiguracoesSOS();
  }

  function alternarViaturaSOS(viatura, selecionada) {
    if (selecionada) {
      const padrao = guarnicoesServico.find(item => item.ID_Viatura === viatura.ID_Viatura);
      selecoesViaturasSOS[viatura.ID_Viatura] = {
        ID_Viatura: viatura.ID_Viatura,
        ID_Condutor: tipoMovimentacaoAtual === 'Entrada'
          ? viatura.ID_Condutor_Atual
          : (padrao ? padrao.ID_Condutor : ''),
        IDs_Guarnicao: tipoMovimentacaoAtual === 'Entrada'
          ? (viatura.IDs_Guarnicao_Atual || []).slice()
          : (padrao ? (padrao.IDs_Guarnicao || []).slice() : []),
        AtualizarGuarnicaoServico: false
      };
    } else {
      delete selecoesViaturasSOS[viatura.ID_Viatura];
    }

    renderizarConfiguracoesSOS();
  }

  function ordemAntiguidadeMilitarSOS(militar) {
    const ordem = Number(militar && militar.Ordem_Antiguidade);
    return Number.isFinite(ordem) && ordem > 0 ? ordem : Number.MAX_SAFE_INTEGER;
  }

  function compararMilitaresSOSPorAntiguidade(a, b) {
    const diferencaOrdem = ordemAntiguidadeMilitarSOS(a) - ordemAntiguidadeMilitarSOS(b);
    if (diferencaOrdem) return diferencaOrdem;

    const diferencaNome = String(a && a.Nome || '').localeCompare(
      String(b && b.Nome || ''),
      'pt-BR',
      { sensitivity: 'base' }
    );
    if (diferencaNome) return diferencaNome;

    return String(a && a.RG_CPF || '').localeCompare(String(b && b.RG_CPF || ''), 'pt-BR');
  }

  function ordenarMilitaresSOSPorAntiguidade(lista) {
    return (lista || []).slice().sort(compararMilitaresSOSPorAntiguidade);
  }

  function criarSelectMilitaresSOS(valorAtual, textoInicial) {
    const select = document.createElement('select');
    const inicial = document.createElement('option');
    inicial.value = '';
    inicial.textContent = textoInicial;
    select.appendChild(inicial);

    ordenarMilitaresSOSPorAntiguidade(militaresSOS).forEach(militar => {
      const option = document.createElement('option');
      option.value = militar.ID_Pessoa;
      option.textContent = militar.Nome + (militar.RG_CPF ? ' — ' + militar.RG_CPF : '');
      option.selected = militar.ID_Pessoa === valorAtual;
      select.appendChild(option);
    });

    return select;
  }

  function renderizarConfiguracoesSOS() {
    const area = document.getElementById('configuracoesViaturasSOS');
    area.innerHTML = '';

    Object.values(selecoesViaturasSOS).forEach(selecao => {
      const viatura = viaturasSOS.find(item => item.ID_Viatura === selecao.ID_Viatura);
      if (!viatura) return;

      const card = document.createElement('div');
      card.className = 'configuracao-viatura-sos';
      const titulo = document.createElement('strong');
      titulo.textContent = viatura.Prefixo + (viatura.Descricao ? ' — ' + viatura.Descricao : '');
      card.appendChild(titulo);

      const labelCondutor = document.createElement('label');
      labelCondutor.textContent = 'Condutor';
      const selectCondutor = criarSelectMilitaresSOS(selecao.ID_Condutor, 'Selecione o condutor');
      selectCondutor.disabled = tipoMovimentacaoAtual === 'Entrada';
      selectCondutor.onchange = () => {
        selecao.ID_Condutor = selectCondutor.value;
        selecao.IDs_Guarnicao = selecao.IDs_Guarnicao.filter(id => id !== selectCondutor.value);
        renderizarConfiguracoesSOS();
      };
      card.appendChild(labelCondutor);
      card.appendChild(selectCondutor);

      const labelGuarnicao = document.createElement('label');
      labelGuarnicao.textContent = 'Guarnição (opcional)';
      card.appendChild(labelGuarnicao);
      const linhaAdicionar = document.createElement('div');
      linhaAdicionar.className = 'linha-adicionar-guarnicao';
      const selectGuarnicao = criarSelectMilitaresSOS('', 'Selecione um integrante');
      Array.from(selectGuarnicao.options).forEach(option => {
        if (option.value && (
          option.value === selecao.ID_Condutor ||
          selecao.IDs_Guarnicao.includes(option.value)
        )) {
          option.remove();
        }
      });
      const adicionar = document.createElement('button');
      adicionar.type = 'button';
      adicionar.textContent = 'Adicionar';
      adicionar.onclick = () => {
        if (selectGuarnicao.value) {
          selecao.IDs_Guarnicao.push(selectGuarnicao.value);
          renderizarConfiguracoesSOS();
        }
      };
      linhaAdicionar.appendChild(selectGuarnicao);
      linhaAdicionar.appendChild(adicionar);
      card.appendChild(linhaAdicionar);

      const chips = document.createElement('div');
      chips.className = 'chips-guarnicao';
      selecao.IDs_Guarnicao.forEach(id => {
        const militar = militaresSOS.find(item => item.ID_Pessoa === id);
        if (!militar) return;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.textContent = militar.Nome + ' ×';
        chip.onclick = () => {
          selecao.IDs_Guarnicao = selecao.IDs_Guarnicao.filter(item => item !== id);
          renderizarConfiguracoesSOS();
        };
        chips.appendChild(chip);
      });
      card.appendChild(chips);

      if (tipoMovimentacaoAtual !== 'Entrada') {
        const opcaoAtualizar = document.createElement('label');
        opcaoAtualizar.className = 'opcao-atualizar-guarnicao';
        const checkboxAtualizar = document.createElement('input');
        checkboxAtualizar.type = 'checkbox';
        checkboxAtualizar.checked = selecao.AtualizarGuarnicaoServico === true;
        checkboxAtualizar.onchange = () => {
          selecao.AtualizarGuarnicaoServico = checkboxAtualizar.checked;
        };
        const textoAtualizar = document.createElement('span');
        textoAtualizar.textContent = 'Usar esta composição também nas próximas saídas até as 08h. Desmarcado, vale somente para este SOS.';
        opcaoAtualizar.appendChild(checkboxAtualizar);
        opcaoAtualizar.appendChild(textoAtualizar);
        card.appendChild(opcaoAtualizar);
      }
      area.appendChild(card);
    });
  }

  function registrarSOS() {
    if (!garantirPermissaoOperacionalAtual()) return;
    const geracaoSessao = geracaoSessaoEquipe;

    const viaturas = Object.values(selecoesViaturasSOS);

    if (!viaturas.length) {
      mostrarMensagem('Selecione ao menos uma viatura.', 'erro');
      return;
    }

    if (viaturas.some(item => !item.ID_Condutor)) {
      mostrarMensagem('Selecione o condutor de cada viatura.', 'erro');
      return;
    }

    const botao = document.getElementById('btnRegistrarMovimentacao');
    botao.disabled = true;
    botao.textContent = 'Registrando...';

    google.script.run
      .withSuccessHandler((resposta) => {
        if (!respostaPertenceASessaoEquipe(geracaoSessao)) {
          botao.disabled = false;
          carregarIdentidadesEquipeServico(true);
          return;
        }
        mostrarMensagem(resposta.mensagem || 'SOS registrado com sucesso.', 'sucesso');
        viaturasSOS = resposta.dadosSOS ? resposta.dadosSOS.viaturas || [] : viaturasSOS;
        militaresSOS = resposta.dadosSOS ? resposta.dadosSOS.militares || [] : militaresSOS;
        guarnicoesServico = resposta.dadosSOS ? resposta.dadosSOS.guarnicoesServico || [] : guarnicoesServico;
        cicloGuarnicoesServico = resposta.dadosSOS ? resposta.dadosSOS.ciclo || cicloGuarnicoesServico : cicloGuarnicoesServico;
        statusToqueFogoAtual = resposta.statusToque || statusToqueFogoAtual;
        if (resposta.statusToque) {
          estadoToqueFogoCarregado = true;
          atualizarTelaToqueFogo();
        }
        selecoesViaturasSOS = {};
        document.getElementById('observacoesSOS').value = '';
        renderizarSelecaoViaturasSOS();
        renderizarEditorGuarnicoesServico();
        carregarPessoasDentroGuarda(true);
        carregarMovimentacoesGuarda(true);
        carregarPainelComandante(true);
        carregarIdentidadesEquipeServico(true);
        botao.disabled = false;
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao registrar SOS: ' + erro.message, 'erro');
        botao.disabled = false;
        renderizarSelecaoViaturasSOS();
      })
      .registrarMovimentacaoSOS({
        tipoSOS: tipoMovimentacaoAtual === 'Entrada' ? 'Retorno' : 'Saída',
        viaturas: viaturas,
        observacoes: document.getElementById('observacoesSOS').value.trim(),
        motivoAlteracaoGuarnicao: document.getElementById('observacoesSOS').value.trim()
      });
  }

  function aparelhoPodeConfigurarGuarnicoesServico() {
    return aparelhoPodeOperarGuardaAtual() || aparelhoAssumiuComandanteAtual();
  }

  function definirEditorGuarnicoesServicoRecolhido(recolhido) {
    const bloco = document.getElementById('blocoEditorGuarnicoesServico');
    const conteudo = document.getElementById('conteudoEditorGuarnicoesServico');
    const botao = document.getElementById('btnAlternarEditorGuarnicoesServico');
    const titulo = document.getElementById('textoAlternarEditorGuarnicoesServico');
    const descricao = document.getElementById('descricaoAlternarEditorGuarnicoesServico');

    if (!bloco || !conteudo || !botao) return;

    if (recolhido && conteudo.contains(document.activeElement)) botao.focus();
    conteudo.hidden = recolhido;
    bloco.classList.toggle('recolhido', recolhido);
    botao.setAttribute('aria-expanded', recolhido ? 'false' : 'true');

    if (titulo) titulo.textContent = recolhido
      ? 'Lançar ou alterar guarnição'
      : 'Fechar lançamento';
    if (descricao) descricao.textContent = recolhido
      ? 'Abra somente quando precisar incluir ou editar uma VTR'
      : 'Selecione a VTR, o condutor e os integrantes';
  }

  function alternarEditorGuarnicoesServico() {
    const conteudo = document.getElementById('conteudoEditorGuarnicoesServico');
    if (!conteudo) return;
    definirEditorGuarnicoesServicoRecolhido(!conteudo.hidden);
  }

  function definirGuarnicoesServicoRecolhido(recolhido) {
    const card = document.getElementById('cardGuarnicoesServico');
    const conteudo = document.getElementById('conteudoGuarnicoesServico');
    const botao = document.getElementById('btnAlternarGuarnicoesServico');

    if (!card || !conteudo || !botao) return;

    if (recolhido) definirEditorGuarnicoesServicoRecolhido(true);
    if (recolhido && conteudo.contains(document.activeElement)) botao.focus();
    conteudo.hidden = recolhido;
    card.classList.toggle('recolhido', recolhido);
    botao.setAttribute('aria-expanded', recolhido ? 'false' : 'true');
    localStorage.setItem('guarnicoes_servico_recolhido', recolhido ? 'sim' : 'nao');
  }

  function alternarGuarnicoesServico() {
    const conteudo = document.getElementById('conteudoGuarnicoesServico');
    if (!conteudo) return;
    definirGuarnicoesServicoRecolhido(!conteudo.hidden);
  }

  function restaurarEstadoGuarnicoesServico() {
    definirGuarnicoesServicoRecolhido(
      localStorage.getItem('guarnicoes_servico_recolhido') === 'sim'
    );
  }

  function atualizarVisibilidadeGuarnicoesServico() {
    const card = document.getElementById('cardGuarnicoesServico');
    if (!card) return;

    const estavaOculto = card.classList.contains('oculto');
    const podeConfigurar = aparelhoPodeConfigurarGuarnicoesServico();
    card.classList.toggle('oculto', !podeConfigurar);

    if (!podeConfigurar) {
      definirEditorGuarnicoesServicoRecolhido(true);
      return;
    }

    if (podeConfigurar && !guarnicoesServicoCarregadas) {
      restaurarEstadoGuarnicoesServico();
      carregarGuarnicoesServico(true);
    } else if (podeConfigurar && estavaOculto) {
      restaurarEstadoGuarnicoesServico();
      renderizarEditorGuarnicoesServico();
    }
  }

  function carregarGuarnicoesServico(silencioso = false) {
    const botao = document.getElementById('btnAtualizarGuarnicoesServico');
    if (botao) {
      botao.disabled = true;
      botao.textContent = 'Atualizando...';
    }

    google.script.run
      .withSuccessHandler((dados) => {
        viaturasSOS = dados.viaturas || [];
        militaresSOS = dados.militares || [];
        guarnicoesServico = dados.guarnicoesServico || [];
        cicloGuarnicoesServico = dados.ciclo || null;
        guarnicoesServicoCarregadas = true;
        renderizarEditorGuarnicoesServico();
        if (botao) {
          botao.disabled = false;
          botao.textContent = 'Atualizar';
        }
      })
      .withFailureHandler((erro) => {
        if (!silencioso) mostrarMensagem('Erro ao carregar guarnições: ' + erro.message, 'erro');
        if (botao) {
          botao.disabled = false;
          botao.textContent = 'Atualizar';
        }
      })
      .getDadosSOS();
  }

  function renderizarEditorGuarnicoesServico() {
    const card = document.getElementById('cardGuarnicoesServico');
    if (!card || card.classList.contains('oculto')) return;

    const ciclo = document.getElementById('cicloGuarnicoesServico');
    ciclo.textContent = cicloGuarnicoesServico
      ? `${cicloGuarnicoesServico.inicio} até ${cicloGuarnicoesServico.fim}`
      : 'Ciclo das 08h às 08h';

    const resumo = document.getElementById('resumoGuarnicoesServico');
    resumo.innerHTML = '';
    if (!guarnicoesServico.length) {
      resumo.appendChild(criarEstadoVazioPainel('Nenhuma guarnição padrão cadastrada para este serviço.'));
    } else {
      guarnicoesServico.forEach(configuracao => {
        const item = document.createElement('div');
        item.className = 'resumo-guarnicao-servico';
        const nomes = (configuracao.Guarnicao || []).map(pessoa => pessoa.nome).filter(Boolean);
        item.innerHTML = '<strong>' + escaparHtml(configuracao.Prefixo || 'VTR') + '</strong>' +
          'Condutor: ' + escaparHtml(configuracao.Nome_Condutor || '-') + '<br>' +
          'Guarnição: ' + escaparHtml(nomes.join(', ') || 'Sem integrantes adicionais');
        resumo.appendChild(item);
      });
    }

    const selectViatura = document.getElementById('viaturaGuarnicaoServico');
    const idAtual = selectViatura.value;
    selectViatura.innerHTML = '';
    viaturasSOS.forEach(viatura => {
      const option = document.createElement('option');
      option.value = viatura.ID_Viatura;
      option.textContent = viatura.Prefixo + (viatura.Descricao ? ' — ' + viatura.Descricao : '');
      selectViatura.appendChild(option);
    });
    if (idAtual && viaturasSOS.some(item => item.ID_Viatura === idAtual)) selectViatura.value = idAtual;
    selecionarViaturaGuarnicaoServico();
  }

  function selecionarViaturaGuarnicaoServico() {
    const idViatura = document.getElementById('viaturaGuarnicaoServico').value;
    const configuracao = guarnicoesServico.find(item => item.ID_Viatura === idViatura);
    idsGuarnicaoServicoEdicao = configuracao ? (configuracao.IDs_Guarnicao || []).slice() : [];

    const areaCondutor = document.getElementById('condutorGuarnicaoServico');
    const novoCondutor = criarSelectMilitaresSOS(
      configuracao ? configuracao.ID_Condutor : '', 'Selecione o condutor'
    );
    areaCondutor.innerHTML = novoCondutor.innerHTML;
    areaCondutor.value = configuracao ? configuracao.ID_Condutor : '';
    areaCondutor.onchange = () => {
      idsGuarnicaoServicoEdicao = idsGuarnicaoServicoEdicao.filter(id => id !== areaCondutor.value);
      renderizarIntegrantesGuarnicaoServico();
      atualizarBotoesSeletoresMilitaresGuarnicaoServico();
    };
    renderizarIntegrantesGuarnicaoServico();
    atualizarBotoesSeletoresMilitaresGuarnicaoServico();
  }

  function renderizarIntegrantesGuarnicaoServico() {
    const condutorId = document.getElementById('condutorGuarnicaoServico').value;
    const select = document.getElementById('integranteGuarnicaoServico');
    const novo = criarSelectMilitaresSOS('', 'Selecione um integrante');
    Array.from(novo.options).forEach(option => {
      if (option.value && (option.value === condutorId || idsGuarnicaoServicoEdicao.includes(option.value))) {
        option.remove();
      }
    });
    select.innerHTML = novo.innerHTML;

    const chips = document.getElementById('chipsGuarnicaoServico');
    chips.innerHTML = '';
    idsGuarnicaoServicoEdicao.forEach(id => {
      const militar = militaresSOS.find(item => item.ID_Pessoa === id);
      if (!militar) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.textContent = militar.Nome + ' ×';
      chip.setAttribute('aria-label', 'Remover ' + militar.Nome + ' da guarnição');
      chip.onclick = () => {
        idsGuarnicaoServicoEdicao = idsGuarnicaoServicoEdicao.filter(item => item !== id);
        renderizarIntegrantesGuarnicaoServico();
      };
      chips.appendChild(chip);
    });

    atualizarBotoesSeletoresMilitaresGuarnicaoServico();
  }

  function adicionarIntegranteGuarnicaoServico() {
    const select = document.getElementById('integranteGuarnicaoServico');
    if (!select.value) return;
    idsGuarnicaoServicoEdicao.push(select.value);
    renderizarIntegrantesGuarnicaoServico();
  }

  function obterMilitarSOSPorId(idPessoa) {
    const id = String(idPessoa || '');
    return militaresSOS.find(item => String(item.ID_Pessoa || '') === id) || null;
  }

  function textoMilitarSeletorGuarnicao(militar, textoPadrao) {
    if (!militar) return textoPadrao;
    const rg = String(militar.RG_CPF || '').trim();
    return militar.Nome + (rg ? ' — RG ' + rg : '');
  }

  function atualizarBotoesSeletoresMilitaresGuarnicaoServico() {
    const selectCondutor = document.getElementById('condutorGuarnicaoServico');
    const selectIntegrante = document.getElementById('integranteGuarnicaoServico');
    const textoCondutor = document.getElementById('textoCondutorGuarnicaoServico');
    const textoIntegrante = document.getElementById('textoIntegranteGuarnicaoServico');

    if (selectCondutor && textoCondutor) {
      textoCondutor.textContent = textoMilitarSeletorGuarnicao(
        obterMilitarSOSPorId(selectCondutor.value),
        'Selecione o condutor'
      );
    }

    if (selectIntegrante && textoIntegrante) {
      textoIntegrante.textContent = textoMilitarSeletorGuarnicao(
        obterMilitarSOSPorId(selectIntegrante.value),
        'Selecione um integrante'
      );
    }
  }

  function normalizarRgSeletorGuarnicao(valor) {
    return String(valor || '').replace(/\D/g, '');
  }

  function normalizarTextoSeletorGuarnicao(valor) {
    return String(valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleUpperCase('pt-BR')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function militaresDisponiveisNoSeletorGuarnicaoServico() {
    let militaresDisponiveis = militaresSOS.slice();

    if (tipoSeletorMilitarGuarnicaoServico === 'integrante') {
      const idCondutor = String(document.getElementById('condutorGuarnicaoServico').value || '');
      const idsIndisponiveis = new Set(
        [idCondutor].concat(idsGuarnicaoServicoEdicao).filter(Boolean).map(String)
      );
      militaresDisponiveis = militaresDisponiveis.filter(
        militar => !idsIndisponiveis.has(String(militar.ID_Pessoa || ''))
      );
    }

    return ordenarMilitaresSOSPorAntiguidade(militaresDisponiveis);
  }

  function abrirSeletorMilitarGuarnicaoServico(tipo) {
    if (tipo !== 'condutor' && tipo !== 'integrante') return;

    tipoSeletorMilitarGuarnicaoServico = tipo;
    focoAntesDoSeletorMilitarGuarnicao = document.activeElement;

    document.getElementById('tituloSeletorMilitarGuarnicao').textContent = tipo === 'condutor'
      ? 'Selecionar condutor'
      : 'Selecionar integrante';
    document.getElementById('buscaRgSeletorMilitarGuarnicao').value = '';
    renderizarListaSeletorMilitarGuarnicaoServico();
    const modal = document.getElementById('modalSeletorMilitarGuarnicao');
    modal.classList.remove('oculto');

    setTimeout(() => {
      const usaMouse = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const alvoFoco = usaMouse
        ? document.getElementById('buscaRgSeletorMilitarGuarnicao')
        : modal.querySelector('.fechar-seletor-militar');
      if (alvoFoco) alvoFoco.focus();
    }, 50);
  }

  function fecharSeletorMilitarGuarnicaoServico() {
    const modal = document.getElementById('modalSeletorMilitarGuarnicao');
    if (modal) modal.classList.add('oculto');
    tipoSeletorMilitarGuarnicaoServico = '';

    if (focoAntesDoSeletorMilitarGuarnicao && typeof focoAntesDoSeletorMilitarGuarnicao.focus === 'function') {
      focoAntesDoSeletorMilitarGuarnicao.focus();
    }
    focoAntesDoSeletorMilitarGuarnicao = null;
  }

  function renderizarListaSeletorMilitarGuarnicaoServico() {
    const lista = document.getElementById('listaSeletorMilitarGuarnicao');
    const resumo = document.getElementById('resumoSeletorMilitarGuarnicao');
    const campoBusca = document.getElementById('buscaRgSeletorMilitarGuarnicao');
    if (!lista || !resumo || !campoBusca || !tipoSeletorMilitarGuarnicaoServico) return;

    const termoBusca = String(campoBusca.value || '').trim();
    const filtroNome = normalizarTextoSeletorGuarnicao(termoBusca);
    const filtroRg = normalizarRgSeletorGuarnicao(termoBusca);
    const militares = militaresDisponiveisNoSeletorGuarnicaoServico().filter(militar => {
      if (!termoBusca) return true;

      const correspondeNome = normalizarTextoSeletorGuarnicao(militar.Nome).includes(filtroNome);
      const correspondeRg = filtroRg && normalizarRgSeletorGuarnicao(militar.RG_CPF).includes(filtroRg);
      return correspondeNome || correspondeRg;
    });
    const selectAtual = document.getElementById(
      tipoSeletorMilitarGuarnicaoServico === 'condutor'
        ? 'condutorGuarnicaoServico'
        : 'integranteGuarnicaoServico'
    );
    const idSelecionado = selectAtual ? String(selectAtual.value || '') : '';

    resumo.textContent = militares.length === 1
      ? '1 militar encontrado'
      : militares.length + ' militares encontrados';
    lista.innerHTML = '';

    if (!militares.length) {
      const vazio = document.createElement('div');
      vazio.className = 'vazio-seletor-militar';
      vazio.innerHTML = '<strong>Nenhum militar encontrado</strong><span>Confira o nome ou RG digitado ou apague a busca para ver a lista completa.</span>';
      lista.appendChild(vazio);
      return;
    }

    if (idSelecionado) {
      const limpar = document.createElement('button');
      limpar.type = 'button';
      limpar.className = 'limpar-selecao-militar';
      limpar.textContent = tipoSeletorMilitarGuarnicaoServico === 'condutor'
        ? 'Limpar condutor selecionado'
        : 'Limpar integrante selecionado';
      limpar.onclick = limparSelecaoMilitarGuarnicaoServico;
      lista.appendChild(limpar);
    }

    militares.forEach(militar => {
      const idMilitar = String(militar.ID_Pessoa || '');
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'opcao-seletor-militar';
      botao.setAttribute('aria-pressed', idMilitar === idSelecionado ? 'true' : 'false');
      if (idMilitar === idSelecionado) botao.classList.add('selecionada');

      const nome = document.createElement('strong');
      nome.textContent = militar.Nome || 'Militar sem nome';
      const rg = document.createElement('span');
      rg.textContent = militar.RG_CPF ? 'RG ' + militar.RG_CPF : 'RG não informado';
      botao.appendChild(nome);
      botao.appendChild(rg);
      botao.onclick = () => selecionarMilitarNoSeletorGuarnicaoServico(idMilitar);
      lista.appendChild(botao);
    });
  }

  function limparSelecaoMilitarGuarnicaoServico() {
    const ehCondutor = tipoSeletorMilitarGuarnicaoServico === 'condutor';
    const select = document.getElementById(
      ehCondutor ? 'condutorGuarnicaoServico' : 'integranteGuarnicaoServico'
    );
    if (!select) return;

    select.value = '';
    if (ehCondutor && typeof select.onchange === 'function') select.onchange();
    atualizarBotoesSeletoresMilitaresGuarnicaoServico();
    fecharSeletorMilitarGuarnicaoServico();
  }

  function selecionarMilitarNoSeletorGuarnicaoServico(idMilitar) {
    const ehCondutor = tipoSeletorMilitarGuarnicaoServico === 'condutor';
    const select = document.getElementById(
      ehCondutor ? 'condutorGuarnicaoServico' : 'integranteGuarnicaoServico'
    );
    if (!select) return;

    select.value = String(idMilitar || '');
    if (ehCondutor && typeof select.onchange === 'function') select.onchange();
    atualizarBotoesSeletoresMilitaresGuarnicaoServico();
    fecharSeletorMilitarGuarnicaoServico();
  }

  function salvarGuarnicaoServico() {
    const idViatura = document.getElementById('viaturaGuarnicaoServico').value;
    const idCondutor = document.getElementById('condutorGuarnicaoServico').value;
    if (!idViatura || !idCondutor) {
      mostrarMensagem('Selecione a VTR e o condutor.', 'erro');
      return;
    }

    const botao = document.getElementById('btnSalvarGuarnicaoServico');
    botao.disabled = true;
    botao.textContent = 'Salvando...';
    google.script.run
      .withSuccessHandler((resposta) => {
        const dados = resposta.dadosSOS || {};
        viaturasSOS = dados.viaturas || viaturasSOS;
        militaresSOS = dados.militares || militaresSOS;
        guarnicoesServico = dados.guarnicoesServico || guarnicoesServico;
        cicloGuarnicoesServico = dados.ciclo || cicloGuarnicoesServico;
        document.getElementById('motivoGuarnicaoServico').value = '';
        renderizarEditorGuarnicoesServico();
        definirEditorGuarnicoesServicoRecolhido(true);
        botao.disabled = false;
        botao.textContent = 'Salvar para o serviço';
        mostrarMensagem(resposta.mensagem || 'Guarnição atualizada.', 'sucesso');
      })
      .withFailureHandler((erro) => {
        botao.disabled = false;
        botao.textContent = 'Salvar para o serviço';
        mostrarMensagem('Erro ao salvar guarnição: ' + erro.message, 'erro');
      })
      .salvarGuarnicoesServico({
        viaturas: [{
          ID_Viatura: idViatura,
          ID_Condutor: idCondutor,
          IDs_Guarnicao: idsGuarnicaoServicoEdicao.slice()
        }],
        motivo: document.getElementById('motivoGuarnicaoServico').value.trim()
      });
  }

  function preencherDestinos() {
    const select = document.getElementById('destino');
    const pessoaExterna = pessoaPrincipalEhExterna();

    select.innerHTML = '';

    const lista = destinos.filter(item => {
      const ativo = String(item.Ativo).toLowerCase() === 'sim';
      const mesmoTipo = item.Tipo_Movimentacao === tipoMovimentacaoAtual;
      const permitido = !pessoaExterna || String(item.Permitido_Para_Visitante).toLowerCase() === 'sim';
      return ativo && mesmoTipo && permitido;
    });

    lista.sort((a, b) => {
      if (tipoMovimentacaoAtual === 'Saída' && modoRegistroAtual === 'Individual') {
        const folgaA = normalizarTextoSeletorGuarnicao(a.Destino) === 'FOLGA';
        const folgaB = normalizarTextoSeletorGuarnicao(b.Destino) === 'FOLGA';
        if (folgaA !== folgaB) return folgaA ? -1 : 1;
      }

      return Number(a.Ordem || 999) - Number(b.Ordem || 999);
    });

    lista.forEach(item => {
      const option = document.createElement('option');
      option.value = item.Destino;
      option.textContent = item.Destino;
      select.appendChild(option);
    });
  }

  function preencherProcedencias() {
    const select = document.getElementById('procedencia');
    const pessoaExterna = pessoaPrincipalEhExterna();

    select.innerHTML = '';

    const lista = procedencias.filter(item => {
      const ativo = String(item.Ativo).toLowerCase() === 'sim';
      const mesmoTipo = item.Tipo_Movimentacao === tipoMovimentacaoAtual;
      const permitido = !pessoaExterna || String(item.Permitido_Para_Visitante).toLowerCase() === 'sim';
      return ativo && mesmoTipo && permitido;
    });

    lista.sort((a, b) => Number(a.Ordem || 999) - Number(b.Ordem || 999));

    lista.forEach(item => {
      const option = document.createElement('option');
      option.value = item.Procedência;
      option.textContent = item.Procedência;
      option.dataset.exigeComplemento = item.Exige_Complemento;
      select.appendChild(option);
    });

    verificarComplementoProcedencia();
  }

  function verificarComplementoProcedencia() {
    const select = document.getElementById('procedencia');
    const option = select.options[select.selectedIndex];

    if (!option) return;

    const exige = String(option.dataset.exigeComplemento).toLowerCase() === 'sim';
    document.getElementById('areaComplementoProcedencia').classList.toggle('oculto', !exige);

    const label = document.getElementById('labelComplementoProcedencia');
    const valor = option.value;

    if (valor === 'Empresa terceirizada') {
      label.textContent = 'Qual empresa?';
    } else if (valor === 'Outra OBM') {
      label.textContent = 'Qual OBM?';
    } else {
      label.textContent = 'Complemento da procedência';
    }
  }

  function pessoaPrincipalEhExterna() {
    if (modoRegistroAtual !== 'Individual') return false;
    return categoriaPessoaIndividualAtual !== 'Militar';
  }

  function selecionarCategoriaPessoa(categoria) {
    clearTimeout(temporizadorSugestaoPessoa);
    numeroBuscaPessoa++;
    categoriaPessoaIndividualAtual = ['Colaborador', 'Visitante'].includes(categoria)
      ? categoria
      : 'Militar';
    document.getElementById('btnCategoriaMilitar').classList.toggle('ativo', categoriaPessoaIndividualAtual === 'Militar');
    document.getElementById('btnCategoriaColaborador').classList.toggle('ativo', categoriaPessoaIndividualAtual === 'Colaborador');
    document.getElementById('btnCategoriaVisitante').classList.toggle('ativo', categoriaPessoaIndividualAtual === 'Visitante');
    pessoaSelecionada = null;
    document.getElementById('rgCpfBusca').value = '';
    document.getElementById('resultadoPessoa').innerHTML = '';
    document.getElementById('resultadoPessoa').classList.add('oculto');
    document.getElementById('areaPessoaNaoEncontrada').classList.add('oculto');
    document.getElementById('rgCpfPessoaNaoEncontrada').value = '';
    document.getElementById('nomePessoaNaoEncontrada').value = '';
    preencherDestinos();
    preencherProcedencias();
  }

  function termoBuscaPessoaValido(termo) {
    const texto = String(termo || '').trim();
    const digitos = texto.replace(/\D/g, '');
    return texto.length >= 2 || digitos.length >= 2;
  }

  function termoBuscaPessoaPareceDocumento(termo) {
    const texto = String(termo || '').trim();
    const digitos = texto.replace(/\D/g, '');
    const textoSemRotulos = texto.replace(/\b(?:rg|cpf)\b/gi, '');
    const caracteresNaoDocumento = textoSemRotulos.replace(/[\d.\-/\s]/g, '');
    return digitos.length >= 3 && !caracteresNaoDocumento;
  }

  function prepararCadastroPessoaNaoEncontrada(termo) {
    const campoDocumento = document.getElementById('rgCpfPessoaNaoEncontrada');
    const campoNome = document.getElementById('nomePessoaNaoEncontrada');

    if (termoBuscaPessoaPareceDocumento(termo)) {
      campoDocumento.value = String(termo || '').trim();
      campoNome.value = '';
      campoNome.focus();
      return;
    }

    campoDocumento.value = '';
    campoNome.value = String(termo || '').trim();
    campoDocumento.focus();
  }

  function sugerirPessoasEnquantoDigita() {
    clearTimeout(temporizadorSugestaoPessoa);
    numeroBuscaPessoa++;
    pessoaSelecionada = null;
    document.getElementById('areaPessoaNaoEncontrada').classList.add('oculto');
    document.getElementById('rgCpfPessoaNaoEncontrada').value = '';
    document.getElementById('nomePessoaNaoEncontrada').value = '';
    const resultado = document.getElementById('resultadoPessoa');
    resultado.innerHTML = '';
    resultado.classList.add('oculto');
    const termo = document.getElementById('rgCpfBusca').value.trim();
    if (!termoBuscaPessoaValido(termo)) return;
    temporizadorSugestaoPessoa = setTimeout(() => buscarPessoa(true), 350);
  }

  function buscarPessoa(somenteSugestao = false) {
    if (!somenteSugestao) {
      clearTimeout(temporizadorSugestaoPessoa);
    }

    const rgCpf = document.getElementById('rgCpfBusca').value.trim();

    if (!termoBuscaPessoaValido(rgCpf)) {
      if (!somenteSugestao) mostrarMensagem('Digite pelo menos 2 caracteres do nome ou do RG/CPF.', 'erro');
      return;
    }

    const idBusca = ++numeroBuscaPessoa;

    google.script.run
      .withSuccessHandler((pessoas) => {
        if (idBusca !== numeroBuscaPessoa) return;
        const resultado = document.getElementById('resultadoPessoa');
        resultado.classList.remove('oculto', 'erro');
        resultado.innerHTML = '';

        pessoaSelecionada = null;
        document.getElementById('areaPessoaNaoEncontrada').classList.add('oculto');

        if (modoRegistroAtual === 'Viatura') {
          pessoas = (pessoas || []).filter(pessoa => {
            return String(pessoa.Tipo_Pessoa || '').trim().toLowerCase() === 'militar';
          });
        }

        if (!pessoas || pessoas.length === 0) {
          if (somenteSugestao) {
            resultado.classList.add('oculto');
            return;
          }
          resultado.classList.add('erro');
          resultado.textContent = `${categoriaPessoaIndividualAtual} não encontrado(a).`;
          if (modoRegistroAtual === 'Individual') {
            document.getElementById('avisoPessoaNaoEncontrada').textContent =
              `${categoriaPessoaIndividualAtual} não encontrado(a). Confira o RG/CPF e o nome para cadastrar automaticamente.`;
            document.getElementById('areaPessoaNaoEncontrada').classList.remove('oculto');
            prepararCadastroPessoaNaoEncontrada(rgCpf);
            preencherDestinos();
            preencherProcedencias();
          }
          return;
        }

        pessoas.forEach(pessoa => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'item-pessoa';
          item.textContent = `${pessoa.Nome} — ${pessoa.RG_CPF} • ${pessoa.Tipo_Pessoa}`;
          item.onclick = () => selecionarPessoaEncontrada(pessoa);

          resultado.appendChild(item);
        });
      })
      .withFailureHandler((erro) => {
        if (idBusca === numeroBuscaPessoa && !somenteSugestao) {
          mostrarMensagem('Erro ao buscar pessoa: ' + erro.message, 'erro');
        }
      })
      .buscarPessoasPorRgCpf(rgCpf, modoRegistroAtual === 'Individual' ? categoriaPessoaIndividualAtual : 'Militar');
  }

  function selecionarPessoaEncontrada(pessoa) {
    if (
      modoRegistroAtual === 'Viatura' &&
      ocupantesViatura.some(item => item.chaveLista === criarChaveParticipanteViatura(pessoa))
    ) {
      mostrarMensagem('Este militar já foi adicionado como ocupante.', 'erro');
      return;
    }

    if (modoRegistroAtual === 'Viatura') {
      condutorExternoAtivo = false;
      document.getElementById('areaCondutorExterno').classList.add('oculto');
      document.getElementById('campoBuscaPessoaPrincipal').classList.remove('oculto');
      document.getElementById('areaOpcaoCondutorExterno').classList.remove('oculto');
    }

    if (modoRegistroAtual === 'Individual') {
      const categoriaEncontrada = ['Colaborador', 'Visitante'].includes(pessoa.Tipo_Pessoa)
        ? pessoa.Tipo_Pessoa
        : 'Militar';
      categoriaPessoaIndividualAtual = categoriaEncontrada;
      document.getElementById('btnCategoriaMilitar').classList.toggle('ativo', categoriaEncontrada === 'Militar');
      document.getElementById('btnCategoriaColaborador').classList.toggle('ativo', categoriaEncontrada === 'Colaborador');
      document.getElementById('btnCategoriaVisitante').classList.toggle('ativo', categoriaEncontrada === 'Visitante');
    }

    pessoaSelecionada = pessoa;
    document.getElementById('areaPessoaNaoEncontrada').classList.add('oculto');
    document.getElementById('rgCpfPessoaNaoEncontrada').value = '';
    document.getElementById('nomePessoaNaoEncontrada').value = '';
    preencherDestinos();
    preencherProcedencias();

    const resultado = document.getElementById('resultadoPessoa');
    resultado.classList.remove('erro');
    resultado.innerHTML = `
      <div class="pessoa-selecionada">
        Selecionado: ${escaparHtml(pessoa.Nome)} — ${escaparHtml(pessoa.RG_CPF)}
      </div>
    `;
  }

  function alternarCondutorExterno() {
    condutorExternoAtivo = !condutorExternoAtivo;
    pessoaSelecionada = null;

    document.getElementById('campoBuscaPessoaPrincipal').classList.toggle('oculto', condutorExternoAtivo);
    document.getElementById('areaOpcaoCondutorExterno').classList.toggle('oculto', condutorExternoAtivo);
    document.getElementById('areaCondutorExterno').classList.toggle('oculto', !condutorExternoAtivo);
    document.getElementById('resultadoPessoa').innerHTML = '';
    document.getElementById('resultadoPessoa').classList.add('oculto');

    if (!condutorExternoAtivo) {
      document.getElementById('nomeCondutorExterno').value = '';
      document.getElementById('rgCondutorExterno').value = '';
    }
  }

  function buscarOcupanteViatura() {
    const rgCpf = document.getElementById('rgCpfBuscaOcupante').value.trim();

    if (!rgCpf || rgCpf.replace(/\D/g, '').length < 3) {
      mostrarMensagem('Digite pelo menos 3 dígitos do RG/CPF do ocupante.', 'erro');
      return;
    }

    google.script.run
      .withSuccessHandler((pessoas) => {
        const resultado = document.getElementById('resultadoOcupanteViatura');
        resultado.classList.remove('oculto', 'erro');
        resultado.innerHTML = '';

        pessoas = (pessoas || []).filter(pessoa => {
          return String(pessoa.Tipo_Pessoa || '').trim().toLowerCase() === 'militar';
        });

        if (!pessoas || pessoas.length === 0) {
          resultado.classList.add('erro');
          resultado.textContent = 'Nenhum ocupante encontrado.';
          return;
        }

        pessoas.forEach(pessoa => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'item-pessoa';
          item.textContent = `${pessoa.Nome} — ${pessoa.RG_CPF}`;
          item.onclick = () => adicionarOcupanteViatura(pessoa);
          resultado.appendChild(item);
        });
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao buscar ocupante: ' + erro.message, 'erro');
      })
      .buscarPessoasPorRgCpf(rgCpf);
  }

  function adicionarOcupanteViatura(pessoa) {
    const participante = Object.assign({}, pessoa, {
      origem: 'Cadastro',
      chaveLista: criarChaveParticipanteViatura(pessoa)
    });

    if (pessoaSelecionada && criarChaveParticipanteViatura(pessoaSelecionada) === participante.chaveLista) {
      mostrarMensagem('O condutor não pode ser adicionado também como ocupante.', 'erro');
      return;
    }

    if (ocupantesViatura.some(item => item.chaveLista === participante.chaveLista)) {
      mostrarMensagem('Este militar já está na lista de ocupantes.', 'erro');
      return;
    }

    ocupantesViatura.push(participante);
    document.getElementById('rgCpfBuscaOcupante').value = '';
    document.getElementById('resultadoOcupanteViatura').innerHTML = '';
    document.getElementById('resultadoOcupanteViatura').classList.add('oculto');
    renderizarOcupantesViatura();
    document.getElementById('rgCpfBuscaOcupante').focus();
  }

  function alternarFormularioOcupanteExterno() {
    const area = document.getElementById('areaOcupanteExterno');
    area.classList.toggle('oculto');

    if (area.classList.contains('oculto')) {
      document.getElementById('nomeOcupanteExterno').value = '';
      document.getElementById('rgOcupanteExterno').value = '';
    }
  }

  function adicionarOcupanteExterno() {
    const nome = document.getElementById('nomeOcupanteExterno').value.trim().toUpperCase();
    const rgCpf = document.getElementById('rgOcupanteExterno').value.trim();

    if (!nome || !rgCpf) {
      mostrarMensagem('Informe o nome e o documento do ocupante externo.', 'erro');
      return;
    }

    const participante = {
      origem: 'Manual',
      Nome: nome,
      RG_CPF: rgCpf,
      Tipo_Pessoa: 'Militar externo'
    };
    participante.chaveLista = criarChaveParticipanteViatura(participante);

    const chaveCondutor = pessoaSelecionada
      ? criarChaveParticipanteViatura(pessoaSelecionada)
      : criarChaveParticipanteViatura({
          RG_CPF: document.getElementById('rgCondutorExterno').value.trim()
        });

    if (chaveCondutor && chaveCondutor === participante.chaveLista) {
      mostrarMensagem('O condutor não pode ser adicionado também como ocupante.', 'erro');
      return;
    }

    if (ocupantesViatura.some(item => item.chaveLista === participante.chaveLista)) {
      mostrarMensagem('Este militar já está na lista de ocupantes.', 'erro');
      return;
    }

    ocupantesViatura.push(participante);
    document.getElementById('nomeOcupanteExterno').value = '';
    document.getElementById('rgOcupanteExterno').value = '';
    renderizarOcupantesViatura();
    document.getElementById('nomeOcupanteExterno').focus();
  }

  function criarChaveParticipanteViatura(pessoa) {
    const documento = String((pessoa && pessoa.RG_CPF) || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    if (documento) {
      return 'DOC:' + documento;
    }

    const id = String((pessoa && pessoa.ID_Pessoa) || '').trim();
    return id ? 'ID:' + id : '';
  }

  function removerOcupanteViatura(chaveLista) {
    ocupantesViatura = ocupantesViatura.filter(item => item.chaveLista !== chaveLista);
    renderizarOcupantesViatura();
  }

  function renderizarOcupantesViatura() {
    const lista = document.getElementById('listaOcupantesViatura');
    const contador = document.getElementById('contadorOcupantesViatura');

    const quantidade = ocupantesViatura.length;
    contador.textContent = quantidade === 1 ? '1 adicional' : `${quantidade} adicionais`;
    lista.innerHTML = '';
    lista.classList.toggle('oculto', ocupantesViatura.length === 0);

    ocupantesViatura.forEach(pessoa => {
      const item = document.createElement('div');
      item.className = 'ocupante-viatura';

      const identificacao = document.createElement('div');
      const nome = document.createElement('strong');
      const documento = document.createElement('span');
      const origem = document.createElement('small');
      nome.textContent = pessoa.Nome;
      documento.textContent = pessoa.RG_CPF;
      origem.textContent = String(pessoa.origem || '').toLowerCase() === 'manual'
        ? 'Não cadastrado'
        : 'Cadastrado';
      identificacao.appendChild(nome);
      identificacao.appendChild(documento);
      identificacao.appendChild(origem);
      item.appendChild(identificacao);

      const remover = document.createElement('button');
      remover.type = 'button';
      remover.textContent = 'Remover';
      remover.onclick = () => removerOcupanteViatura(pessoa.chaveLista);
      item.appendChild(remover);
      lista.appendChild(item);
    });
  }

  function formatarHoraInputLocal(data) {
    return String(data.getHours()).padStart(2, '0') + ':' +
      String(data.getMinutes()).padStart(2, '0');
  }

  function interpretarDataHoraPainelLocal(valor) {
    const correspondencia = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/.exec(String(valor || '').trim());
    if (!correspondencia) return null;

    const data = new Date(
      Number(correspondencia[3]),
      Number(correspondencia[2]) - 1,
      Number(correspondencia[1]),
      Number(correspondencia[4]),
      Number(correspondencia[5]),
      0,
      0
    );
    return isNaN(data.getTime()) ? null : data;
  }

  function obterLimitesLancamentoRetroativo() {
    return {
      inicio: interpretarDataHoraPainelLocal(comandanteAtual && comandanteAtual.DataHora_Inicio_Ciclo),
      fim: interpretarDataHoraPainelLocal(comandanteAtual && comandanteAtual.DataHora_Fim_Ciclo)
    };
  }

  function atualizarInterfaceLancamentoRetroativo() {
    const card = document.getElementById('cardMovimentacao');
    const bloco = document.getElementById('blocoLancamentoRetroativo');
    const campoForma = document.getElementById('campoFormaRegistro');
    const titulo = document.getElementById('tituloCardMovimentacao');
    const botao = document.getElementById('btnRegistrarMovimentacao');
    const botaoAbrir = document.getElementById('btnAbrirLancamentoRetroativo');

    if (card) card.classList.toggle('modo-retroativo', modoLancamentoRetroativoAtivo);
    if (bloco) bloco.classList.toggle('oculto', !modoLancamentoRetroativoAtivo);
    if (campoForma) campoForma.classList.toggle('oculto', modoLancamentoRetroativoAtivo);
    if (botaoAbrir) botaoAbrir.setAttribute('aria-expanded', String(modoLancamentoRetroativoAtivo));
    if (titulo) titulo.textContent = modoLancamentoRetroativoAtivo
      ? 'Lançamento individual em horário anterior'
      : 'Registrar Movimentação';
    if (botao && !botao.disabled) botao.textContent = modoLancamentoRetroativoAtivo
      ? 'Registrar horário anterior'
      : (modoRegistroAtual === 'Viatura' ? 'Registrar Auto/VTR' : 'Registrar');
  }

  function abrirLancamentoRetroativo() {
    if (!aparelhoAssumiuComandanteAtual()) {
      atualizarVisibilidadePainelComandante();
      mostrarMensagem('Somente o Comandante da Guarda autenticado pode lançar um horário anterior.', 'erro');
      return;
    }

    modoLancamentoRetroativoAtivo = true;
    idSolicitacaoRetroativaAtual = '';
    assinaturaSolicitacaoRetroativaAtual = '';
    limparFormulario();
    selecionarMovimentacao('Entrada');
    atualizarInterfaceLancamentoRetroativo();

    const agora = new Date();
    const limites = obterLimitesLancamentoRetroativo();
    const limiteFinal = limites.fim && limites.fim < agora
      ? new Date(limites.fim.getTime() - 60000)
      : agora;
    const data = document.getElementById('dataMovimentacaoRetroativa');
    const hora = document.getElementById('horaMovimentacaoRetroativa');
    const motivo = document.getElementById('motivoMovimentacaoRetroativa');
    const detalhe = document.getElementById('detalheMotivoRetroativo');

    data.value = formatarDataInputLocal(limiteFinal);
    data.min = limites.inicio ? formatarDataInputLocal(limites.inicio) : '';
    data.max = formatarDataInputLocal(limiteFinal);
    hora.value = '';
    motivo.value = '';
    detalhe.value = '';
    atualizarDetalheMotivoRetroativo();
    atualizarPermissaoLancamento();

    const card = document.getElementById('cardMovimentacao');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => hora.focus(), 350);
  }

  function encerrarLancamentoRetroativo() {
    const botaoAbrir = document.getElementById('btnAbrirLancamentoRetroativo');
    const acaoAbrir = document.getElementById('acaoLancamentoRetroativo');
    cancelarLancamentoRetroativoPendente();
    atualizarPermissaoLancamento();

    if (botaoAbrir && acaoAbrir && !acaoAbrir.classList.contains('oculto')) {
      requestAnimationFrame(() => {
        botaoAbrir.focus({ preventScroll: true });
        botaoAbrir.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }

  function definirControlesFechamentoRetroativoBloqueados(bloqueados) {
    document.querySelectorAll('[data-fechar-lancamento-retroativo]').forEach(botao => {
      botao.disabled = bloqueados === true;
    });
  }

  function cancelarLancamentoRetroativoPendente() {
    fecharModalConfirmacao();
    modoLancamentoRetroativoAtivo = false;
    idSolicitacaoRetroativaAtual = '';
    assinaturaSolicitacaoRetroativaAtual = '';
    limparFormulario();
    selecionarMovimentacao('Entrada');
    ['dataMovimentacaoRetroativa', 'horaMovimentacaoRetroativa',
      'motivoMovimentacaoRetroativa', 'detalheMotivoRetroativo'].forEach(id => {
      const campo = document.getElementById(id);
      if (campo) campo.value = '';
    });
    atualizarDetalheMotivoRetroativo();
    atualizarInterfaceLancamentoRetroativo();
  }

  function atualizarDetalheMotivoRetroativo() {
    const motivo = document.getElementById('motivoMovimentacaoRetroativa');
    const campoDetalhe = document.getElementById('campoDetalheMotivoRetroativo');
    if (!motivo || !campoDetalhe) return;

    const outro = motivo.value === 'Outro';
    campoDetalhe.classList.toggle('oculto', !outro);
    if (!outro) document.getElementById('detalheMotivoRetroativo').value = '';
  }

  function gerarIdSolicitacaoRetroativa() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'RETRO-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12);
  }

  function prepararDadosLancamentoRetroativo(dados) {
    if (!aparelhoAssumiuComandanteAtual()) {
      mostrarMensagem('A sessão do Comandante expirou. Entre novamente antes de lançar.', 'erro');
      atualizarPermissaoLancamento();
      return null;
    }

    if (modoRegistroAtual !== 'Individual') {
      mostrarMensagem('O lançamento retroativo está disponível inicialmente apenas no modo Individual.', 'erro');
      return null;
    }

    const valorData = document.getElementById('dataMovimentacaoRetroativa').value;
    const valorHora = document.getElementById('horaMovimentacaoRetroativa').value;
    const motivoSelecionado = document.getElementById('motivoMovimentacaoRetroativa').value;
    const detalhe = document.getElementById('detalheMotivoRetroativo').value.trim();

    if (!valorData || !valorHora) {
      mostrarMensagem('Informe a data e a hora em que a movimentação ocorreu.', 'erro');
      focarCampoComErroRetroativo(!valorData ? 'dataMovimentacaoRetroativa' : 'horaMovimentacaoRetroativa');
      return null;
    }
    if (!motivoSelecionado) {
      mostrarMensagem('Selecione o motivo do lançamento posterior.', 'erro');
      focarCampoComErroRetroativo('motivoMovimentacaoRetroativa');
      return null;
    }
    if (motivoSelecionado === 'Outro' && !detalhe) {
      mostrarMensagem('Informe o detalhe do motivo do lançamento posterior.', 'erro');
      document.getElementById('detalheMotivoRetroativo').focus();
      return null;
    }

    const dataHora = new Date(valorData + 'T' + valorHora + ':00');
    if (isNaN(dataHora.getTime()) || formatarDataInputLocal(dataHora) !== valorData ||
        formatarHoraInputLocal(dataHora) !== valorHora) {
      mostrarMensagem('A data ou a hora informada não é válida.', 'erro');
      focarCampoComErroRetroativo('dataMovimentacaoRetroativa');
      return null;
    }

    const agora = new Date();
    const limites = obterLimitesLancamentoRetroativo();
    if (dataHora > agora) {
      mostrarMensagem('O horário informado não pode estar no futuro.', 'erro');
      focarCampoComErroRetroativo('horaMovimentacaoRetroativa');
      return null;
    }
    if ((limites.inicio && dataHora < limites.inicio) || (limites.fim && dataHora >= limites.fim)) {
      mostrarMensagem('O horário precisa pertencer ao ciclo deste Comandante da Guarda.', 'erro');
      focarCampoComErroRetroativo('dataMovimentacaoRetroativa');
      return null;
    }

    const motivoRetroativo = motivoSelecionado === 'Outro'
      ? 'Outro — ' + detalhe
      : motivoSelecionado;
    const dadosRetroativos = Object.assign({}, dados, {
      modoRegistro: 'Individual',
      dataHoraEventoIso: dataHora.toISOString(),
      motivoRetroativo: motivoRetroativo
    });
    const assinatura = JSON.stringify(dadosRetroativos);
    if (!idSolicitacaoRetroativaAtual || assinaturaSolicitacaoRetroativaAtual !== assinatura) {
      idSolicitacaoRetroativaAtual = gerarIdSolicitacaoRetroativa();
      assinaturaSolicitacaoRetroativaAtual = assinatura;
    }
    dadosRetroativos.idSolicitacao = idSolicitacaoRetroativaAtual;

    return {
      dados: dadosRetroativos,
      dataHora: dataHora,
      motivo: motivoRetroativo
    };
  }

  function focarCampoComErroRetroativo(idCampo) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;
    campo.focus();
    campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function enviarMovimentacao(dados, retroativa) {
    const botao = document.getElementById('btnRegistrarMovimentacao');
    botao.disabled = true;
    botao.textContent = 'Registrando...';
    if (retroativa) definirControlesFechamentoRetroativoBloqueados(true);

    const executor = google.script.run
      .withSuccessHandler((resposta) => {
        mostrarMensagem(resposta.mensagem || 'Movimentação registrada com sucesso.', 'sucesso');
        limparFormulario();
        carregarPessoasDentroGuarda(true);
        carregarMovimentacoesGuarda(true);

        if (aparelhoTemAcessoPainelGestao()) {
          carregarPainelComandante(true);
        }

        if (retroativa) {
          idSolicitacaoRetroativaAtual = '';
          assinaturaSolicitacaoRetroativaAtual = '';
          document.getElementById('horaMovimentacaoRetroativa').value = '';
        }

        botao.disabled = false;
        if (retroativa) definirControlesFechamentoRetroativoBloqueados(false);
        atualizarInterfaceLancamentoRetroativo();
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao registrar movimentação: ' + erro.message, 'erro');
        botao.disabled = false;
        if (retroativa) definirControlesFechamentoRetroativoBloqueados(false);
        atualizarInterfaceLancamentoRetroativo();
      });

    if (retroativa) executor.registrarMovimentacaoRetroativa(dados);
    else executor.registrarMovimentacao(dados);
  }

  function registrarMovimentacao() {
    if (modoLancamentoRetroativoAtivo) {
      if (!aparelhoAssumiuComandanteAtual()) {
        atualizarPermissaoLancamento();
        mostrarMensagem('A sessão do Comandante expirou. Entre novamente antes de lançar.', 'erro');
        return;
      }
    } else if (!garantirPermissaoOperacionalAtual()) {
      return;
    }

    if (modoRegistroAtual === 'SOS') {
      registrarSOS();
      return;
    }

    const cadastroAutomatico = modoRegistroAtual === 'Individual' &&
      !pessoaSelecionada &&
      !document.getElementById('areaPessoaNaoEncontrada').classList.contains('oculto');
    const tipoRegistro = cadastroAutomatico ? 'Pessoa não encontrada' : 'Pessoa cadastrada';

    const dados = {
      modoRegistro: modoRegistroAtual,
      tipoMovimentacao: tipoMovimentacaoAtual,
      tipoRegistro: tipoRegistro,
      categoriaPessoa: categoriaPessoaIndividualAtual,
      pessoaCadastrada: pessoaSelecionada,
      condutorExterno: condutorExternoAtivo ? {
        origem: 'Manual',
        Nome: document.getElementById('nomeCondutorExterno').value.trim(),
        RG_CPF: document.getElementById('rgCondutorExterno').value.trim()
      } : null,
      nomePessoaNaoEncontrada: document.getElementById('nomePessoaNaoEncontrada').value.trim(),
      rgCpfPessoaNaoEncontrada: document.getElementById('rgCpfPessoaNaoEncontrada').value.trim(),
      destino: document.getElementById('destino').value,
      procedencia: document.getElementById('procedencia').value,
      complementoProcedencia: document.getElementById('complementoProcedencia').value.trim(),
      prefixoPlaca: document.getElementById('prefixoPlaca').value.replace(/\s+/g, '').toUpperCase(),
      observacoes: document.getElementById('observacoes').value.trim(),
      ocupantesViatura: ocupantesViatura
    };

    if (modoRegistroAtual === 'Viatura') {
      if (!pessoaSelecionada && !condutorExternoAtivo) {
        mostrarMensagem('Selecione um condutor cadastrado ou informe um condutor externo.', 'erro');
        return;
      }

      if (
        condutorExternoAtivo &&
        (!dados.condutorExterno.Nome || !dados.condutorExterno.RG_CPF)
      ) {
        mostrarMensagem('Informe o nome e o documento do condutor externo.', 'erro');
        return;
      }

      if (!dados.prefixoPlaca) {
        mostrarMensagem('Informe o prefixo ou a placa do Auto/VTR.', 'erro');
        return;
      }

    }

    if (tipoRegistro === 'Pessoa cadastrada' && !pessoaSelecionada) {
      mostrarMensagem('Busque e selecione uma pessoa antes de registrar.', 'erro');
      return;
    }

    if (tipoRegistro === 'Pessoa não encontrada') {
      if (dados.rgCpfPessoaNaoEncontrada.replace(/\D/g, '').length < 3) {
        mostrarMensagem('Informe um RG/CPF válido, com pelo menos 3 dígitos.', 'erro');
        document.getElementById('rgCpfPessoaNaoEncontrada').focus();
        return;
      }

      if (!dados.nomePessoaNaoEncontrada) {
        mostrarMensagem('Informe o nome completo da pessoa.', 'erro');
        document.getElementById('nomePessoaNaoEncontrada').focus();
        return;
      }
    }

    const areaComplemento = document.getElementById('areaComplementoProcedencia');
    const complementoVisivel = !areaComplemento.classList.contains('oculto');

    if (complementoVisivel && !dados.complementoProcedencia) {
      mostrarMensagem('Informe o complemento da procedência.', 'erro');
      return;
    }

    if (modoLancamentoRetroativoAtivo) {
      const retroativo = prepararDadosLancamentoRetroativo(dados);
      if (!retroativo) return;

      const nomePessoa = pessoaSelecionada && pessoaSelecionada.Nome
        ? pessoaSelecionada.Nome
        : dados.nomePessoaNaoEncontrada;
      const quando = retroativo.dataHora.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      abrirModalConfirmacao(
        'Confirmar lançamento retroativo',
        'Você está registrando a <strong>' + escaparHtml(dados.tipoMovimentacao) +
          '</strong> de <strong>' + escaparHtml(nomePessoa || 'pessoa não identificada') +
          '</strong> como ocorrida em <strong>' + escaparHtml(quando) +
          '</strong>.<br><br>Motivo: <strong>' + escaparHtml(retroativo.motivo) +
          '</strong>.<br><br>O lançamento ficará identificado como retroativo no histórico e na auditoria.',
        () => enviarMovimentacao(retroativo.dados, true),
        'retroativo'
      );
      return;
    }

    enviarMovimentacao(dados, false);
  }

  function limparFormulario() {
    pessoaSelecionada = null;
    condutorExternoAtivo = false;
    ocupantesViatura = [];

    document.getElementById('rgCpfBusca').value = '';
    document.getElementById('resultadoPessoa').innerHTML = '';
    document.getElementById('resultadoPessoa').classList.add('oculto');

    document.getElementById('rgCpfPessoaNaoEncontrada').value = '';
    document.getElementById('nomePessoaNaoEncontrada').value = '';
    document.getElementById('areaPessoaNaoEncontrada').classList.add('oculto');

    document.getElementById('complementoProcedencia').value = '';
    document.getElementById('prefixoPlaca').value = '';
    document.getElementById('observacoes').value = '';
    document.getElementById('rgCpfBuscaOcupante').value = '';
    document.getElementById('resultadoOcupanteViatura').innerHTML = '';
    document.getElementById('resultadoOcupanteViatura').classList.add('oculto');
    document.getElementById('nomeCondutorExterno').value = '';
    document.getElementById('rgCondutorExterno').value = '';
    document.getElementById('nomeOcupanteExterno').value = '';
    document.getElementById('rgOcupanteExterno').value = '';
    document.getElementById('areaOcupanteExterno').classList.add('oculto');
    renderizarOcupantesViatura();

    document.getElementById('tipoRegistro').value = 'Pessoa cadastrada';
    selecionarCategoriaPessoa('Militar');
    selecionarModoRegistro('Individual');
  }

  function mostrarMensagem(texto, tipo = 'sucesso') {
    const mensagem = document.getElementById('mensagemSistema');

    if (!mensagem) {
      console.log(texto);
      return;
    }

    mensagem.textContent = texto;
    mensagem.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
    mensagem.setAttribute('aria-live', tipo === 'erro' ? 'assertive' : 'polite');
    mensagem.classList.remove('oculto', 'sucesso', 'erro');
    mensagem.classList.add(tipo);

    setTimeout(() => {
      mensagem.classList.add('oculto');
    }, 3500);
  }

  function carregarGuardaAtivo(silencioso = false) {
    carregarIdentidadesEquipeServico(silencioso, true);
  }

  function atualizarTelaGuarda() {
    const status = document.getElementById('statusGuarda');
    const areaAssumir = document.getElementById('areaAssumirGuarda');
    const btnEncerrar = document.getElementById('btnEncerrarGuarda');
    const btnTrocar = document.getElementById('btnTrocarGuarda');

    status.classList.remove('sem-guarda', 'com-guarda');

    if (guardaAtual) {
      const esteAparelhoAssumiu = aparelhoAssumiuGuardaAtual();
      const identidadeDisponivel = !!guardaAtual.Nome_Guarda;
      const idGuardaLocal = localStorage.getItem('guarda_id_local') || '';

      if (!esteAparelhoAssumiu && obterSessaoTokenLocal() &&
          (guardaAtual.Sessao_Valida === false || idGuardaLocal !== guardaAtual.ID_GuardaServico)) {
        limparGuardaLocal();
      }

      status.classList.add('com-guarda');
      status.innerHTML = identidadeDisponivel
        ? 'Guarda atual:<br>' + escaparHtml(guardaAtual.Nome_Guarda) +
          (guardaAtual.RG_Guarda ? ' — RG ' + escaparHtml(guardaAtual.RG_Guarda) : '')
        : 'A Guarda já está assumida neste serviço.<br><small>Entre com seu e-mail para consultar ou trocar o responsável.</small>';

      areaAssumir.classList.add('oculto');

      if (btnEncerrar) {
        btnEncerrar.classList.toggle('oculto', !esteAparelhoAssumiu);
      }

      if (btnTrocar) {
        btnTrocar.classList.remove('oculto');
        btnTrocar.textContent = 'Assumir / Trocar';
      }

    } else {
      status.classList.add('sem-guarda');
      status.textContent = 'Nenhum guarda ativo. Valide seu e-mail para assumir a Guarda neste celular.';

      areaAssumir.classList.remove('oculto');

      if (btnEncerrar) {
        btnEncerrar.classList.add('oculto');
      }

      if (btnTrocar) {
        btnTrocar.classList.remove('oculto');
        btnTrocar.textContent = 'Entrar';
      }

      limparGuardaLocal();
    }

    // Recruza os dois estados sempre que a Guarda mudar. Assim, uma resposta
    // antiga da cobertura nunca continua exibindo o guarda anterior na tela.
    if (estadoToqueFogoCarregado) {
      atualizarTelaToqueFogo();
    } else {
      atualizarAcoesCoberturaEPermissoes();
    }
  }

  function mostrarAreaTrocaGuarda() {
    expandirPerfilServico('perfilGuarda', true);
    document.getElementById('areaAssumirGuarda').classList.remove('oculto');
    mostrarMensagem('Informe seu e-mail para assumir a Guarda neste celular. A sessão anterior será encerrada após a confirmação.', 'sucesso');
  }  

  function enviarCodigoGuarda() {
    const email = document.getElementById('emailGuarda').value.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      mostrarMensagem('Informe um e-mail válido.', 'erro');
      return;
    }

    google.script.run
      .withSuccessHandler((resposta) => {
        dadosCodigoGuarda = {
          email: email,
          encontradoNoEfetivo: false,
          militar: null,
          ticketAssuncao: ''
        };

        salvarCodigoGuardaPendente(email);

        document.getElementById('areaCodigoGuarda').classList.remove('oculto');

        mostrarMensagem('Se o e-mail estiver autorizado, o código será enviado.', 'sucesso');
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao enviar código: ' + erro.message, 'erro');
      })
      .enviarCodigoAssumirGuarda(email);
  }

  function validarCodigoGuarda() {
    const email = document.getElementById('emailGuarda').value.trim().toLowerCase();
    const codigo = document.getElementById('codigoGuarda').value.trim();

    if (!email || !codigo) {
      mostrarMensagem('Informe o e-mail e o código.', 'erro');
      return;
    }

    google.script.run
      .withSuccessHandler((resposta) => {
        dadosCodigoGuarda = {
          email: resposta.email,
          encontradoNoEfetivo: resposta.encontradoNoEfetivo,
          militar: resposta.militar || null,
          ticketAssuncao: resposta.ticketAssuncao || ''
        };

        limparCodigoGuardaPendente();

        const areaMilitar = document.getElementById('areaMilitarIdentificado');
        const areaManual = document.getElementById('areaIdentificacaoManual');
        const btnAssumir = document.getElementById('btnAssumirGuarda');

        areaMilitar.classList.remove('oculto', 'erro');
        btnAssumir.classList.remove('oculto');

        if (resposta.encontradoNoEfetivo && resposta.militar) {
          areaMilitar.innerHTML = `
            E-mail validado.<br>
            Militar identificado:<br>
            ${escaparHtml(resposta.militar.Nome)} — RG ${escaparHtml(resposta.militar.RG)}
          `;
          areaManual.classList.add('oculto');
        } else {
          areaMilitar.innerHTML = `
            E-mail validado, mas não localizado no efetivo.<br>
            Informe RG e nome do militar.
          `;
          areaManual.classList.remove('oculto');
        }

        mostrarMensagem('Código validado com sucesso.', 'sucesso');
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao validar código: ' + erro.message, 'erro');
      })
      .validarCodigoAssumirGuarda(email, codigo);
  }

  function assumirGuarda(encerrarAnterior = false) {
    if (!dadosCodigoGuarda) {
      mostrarMensagem('Valide o e-mail antes de assumir a Guarda.', 'erro');
      return;
    }

    const botao = document.getElementById('btnAssumirGuarda');
    botao.disabled = true;
    botao.textContent = 'Assumindo...';

    const dados = {
      email: dadosCodigoGuarda.email,
      origemIdentificacao: dadosCodigoGuarda.encontradoNoEfetivo ? 'Efetivo' : 'Manual',
      militar: dadosCodigoGuarda.militar,
      rgManual: document.getElementById('rgGuardaManual').value.trim(),
      nomeManual: document.getElementById('nomeGuardaManual').value.trim(),
      ticketAssuncao: dadosCodigoGuarda.ticketAssuncao || '',
      encerrarAnterior: encerrarAnterior
    };

    google.script.run
      .withSuccessHandler((resposta) => {
        botao.disabled = false;
        botao.textContent = 'Assumir neste celular';

        if (resposta && resposta.requerConfirmacaoTroca && resposta.guardaAtivo) {
          const g = resposta.guardaAtivo;

          abrirModalConfirmacao(
            'Guarda já assumida',
            `Já existe um guarda ativo:<br><br>
            <strong>${escaparHtml(g.Nome_Guarda)} — RG ${escaparHtml(g.RG_Guarda)}</strong><br><br>
            Deseja encerrar a sessão anterior e assumir a Guarda neste celular?`,
            () => assumirGuarda(true),
            true
          );

          return;
        }

        mostrarMensagem(resposta.mensagem || 'Guarda assumida com sucesso.', 'sucesso');

        if (resposta && resposta.guarda) {
          geracaoConsultaGuarda += 1;
          guardaAtual = resposta.guarda;

          // Autoriza o celular pessoal usado pelo guarda durante este serviço.
          salvarGuardaLocal(resposta.guarda);

          atualizarTelaGuarda();
          carregarIdentidadesEquipeServico(true);
        }

        limparAreaGuarda();
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao assumir Guarda: ' + erro.message, 'erro');

        botao.disabled = false;
        botao.textContent = 'Assumir neste celular';
      })
      .assumirGuardaComEmailValidado(dados);
  }

  function encerrarGuarda() {
    expandirPerfilServico('perfilGuarda', true);
    abrirModalConfirmacao(
      'Encerrar Guarda',
      'Para encerrar a Guarda, será enviado um código para o e-mail do guarda atual.<br><br>Deseja enviar o código?',
      () => enviarCodigoParaEncerrarGuarda(),
      true
    );
  }

  function executarEncerramentoGuarda() {
    const botao = document.getElementById('btnEncerrarGuarda');
    botao.disabled = true;
    botao.textContent = 'Saindo...';

    google.script.run
      .withSuccessHandler((resposta) => {
        mostrarMensagem(resposta.mensagem || 'Guarda encerrada com sucesso.', 'sucesso');

        geracaoConsultaGuarda += 1;
        guardaAtual = null;
        limparGuardaLocal();

        limparAreaGuarda();
        atualizarTelaGuarda();
        carregarIdentidadesEquipeServico(true);

        botao.disabled = false;
        botao.textContent = 'Sair';
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao encerrar Guarda: ' + erro.message, 'erro');

        botao.disabled = false;
        botao.textContent = 'Sair';
      })
      .encerrarGuardaAtivo();
  }

  function limparAreaGuarda() {
    limparCodigoGuardaPendente();

    dadosCodigoGuarda = null;
    emailEncerramentoGuarda = null;

    const camposParaLimpar = [
      'emailGuarda',
      'codigoGuarda',
      'rgGuardaManual',
      'nomeGuardaManual',
      'codigoEncerrarGuarda'
    ];

    camposParaLimpar.forEach(id => {
      const campo = document.getElementById(id);
      if (campo) {
        campo.value = '';
      }
    });

    const areasParaOcultar = [
      'areaCodigoEncerrarGuarda',
      'areaCodigoGuarda',
      'areaMilitarIdentificado',
      'areaIdentificacaoManual',
      'btnAssumirGuarda'
    ];

    areasParaOcultar.forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.classList.add('oculto');
      }
    });

    const areaMilitar = document.getElementById('areaMilitarIdentificado');
    if (areaMilitar) {
      areaMilitar.innerHTML = '';
    }
  }

  function salvarCodigoGuardaPendente(email) {
    localStorage.setItem('guarda_email_pendente', email);
    localStorage.setItem('guarda_codigo_pendente_em', new Date().toISOString());
  }

  function limparCodigoGuardaPendente() {
    localStorage.removeItem('guarda_email_pendente');
    localStorage.removeItem('guarda_codigo_pendente_em');
  }

  function restaurarCodigoGuardaPendente() {
    const email = localStorage.getItem('guarda_email_pendente');
    const geradoEm = localStorage.getItem('guarda_codigo_pendente_em');

    if (!email || !geradoEm) {
      return;
    }

    const agora = new Date();
    const dataGerado = new Date(geradoEm);
    const diferencaMinutos = (agora - dataGerado) / 1000 / 60;

    if (diferencaMinutos > 10) {
      limparCodigoGuardaPendente();
      return;
    }

    document.getElementById('emailGuarda').value = email;
    document.getElementById('areaCodigoGuarda').classList.remove('oculto');

    dadosCodigoGuarda = {
      email: email,
      encontradoNoEfetivo: false,
      militar: null,
      ticketAssuncao: ''
    };

    mostrarMensagem('Código pendente restaurado. Digite o código recebido por e-mail.', 'sucesso');
  }

function limparCodigoAcessoDaUrl() {
  if (!window.history || typeof window.history.replaceState !== 'function') return;
  const url = new URL(window.location.href);
  ['perfil', 'email', 'codigo'].forEach(parametro => url.searchParams.delete(parametro));
  window.history.replaceState(null, document.title, url.pathname + url.search + url.hash);
}

function aplicarCodigoDoLink() {
  const email = window.PARAM_EMAIL_GUARDA || '';
  const codigo = window.PARAM_CODIGO_GUARDA || '';
  const perfil = String(window.PARAM_PERFIL || '').toLowerCase();

  if (!email || !codigo) {
    return;
  }

  if (perfil === 'consulta') {
    document.getElementById('emailConsultaEfetivo').value = email;
    document.getElementById('codigoConsultaEfetivo').value = codigo;
    document.getElementById('areaCodigoConsultaEfetivo').classList.remove('oculto');
    mostrarMensagem('Código da consulta recebido pelo link. Validando...', 'sucesso');
    setTimeout(() => validarCodigoConsultaEfetivo(), 500);
    return;
  }

  if (perfil === 'encarregado-motoristas' || perfil === 'encarregado') {
    expandirPerfilServico('perfilEncarregadoMotoristas', true);
    document.getElementById('emailEncarregadoMotoristas').value = email;
    document.getElementById('codigoEncarregadoMotoristas').value = codigo;
    document.getElementById('areaCodigoEncarregadoMotoristas').classList.remove('oculto');
    dadosCodigoEncarregadoMotoristas = { email: email };
    limparCodigoAcessoDaUrl();
    mostrarMensagem(
      'Código preenchido. Toque em “Confirmar e assumir” para assumir como Encarregado de Motoristas.',
      'sucesso'
    );
    setTimeout(() => document.getElementById('btnValidarCodigoEncarregadoMotoristas').focus(), 0);
    return;
  }

  if (perfil === 'oficial') {
    alternarAcessoPainelOficial(true);
    document.getElementById('emailOficial').value = email;
    document.getElementById('codigoOficial').value = codigo;
    document.getElementById('areaCodigoOficial').classList.remove('oculto');
    dadosCodigoOficial = { email: email, militar: null, ticketAssuncao: '' };
    mostrarMensagem('Código do Oficial de Dia recebido pelo link. Validando...', 'sucesso');
    setTimeout(() => validarCodigoOficial(), 500);
    return;
  }

  if (perfil === 'comandante') {
    expandirPerfilServico('perfilComandante', true);
    document.getElementById('emailComandante').value = email;
    document.getElementById('codigoComandante').value = codigo;
    document.getElementById('areaCodigoComandante').classList.remove('oculto');

    dadosCodigoComandante = {
      email: email,
      militar: null
    };

    mostrarMensagem('Código do comandante recebido pelo link. Validando...', 'sucesso');
    setTimeout(() => validarCodigoComandante(), 500);
    return;
  }

  expandirPerfilServico('perfilGuarda', true);
  document.getElementById('emailGuarda').value = email;
  document.getElementById('codigoGuarda').value = codigo;
  document.getElementById('areaCodigoGuarda').classList.remove('oculto');

  dadosCodigoGuarda = {
    email: email,
    encontradoNoEfetivo: false,
    militar: null,
    ticketAssuncao: ''
  };

  mostrarMensagem('Código recebido pelo link. Validando...', 'sucesso');

  setTimeout(() => {
    validarCodigoGuarda();
  }, 500);
}

function carregarOficialDiaAtivo(silencioso = false) {
  carregarIdentidadesEquipeServico(silencioso, true);
}

function atualizarTelaOficial() {
  const status = document.getElementById('statusOficial');
  const btnEditar = document.getElementById('btnEditarOficialDia');
  const areaDesignar = document.getElementById('areaDesignarOficial');
  if (!status) return;

  if (oficialAtual) {
    status.classList.add('ativo');
    status.innerHTML = oficialAtual.Nome_Oficial && oficialAtual.RG_Oficial
      ? 'Oficial de Dia informado pelo Comandante:<br>' + escaparHtml(oficialAtual.Nome_Oficial) +
        ' — RG ' + escaparHtml(oficialAtual.RG_Oficial)
      : 'O Oficial de Dia já foi informado para este serviço.';
  } else {
    status.classList.remove('ativo');
    status.textContent = 'Oficial de Dia ainda não informado para este serviço.';
  }

  const comandantePodeEditar = aparelhoAssumiuComandanteAtual();
  if (btnEditar) {
    btnEditar.classList.remove('oculto');
    btnEditar.title = comandantePodeEditar
      ? 'Informar ou alterar o Oficial de Dia'
      : 'Entre como Comandante da Guarda neste aparelho para informar o Oficial de Dia';
  }
  if (!comandantePodeEditar && areaDesignar) fecharDesignacaoOficialDia();

  atualizarTelaAcessoOficial();
  atualizarVisibilidadePainelComandante();
  atualizarVisibilidadeGuarnicoesServico();
}

function mostrarDesignacaoOficialDia() {
  if (!aparelhoAssumiuComandanteAtual()) {
    expandirPerfilServico('perfilComandante', true);
    mostrarAreaTrocaComandante();
    mostrarMensagem(
      'Para informar o Oficial de Dia neste aparelho, valide o e-mail do Comandante da Guarda.',
      'sucesso'
    );
    const campoEmailComandante = document.getElementById('emailComandante');
    if (campoEmailComandante) campoEmailComandante.focus();
    return;
  }
  expandirPerfilServico('perfilOficial', true);
  const area = document.getElementById('areaDesignarOficial');
  if (!area.classList.contains('oculto')) {
    fecharDesignacaoOficialDia();
    return;
  }
  area.classList.remove('oculto');
  atualizarEstadoDesignacaoOficialDia(true);
  carregarOpcoesOficialDia();
}

function atualizarEstadoDesignacaoOficialDia(aberta) {
  const botao = document.getElementById('btnEditarOficialDia');
  if (!botao) return;
  botao.textContent = aberta ? 'Fechar' : 'Informar';
  botao.setAttribute('aria-expanded', String(aberta));
}

function fecharDesignacaoOficialDia() {
  const area = document.getElementById('areaDesignarOficial');
  if (area) area.classList.add('oculto');
  atualizarEstadoDesignacaoOficialDia(false);
}

function carregarOpcoesOficialDia() {
  const geracaoSessao = geracaoSessaoEquipe;
  google.script.run
    .withSuccessHandler((dados) => {
      if (!respostaPertenceASessaoEquipe(geracaoSessao)) return;
      oficialAtual = dados && dados.oficialAtual ? dados.oficialAtual : oficialAtual;
      const select = document.getElementById('selectOficialDia');
      select.innerHTML = '<option value="">Selecione o oficial</option>';
      (dados && dados.oficiais ? dados.oficiais : []).forEach(oficial => {
        const option = document.createElement('option');
        option.value = oficial.RG;
        option.textContent = oficial.Nome;
        option.selected = !!(oficialAtual && oficialAtual.RG_Oficial === oficial.RG);
        select.appendChild(option);
      });
      atualizarTelaOficial();
      document.getElementById('areaDesignarOficial').classList.remove('oculto');
    })
    .withFailureHandler((erro) => mostrarMensagem('Erro ao carregar oficiais: ' + erro.message, 'erro'))
    .getDadosOficialDiaParaComandante();
}

function salvarDesignacaoOficialDia() {
  const rg = document.getElementById('selectOficialDia').value;
  if (!rg) return mostrarMensagem('Selecione o Oficial de Dia.', 'erro');
  const geracaoSessao = geracaoSessaoEquipe;
  const botao = document.getElementById('btnSalvarOficialDia');
  botao.disabled = true;
  botao.textContent = 'Salvando...';
  google.script.run
    .withSuccessHandler((resposta) => {
      if (!respostaPertenceASessaoEquipe(geracaoSessao)) {
        botao.disabled = false;
        botao.textContent = 'Salvar Oficial de Dia';
        fecharDesignacaoOficialDia();
        carregarIdentidadesEquipeServico(true);
        return;
      }
      oficialAtual = resposta.oficial;
      fecharDesignacaoOficialDia();
      atualizarTelaOficial();
      mostrarMensagem(resposta.mensagem, 'sucesso');
      botao.disabled = false;
      botao.textContent = 'Salvar Oficial de Dia';
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Erro ao informar Oficial de Dia: ' + erro.message, 'erro');
      botao.disabled = false;
      botao.textContent = 'Salvar Oficial de Dia';
    })
    .designarOficialDia(rg);
}

function mostrarAreaTrocaOficial() {
  alternarAcessoPainelOficial(true);
  document.getElementById('areaAssumirOficial').classList.remove('oculto');
  mostrarMensagem('Informe seu e-mail cadastrado para assumir como Oficial de Dia.', 'sucesso');
}

function enviarCodigoOficial() {
  const email = document.getElementById('emailOficial').value.trim().toLowerCase();
  if (!email) return mostrarMensagem('Informe o e-mail cadastrado do oficial.', 'erro');
  const botao = document.getElementById('btnEnviarCodigoOficial');
  botao.disabled = true;
  botao.textContent = 'Enviando...';
  google.script.run
    .withSuccessHandler((resposta) => {
      dadosCodigoOficial = { email: email, militar: null };
      salvarCodigoOficialPendente(email);
      document.getElementById('areaCodigoOficial').classList.remove('oculto');
      document.getElementById('codigoOficial').focus();
      mostrarMensagem('Se o e-mail estiver autorizado, o código será enviado.', 'sucesso');
      botao.disabled = false;
      botao.textContent = 'Reenviar código';
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Acesso não liberado: ' + erro.message, 'erro');
      botao.disabled = false;
      botao.textContent = 'Enviar código';
    })
    .enviarCodigoAssumirOficialDia(email);
}

function validarCodigoOficial() {
  const email = document.getElementById('emailOficial').value.trim().toLowerCase();
  const codigo = document.getElementById('codigoOficial').value.trim();
  if (!email || !codigo) return mostrarMensagem('Informe o e-mail e o código recebido.', 'erro');
  const botao = document.getElementById('btnValidarCodigoOficial');
  botao.disabled = true;
  botao.textContent = 'Validando...';
  google.script.run
    .withSuccessHandler((resposta) => {
      localStorage.setItem('oficial_dia_sessao_token', resposta.sessaoToken || '');
      marcarInicioSessaoLocal('oficial_dia_sessao_iniciada_em');
      salvarOficialLocal(resposta.militar);
      limparCodigoOficialPendente();
      atualizarTelaAcessoOficial();
      atualizarVisibilidadePainelComandante();
      carregarIdentidadesEquipeServico(true);
      carregarPainelComandante();
      mostrarMensagem('Acesso ao Painel de Gestão liberado.', 'sucesso');
      botao.disabled = false;
      botao.textContent = 'Entrar';
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Erro ao validar acesso de oficial: ' + erro.message, 'erro');
      botao.disabled = false;
      botao.textContent = 'Entrar';
    })
    .validarCodigoAssumirOficialDia(email, codigo);
}

function assumirOficial(encerrarAnterior = false) {
  if (!dadosCodigoOficial || !dadosCodigoOficial.militar) return mostrarMensagem('Valide o e-mail antes de assumir.', 'erro');
  google.script.run
    .withSuccessHandler((resposta) => {
      if (resposta && resposta.requerConfirmacaoTroca && resposta.oficialAtivo) {
        const atual = resposta.oficialAtivo;
        abrirModalConfirmacao(
          'Oficial de Dia já assumido',
          `Já existe Oficial de Dia ativo:<br><br><strong>${escaparHtml(atual.Nome_Oficial)} — RG ${escaparHtml(atual.RG_Oficial)}</strong><br><br>Deseja substituir o Oficial de Dia anterior?`,
          () => assumirOficial(true), true
        );
        return;
      }
      oficialAtual = resposta.oficial;
      salvarOficialLocal(resposta.oficial);
      limparAreaOficial();
      atualizarTelaOficial();
      carregarIdentidadesEquipeServico(true);
      mostrarMensagem(resposta.mensagem || 'Oficial de Dia assumido com sucesso.', 'sucesso');
    })
    .withFailureHandler((erro) => mostrarMensagem('Erro ao assumir como Oficial de Dia: ' + erro.message, 'erro'))
    .assumirOficialDiaComEmailValidado({
      email: dadosCodigoOficial.email,
      militar: dadosCodigoOficial.militar,
      ticketAssuncao: dadosCodigoOficial.ticketAssuncao || '',
      encerrarAnterior: encerrarAnterior
    });
}

function encerrarOficial() {
  expandirPerfilServico('perfilOficial', true);
  abrirModalConfirmacao('Encerrar Oficial de Dia', 'Será enviado um código ao e-mail do Oficial de Dia atual. Deseja continuar?', () => {
    google.script.run
      .withSuccessHandler((resposta) => {
        emailEncerramentoOficial = resposta.email;
        document.getElementById('areaCodigoEncerrarOficial').classList.remove('oculto');
        mostrarMensagem(resposta.mensagem, 'sucesso');
      })
      .withFailureHandler((erro) => mostrarMensagem('Erro ao solicitar encerramento: ' + erro.message, 'erro'))
      .enviarCodigoEncerrarOficialDia();
  }, true);
}

function validarCodigoEEncerrarOficial() {
  const codigo = document.getElementById('codigoEncerrarOficial').value.trim();
  if (!emailEncerramentoOficial || !codigo) return mostrarMensagem('Informe o código enviado ao Oficial de Dia.', 'erro');
  google.script.run
    .withSuccessHandler((resposta) => {
      oficialAtual = null;
      limparOficialLocal();
      limparAreaOficial();
      atualizarTelaOficial();
      carregarIdentidadesEquipeServico(true);
      mostrarMensagem(resposta.mensagem, 'sucesso');
    })
    .withFailureHandler((erro) => mostrarMensagem('Erro ao encerrar Oficial de Dia: ' + erro.message, 'erro'))
    .validarCodigoEEncerrarOficialDia(emailEncerramentoOficial, codigo);
}

function limparAreaOficial() {
  dadosCodigoOficial = null;
  emailEncerramentoOficial = null;
  ['emailOficial', 'codigoOficial', 'codigoEncerrarOficial'].forEach(id => {
    const campo = document.getElementById(id); if (campo) campo.value = '';
  });

  ['areaCodigoOficial', 'areaCodigoEncerrarOficial', 'areaOficialIdentificado', 'btnAssumirOficial'].forEach(id => {
    const item = document.getElementById(id); if (item) item.classList.add('oculto');
  });
}

  function inicializarEquipeServico() {
    const perfis = ['perfilGuarda', 'cardToqueFogo', 'perfilComandante', 'perfilOficial',
      'perfilEncarregadoMotoristas']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!perfis.length || document.getElementById('cardEquipeServico')) return;

    const card = document.createElement('section');
    card.id = 'cardEquipeServico';
    card.className = 'card card-equipe-servico';

    const cabecalhoEquipe = document.createElement('button');
    cabecalhoEquipe.type = 'button';
    cabecalhoEquipe.id = 'btnAlternarEquipeServico';
    cabecalhoEquipe.className = 'cabecalho-equipe-servico';
    cabecalhoEquipe.setAttribute('aria-expanded', 'true');
    cabecalhoEquipe.setAttribute('aria-controls', 'conteudoEquipeServico');

    const resumoEquipe = document.createElement('span');
    const tituloEquipe = document.createElement('strong');
    tituloEquipe.textContent = 'Equipe de Serviço';
    const subtituloEquipe = document.createElement('small');
    subtituloEquipe.textContent = 'Guarda, Toque de Fogo, Comandante, Oficial de Dia e Encarregado de Motoristas';
    resumoEquipe.appendChild(tituloEquipe);
    resumoEquipe.appendChild(subtituloEquipe);

    const iconeEquipe = document.createElement('span');
    iconeEquipe.className = 'icone-equipe-servico';
    iconeEquipe.setAttribute('aria-hidden', 'true');
    iconeEquipe.textContent = '⌄';
    cabecalhoEquipe.appendChild(resumoEquipe);
    cabecalhoEquipe.appendChild(iconeEquipe);

    const conteudo = document.createElement('div');
    conteudo.id = 'conteudoEquipeServico';
    conteudo.className = 'conteudo-equipe-servico';
    card.appendChild(cabecalhoEquipe);
    card.appendChild(conteudo);

    perfis[0].parentNode.insertBefore(card, perfis[0]);
    perfis.forEach(perfil => conteudo.appendChild(perfil));

    card.querySelector('#btnAlternarEquipeServico').addEventListener('click', alternarEquipeServico);
  }

  function expandirPerfilServico(id, forcarAberto = false) {
    const perfil = document.getElementById(id);
    if (!perfil) return;
    const abrir = forcarAberto || !perfil.classList.contains('perfil-expandido');
    document.querySelectorAll('.perfil-servico').forEach(item => {
      item.classList.toggle('perfil-expandido', abrir && item === perfil);
    });
  }

  function alternarEquipeServico() {
    const card = document.getElementById('cardEquipeServico');
    const botao = document.getElementById('btnAlternarEquipeServico');
    if (!card || !botao) return;
    const recolher = !card.classList.contains('equipe-recolhida');

    if (recolher && document.querySelector('.acao-cobertura-operacional:not(.oculto)')) {
      card.classList.remove('equipe-recolhida');
      botao.setAttribute('aria-expanded', 'true');
      mostrarMensagem('Há uma ação da Guarda disponível. A Equipe de Serviço permanecerá aberta.', 'sucesso');
      return;
    }

    card.classList.toggle('equipe-recolhida', recolher);
    botao.setAttribute('aria-expanded', String(!recolher));
  }

function salvarCodigoEncarregadoMotoristasPendente(email) {
  localStorage.setItem('encarregado_motoristas_email_pendente', email);
  localStorage.setItem('encarregado_motoristas_codigo_pendente_em', new Date().toISOString());
}

function limparCodigoEncarregadoMotoristasPendente() {
  localStorage.removeItem('encarregado_motoristas_email_pendente');
  localStorage.removeItem('encarregado_motoristas_codigo_pendente_em');
}

function restaurarCodigoEncarregadoMotoristasPendente() {
  const email = localStorage.getItem('encarregado_motoristas_email_pendente');
  const geradoEm = localStorage.getItem('encarregado_motoristas_codigo_pendente_em');
  const dataGeracao = geradoEm ? new Date(geradoEm) : null;
  if (!email || !dataGeracao || isNaN(dataGeracao.getTime()) ||
      Date.now() - dataGeracao.getTime() > 10 * 60 * 1000) {
    limparCodigoEncarregadoMotoristasPendente();
    return;
  }
  const campoEmail = document.getElementById('emailEncarregadoMotoristas');
  const areaCodigo = document.getElementById('areaCodigoEncarregadoMotoristas');
  if (campoEmail) campoEmail.value = email;
  if (areaCodigo) areaCodigo.classList.remove('oculto');
  dadosCodigoEncarregadoMotoristas = { email: email };
  expandirPerfilServico('perfilEncarregadoMotoristas', true);
}

function limparAcessoEncarregadoMotoristasLocal() {
  localStorage.removeItem('encarregado_motoristas_sessao_token');
  localStorage.removeItem('encarregado_motoristas_sessao_iniciada_em');
}

function aparelhoAssumiuEncarregadoMotoristasAtual() {
  return !!obterSessaoTokenEncarregadoMotoristasLocal() &&
    !!encarregadoMotoristasEquipeAtual &&
    encarregadoMotoristasEquipeAtual.Sessao_Valida === true;
}

function invalidarPainelMotoristasLocal() {
  painelMotoristasAtual = null;
  painelMotoristasCarregado = false;
  painelMotoristasAutorizado = false;
  assinaturaPainelMotoristasCarregado = '';
  limparConteudoPainelMotoristas();
  fecharModalEventoMotoristas(false);
}

function atualizarTelaEncarregadoMotoristas() {
  const status = document.getElementById('statusEncarregadoMotoristas');
  const areaAcesso = document.getElementById('areaAssumirEncarregadoMotoristas');
  const botaoEntrar = document.getElementById('btnAbrirAcessoEncarregadoMotoristas');
  const botaoSair = document.getElementById('btnSairAcessoEncarregadoMotoristas');
  if (!status || !areaAcesso || !botaoEntrar || !botaoSair) return;

  const tokenLocal = obterSessaoTokenEncarregadoMotoristasLocal();
  if (tokenLocal && (!encarregadoMotoristasEquipeAtual ||
      encarregadoMotoristasEquipeAtual.Sessao_Valida !== true)) {
    limparAcessoEncarregadoMotoristasLocal();
    invalidarPainelMotoristasLocal();
  }

  const autenticado = aparelhoAssumiuEncarregadoMotoristasAtual();
  const encarregado = encarregadoMotoristasEquipeAtual;
  status.classList.remove('sem-guarda', 'com-guarda');
  if (encarregado) {
    status.classList.add('com-guarda');
    const nome = valorCampoMotoristas(encarregado, 'nome', 'Nome', 'Nome_Encarregado');
    const rg = valorCampoMotoristas(encarregado, 'rg', 'RG', 'RG_CPF', 'RG_Encarregado');
    status.innerHTML = nome
      ? 'Encarregado em serviço neste ciclo:<br>' + escaparHtml(nome) +
        (rg ? ' — RG ' + escaparHtml(rg) : '') +
        (autenticado ? '<br><small>Acesso ao livro ativo neste aparelho.</small>' : '')
      : 'Há um Encarregado de Motoristas em serviço neste ciclo.';
  } else {
    status.classList.add('sem-guarda');
    status.textContent = 'A função ainda não foi assumida neste ciclo. Entre com seu e-mail para assumir.';
  }

  areaAcesso.classList.toggle('oculto', autenticado);
  botaoEntrar.classList.toggle('oculto', autenticado);
  botaoSair.classList.toggle('oculto', !autenticado);
  if (!autenticado) botaoEntrar.textContent = 'Assumir função';
  atualizarVisibilidadePainelComandante();
}

function mostrarAreaAcessoEncarregadoMotoristas() {
  expandirPerfilServico('perfilEncarregadoMotoristas', true);
  const area = document.getElementById('areaAssumirEncarregadoMotoristas');
  if (area) area.classList.remove('oculto');
  const campoEmail = document.getElementById('emailEncarregadoMotoristas');
  if (campoEmail) campoEmail.focus();
}

function enviarCodigoEncarregadoMotoristas() {
  const campoEmail = document.getElementById('emailEncarregadoMotoristas');
  const email = String(campoEmail && campoEmail.value || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    mostrarMensagem('Informe um e-mail válido.', 'erro');
    return;
  }
  const botao = document.getElementById('btnEnviarCodigoEncarregadoMotoristas');
  botao.disabled = true;
  botao.textContent = 'Enviando...';
  google.script.run
    .withSuccessHandler(resposta => {
      dadosCodigoEncarregadoMotoristas = { email: email };
      salvarCodigoEncarregadoMotoristasPendente(email);
      document.getElementById('areaCodigoEncarregadoMotoristas').classList.remove('oculto');
      document.getElementById('codigoEncarregadoMotoristas').focus();
      botao.disabled = false;
      botao.textContent = 'Reenviar código';
      mostrarMensagem((resposta && resposta.mensagem) ||
        'Se o e-mail estiver autorizado, o código de acesso será enviado.', 'sucesso');
    })
    .withFailureHandler(erro => {
      botao.disabled = false;
      botao.textContent = 'Enviar código';
      mostrarMensagem('Não foi possível enviar o código: ' + erro.message, 'erro');
    })
    .enviarCodigoAcessoEncarregadoMotoristas(email);
}

function validarCodigoEncarregadoMotoristas() {
  const email = String(document.getElementById('emailEncarregadoMotoristas').value || '')
    .trim().toLowerCase();
  const codigo = String(document.getElementById('codigoEncarregadoMotoristas').value || '').trim();
  if (!email || !codigo) {
    mostrarMensagem('Informe o e-mail e o código recebido.', 'erro');
    return;
  }
  const botao = document.getElementById('btnValidarCodigoEncarregadoMotoristas');
  botao.disabled = true;
  botao.textContent = 'Validando...';
  google.script.run
    .withSuccessHandler(resposta => {
      const token = String(resposta && resposta.sessaoToken || '');
      if (!token || !resposta || !resposta.encarregado) {
        botao.disabled = false;
        botao.textContent = 'Confirmar e assumir';
        mostrarMensagem('O servidor não devolveu uma sessão válida. Tente novamente.', 'erro');
        return;
      }
      localStorage.setItem('encarregado_motoristas_sessao_token', token);
      marcarInicioSessaoLocal('encarregado_motoristas_sessao_iniciada_em');
      encarregadoMotoristasEquipeAtual = resposta.encarregado;
      encarregadoMotoristasEquipeAtual.Sessao_Valida = true;
      dadosCodigoEncarregadoMotoristas = null;
      limparCodigoEncarregadoMotoristasPendente();
      limparCodigoAcessoDaUrl();
      document.getElementById('codigoEncarregadoMotoristas').value = '';
      document.getElementById('areaCodigoEncarregadoMotoristas').classList.add('oculto');
      botao.disabled = false;
      botao.textContent = 'Confirmar e assumir';
      invalidarPainelMotoristasLocal();
      atualizarTelaEncarregadoMotoristas();
      carregarIdentidadesEquipeServico(true);
      carregarPainelMotoristas();
      mostrarMensagem((resposta && resposta.mensagem) ||
        'Função de Encarregado de Motoristas assumida e livro liberado neste aparelho.', 'sucesso');
    })
    .withFailureHandler(erro => {
      botao.disabled = false;
      botao.textContent = 'Confirmar e assumir';
      mostrarMensagem('Não foi possível assumir a função: ' + erro.message, 'erro');
    })
    .validarCodigoAcessoEncarregadoMotoristas(email, codigo);
}

function sairAcessoEncarregadoMotoristas(exibirMensagem = true) {
  const token = obterSessaoTokenEncarregadoMotoristasLocal();
  limparAcessoEncarregadoMotoristasLocal();
  dadosCodigoEncarregadoMotoristas = null;
  limparCodigoEncarregadoMotoristasPendente();
  if (encarregadoMotoristasEquipeAtual) {
    encarregadoMotoristasEquipeAtual.Sessao_Valida = false;
  }
  invalidarPainelMotoristasLocal();
  atualizarTelaEncarregadoMotoristas();
  carregarIdentidadesEquipeServico(true);
  if (token) {
    google.script.run
      .withFailureHandler(() => {})
      .revogarSessaoEncarregadoMotoristas(token);
  }
  if (exibirMensagem) {
    mostrarMensagem(
      'Acesso encerrado neste aparelho. A responsabilidade pelo ciclo permanece registrada.',
      'sucesso'
    );
  }
}

function salvarCodigoOficialPendente(email) {
  localStorage.setItem('oficial_dia_email_pendente', email);
  localStorage.setItem('oficial_dia_codigo_pendente_em', new Date().toISOString());
}

function limparCodigoOficialPendente() {
  localStorage.removeItem('oficial_dia_email_pendente');
  localStorage.removeItem('oficial_dia_codigo_pendente_em');
}

function restaurarCodigoOficialPendente() {
  const email = localStorage.getItem('oficial_dia_email_pendente');
  const geradoEm = localStorage.getItem('oficial_dia_codigo_pendente_em');
  if (!email || !geradoEm || Date.now() - new Date(geradoEm).getTime() > 10 * 60 * 1000) {
    limparCodigoOficialPendente(); return;
  }
  document.getElementById('emailOficial').value = email;
  document.getElementById('areaCodigoOficial').classList.remove('oculto');
  dadosCodigoOficial = { email: email, militar: null, ticketAssuncao: '' };
  alternarAcessoPainelOficial(true);
}

function salvarOficialLocal(oficial) {
  oficialAcessoAtual = oficial
    ? { Nome: String(oficial.Nome || 'Oficial do 1º GBM') }
    : null;
  localStorage.setItem('oficial_acesso_militar', JSON.stringify(oficialAcessoAtual || {}));
}

function limparOficialLocal() {
  localStorage.removeItem('oficial_dia_sessao_token');
  localStorage.removeItem('oficial_dia_sessao_iniciada_em');
  localStorage.removeItem('oficial_acesso_militar');
  ['oficial_dia_id_local', 'oficial_dia_nome_local', 'oficial_dia_rg_local'].forEach(chave => localStorage.removeItem(chave));
  oficialAcessoAtual = null;
}

function aparelhoAssumiuOficialAtual() {
  return !!obterSessaoTokenOficialLocal() && !!oficialAcessoAtual;
}

function restaurarAcessoOficial() {
  try {
    const armazenado = JSON.parse(localStorage.getItem('oficial_acesso_militar') || 'null');
    oficialAcessoAtual = armazenado && armazenado.Nome
      ? { Nome: String(armazenado.Nome) }
      : null;
    if (oficialAcessoAtual) {
      localStorage.setItem('oficial_acesso_militar', JSON.stringify(oficialAcessoAtual));
    }
  } catch (erro) {
    oficialAcessoAtual = null;
  }
  atualizarTelaAcessoOficial();
}

function alternarAcessoPainelOficial(forcarAberto = null) {
  const painel = document.getElementById('areaAcessoPainelOficial');
  if (!painel) return;
  const abrir = forcarAberto === null ? painel.classList.contains('oculto') : !!forcarAberto;
  if (abrir) expandirPerfilServico('perfilOficial', true);
  painel.classList.toggle('oculto', !abrir);
  atualizarRotuloAcessoPainelOficial();
}

function atualizarRotuloAcessoPainelOficial() {
  const painel = document.getElementById('areaAcessoPainelOficial');
  const botao = document.getElementById('btnAbrirAcessoOficial');
  if (!painel || !botao) return;
  const aberto = !painel.classList.contains('oculto');
  botao.setAttribute('aria-expanded', String(aberto));
  botao.textContent = aberto
    ? 'Fechar painel'
    : (aparelhoAssumiuOficialAtual() ? 'Painel ativo' : 'Acessar painel');
}

function atualizarTelaAcessoOficial() {
  const autenticado = aparelhoAssumiuOficialAtual();
  const login = document.getElementById('areaLoginOficial');
  const status = document.getElementById('statusAcessoOficial');
  const sair = document.getElementById('btnSairAcessoOficial');
  if (!login || !status || !sair) return;

  login.classList.toggle('oculto', autenticado);
  sair.classList.toggle('oculto', !autenticado);
  status.classList.toggle('oculto', !autenticado);
  if (autenticado) {
    status.innerHTML = '<strong>' + escaparHtml(oficialAcessoAtual.Nome || 'Oficial do 1º GBM') +
      '</strong><br>Acesso ao Painel de Gestão ativo neste aparelho.';
  }
  atualizarRotuloAcessoPainelOficial();
}

function sairAcessoOficial() {
  limparOficialLocal();
  atualizarTelaAcessoOficial();
  atualizarVisibilidadePainelComandante();
  carregarIdentidadesEquipeServico(true);
  mostrarMensagem('Acesso de oficial encerrado neste aparelho.', 'sucesso');
}

function aparelhoTemAcessoPainelGestao() {
  const militarDoEfetivoAutenticado = !!(
    obterSessaoConsultaEfetivo() && consultaEfetivoAtual
  );
  const guardaAutenticado = typeof aparelhoAssumiuGuardaAtual === 'function' &&
    aparelhoAssumiuGuardaAtual();
  const toqueAutenticado = !!(
    obterSessaoTokenToqueLocal() &&
    statusToqueFogoAtual &&
    statusToqueFogoAtual.sessaoValida === true
  );
  const encarregadoMotoristasAutenticado = aparelhoAssumiuEncarregadoMotoristasAtual();

  return aparelhoAssumiuComandanteAtual() ||
    aparelhoAssumiuOficialAtual() ||
    encarregadoMotoristasAutenticado ||
    militarDoEfetivoAutenticado ||
    guardaAutenticado ||
    toqueAutenticado;
}

function obterAssinaturaCredenciaisPainelGestao() {
  return [
    obterSessaoTokenComandanteLocal() || '',
    obterSessaoTokenLocal() || '',
    obterSessaoTokenToqueLocal() || '',
    obterSessaoTokenOficialLocal() || '',
    obterSessaoTokenEncarregadoMotoristasLocal() || '',
    obterSessaoTokenConsultaEfetivoLocal() || ''
  ].join('|');
}

function carregarComandanteAtivo(silencioso = false) {
  carregarIdentidadesEquipeServico(silencioso, true);
}

function atualizarTelaComandante() {
  const status = document.getElementById('statusComandante');
  const areaAssumir = document.getElementById('areaAssumirComandante');
  const btnEncerrar = document.getElementById('btnEncerrarComandante');
  const btnTrocar = document.getElementById('btnTrocarComandante');

  status.classList.remove('sem-guarda', 'com-guarda');

  if (comandanteAtual) {
    const esteAparelhoAssumiu = aparelhoAssumiuComandanteAtual();
    const esteAparelhoReconhecido = aparelhoReconheceComandanteAtual();
    const identidadeDisponivel = !!(comandanteAtual.Nome_Comandante && comandanteAtual.RG_Comandante);

    status.classList.add('com-guarda');
    status.innerHTML = identidadeDisponivel
      ? 'Comandante atual:<br>' + escaparHtml(comandanteAtual.Nome_Comandante) +
        ' — RG ' + escaparHtml(comandanteAtual.RG_Comandante) +
        (esteAparelhoReconhecido && !esteAparelhoAssumiu
          ? '<br><small>Sessão expirada. Use Sair para receber um novo código no e-mail.</small>'
          : '')
      : 'O serviço já possui Comandante da Guarda.<br><small>Entre com seu e-mail para consultar ou trocar o responsável.</small>';

    areaAssumir.classList.add('oculto');
    btnEncerrar.classList.toggle('oculto', !esteAparelhoReconhecido);
    btnTrocar.classList.toggle('oculto', esteAparelhoReconhecido);
    btnTrocar.textContent = 'Assumir / Trocar';
  } else {
    status.classList.add('sem-guarda');
    status.textContent = 'Nenhum Comandante da Guarda ativo. Valide seu e-mail para assumir neste celular.';
    areaAssumir.classList.remove('oculto');
    btnEncerrar.classList.add('oculto');
    btnTrocar.classList.remove('oculto');
    btnTrocar.textContent = 'Entrar';
    limparComandanteLocal();
  }

  atualizarVisibilidadePainelComandante();
  atualizarVisibilidadeGuarnicoesServico();
  atualizarTelaOficial();
}

function atualizarVisibilidadePainelComandante() {
  const painel = document.getElementById('cardPainelComandante');
  const historico = document.getElementById('cardConsultaHistorico');
  const acaoRetroativa = document.getElementById('acaoLancamentoRetroativo');

  if (!painel) return;

  const comandanteNesteAparelho = aparelhoAssumiuComandanteAtual();
  const podeLancarHorarioAnterior = comandanteNesteAparelho &&
    permissoesPainelGestaoAtual.podeLancarHorarioAnterior === true;
  if (acaoRetroativa) acaoRetroativa.classList.toggle('oculto', !podeLancarHorarioAnterior);
  if (!comandanteNesteAparelho && modoLancamentoRetroativoAtivo) {
    cancelarLancamentoRetroativoPendente();
    atualizarPermissaoLancamento();
  }

  if (aparelhoTemAcessoPainelGestao()) {
    painel.classList.remove('oculto');
    if (historico) historico.classList.remove('oculto');

    if (!painelComandanteCarregado) {
      carregarPainelComandante(true);
    }
  } else {
    painel.classList.add('oculto');
    if (historico) historico.classList.add('oculto');
    painelComandanteCarregado = false;
    permissoesPainelGestaoAtual = { podeLancarHorarioAnterior: false };
  }

  atualizarVisibilidadePainelMotoristas();
}

function formatarDataInputLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function alternarConsultaHistorico() {
  const conteudo = document.getElementById('conteudoConsultaHistorico');
  const botao = document.getElementById('btnAlternarConsultaHistorico');
  if (!conteudo || !botao) return;

  const abrir = conteudo.classList.contains('oculto');
  conteudo.classList.toggle('oculto', !abrir);
  botao.setAttribute('aria-expanded', String(abrir));
  botao.setAttribute('aria-label', (abrir ? 'Recolher' : 'Expandir') + ' Consultar histórico');
}

function inicializarFiltrosHistorico() {
  if (historicoInicializado) return;
  const inicio = document.getElementById('historicoDataInicio');
  const fim = document.getElementById('historicoDataFim');
  const termo = document.getElementById('historicoTermo');
  if (!inicio || !fim) return;

  const hoje = new Date();
  const trintaDiasAtras = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 30);
  inicio.value = formatarDataInputLocal(trintaDiasAtras);
  fim.value = formatarDataInputLocal(hoje);
  if (termo) {
    termo.addEventListener('keydown', evento => {
      if (evento.key === 'Enter') {
        evento.preventDefault();
        consultarHistorico();
      }
    });
  }
  historicoInicializado = true;
}

function consultarHistorico() {
  if (!aparelhoTemAcessoPainelGestao()) return;
  const botao = document.getElementById('btnConsultarHistorico');
  const resumo = document.getElementById('resumoHistorico');
  const lista = document.getElementById('listaHistorico');
  const filtros = {
    dataInicio: document.getElementById('historicoDataInicio').value,
    dataFim: document.getElementById('historicoDataFim').value,
    termo: document.getElementById('historicoTermo').value.trim(),
    tipoMovimentacao: document.getElementById('historicoTipo').value,
    categoria: document.getElementById('historicoCategoria').value
  };

  botao.disabled = true;
  botao.textContent = 'Pesquisando...';
  resumo.textContent = 'Consultando o arquivo anual...';
  lista.innerHTML = '';

  google.script.run
    .withSuccessHandler(resultado => {
      renderizarHistorico(resultado || {});
      botao.disabled = false;
      botao.textContent = 'Pesquisar';
    })
    .withFailureHandler(erro => {
      resumo.textContent = erro.message || 'Não foi possível consultar o histórico.';
      lista.innerHTML = '';
      botao.disabled = false;
      botao.textContent = 'Pesquisar';
      mostrarMensagem('Erro ao consultar histórico: ' + erro.message, 'erro');
    })
    .consultarHistoricoMovimentacoes(filtros);
}

function renderizarHistorico(resultado) {
  const lista = document.getElementById('listaHistorico');
  const resumo = document.getElementById('resumoHistorico');
  const link = document.getElementById('linkArquivoHistorico');
  const registros = Array.isArray(resultado.resultados) ? resultado.resultados : [];
  lista.innerHTML = '';

  if (resultado.urlArquivo) {
    link.href = resultado.urlArquivo;
    link.classList.remove('oculto');
  }

  const total = Number(resultado.totalEncontrado || registros.length);
  resumo.textContent = total === 1
    ? '1 movimentação encontrada.'
    : `${total} movimentações encontradas.` + (resultado.limitado ? ' Exibindo as 300 mais recentes.' : '');

  if (!registros.length) {
    lista.appendChild(criarEstadoVazioPainel('Nenhuma movimentação encontrada para esses filtros.'));
    return;
  }

  registros.forEach(registro => {
    const item = document.createElement('div');
    item.className = 'item-painel item-historico';
    if (movimentacaoEhRetroativa(registro)) item.classList.add('movimentacao-retroativa');

    const cabecalho = document.createElement('div');
    cabecalho.className = 'cabecalho-item-painel';
    const nome = document.createElement('strong');
    nome.textContent = registro.nome || 'Pessoa não identificada';
    const tipo = document.createElement('span');
    tipo.className = String(registro.tipoMovimentacao || '').trim().toLowerCase() === 'entrada'
      ? 'movimentacao-entrada' : 'movimentacao-saida';
    tipo.textContent = [registro.tipoMovimentacao, registro.dataHora].filter(Boolean).join(' • ');
    cabecalho.appendChild(nome);
    cabecalho.appendChild(tipo);
    adicionarSeloMovimentacaoRetroativa(cabecalho, registro);
    item.appendChild(cabecalho);

    const detalhes = [
      registro.documento ? 'RG/CPF: ' + registro.documento : '',
      registro.categoria,
      registro.forma,
      registro.prefixoPlaca ? 'Auto/VTR: ' + registro.prefixoPlaca : '',
      registro.funcaoViatura,
      registro.local
    ].filter(Boolean);
    if (detalhes.length) {
      const linha = document.createElement('div');
      linha.className = 'detalhes-item-painel';
      linha.textContent = detalhes.join(' • ');
      item.appendChild(linha);
    }

    const nomeOperador = registro.nomeOperador || registro.Nome_Operador || '';
    const perfilOperador = registro.perfilOperador || registro.Perfil_Operador || '';
    const responsaveis = [
      nomeOperador
        ? 'Lançado por: ' + nomeOperador + (perfilOperador ? ' (' + perfilOperador + ')' : '')
        : (registro.guarda ? 'Guarda: ' + registro.guarda : ''),
      registro.comandante ? 'Comandante: ' + registro.comandante : '',
      movimentacaoEhRetroativa(registro) && registro.dataHoraRegistroReal
        ? 'Registrado em: ' + registro.dataHoraRegistroReal : '',
      movimentacaoEhRetroativa(registro) && registro.motivoRetroativo
        ? 'Motivo retroativo: ' + registro.motivoRetroativo : '',
      registro.observacoes ? 'Obs.: ' + registro.observacoes : ''
    ].filter(Boolean);
    if (responsaveis.length) {
      const linha = document.createElement('div');
      linha.className = 'detalhes-item-painel detalhes-historico-secundarios';
      linha.textContent = responsaveis.join(' • ');
      item.appendChild(linha);
    }
    lista.appendChild(item);
  });
}

function carregarPainelComandante(silencioso = false) {
  if (!aparelhoTemAcessoPainelGestao()) {
    atualizarVisibilidadePainelComandante();
    return;
  }
  if (painelComandanteEmCarregamento) return;

  const botao = document.getElementById('btnAtualizarPainelComandante');
  const assinaturaRequisicao = obterAssinaturaCredenciaisPainelGestao();
  painelComandanteEmCarregamento = true;

  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Atualizando...';
  }

  google.script.run
    .withSuccessHandler((painel) => {
      painelComandanteEmCarregamento = false;
      const respostaObsoleta = assinaturaRequisicao !== obterAssinaturaCredenciaisPainelGestao();

      if (!respostaObsoleta) {
        renderizarPainelComandante(painel || {});
        painelComandanteCarregado = true;
      }

      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }

      if (respostaObsoleta && aparelhoTemAcessoPainelGestao()) {
        painelComandanteCarregado = false;
        carregarPainelComandante(true);
      }
    })
    .withFailureHandler((erro) => {
      painelComandanteEmCarregamento = false;
      const respostaObsoleta = assinaturaRequisicao !== obterAssinaturaCredenciaisPainelGestao();

      if (!silencioso && !respostaObsoleta) {
        mostrarMensagem('Erro ao atualizar painel: ' + erro.message, 'erro');
      }

      if (!respostaObsoleta && !aparelhoAssumiuComandanteAtual() && aparelhoAssumiuOficialAtual()) {
        limparOficialLocal();
        atualizarTelaAcessoOficial();
        atualizarVisibilidadePainelComandante();
      }

      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }

      if (respostaObsoleta && aparelhoTemAcessoPainelGestao()) {
        painelComandanteCarregado = false;
        carregarPainelComandante(true);
      }
    })
    .getPainelComandante();
}

function renderizarPainelComandante(painel) {
  const totais = painel.totais || {};
  permissoesPainelGestaoAtual = painel && painel.permissoes
    ? painel.permissoes
    : { podeLancarHorarioAnterior: false };
  const acaoRetroativa = document.getElementById('acaoLancamentoRetroativo');
  const podeLancarHorarioAnterior = aparelhoAssumiuComandanteAtual() &&
    permissoesPainelGestaoAtual.podeLancarHorarioAnterior === true;
  if (acaoRetroativa) acaoRetroativa.classList.toggle('oculto', !podeLancarHorarioAnterior);

  document.getElementById('totalPessoasDentro').textContent = totais.pessoasDentro || 0;
  document.getElementById('totalViaturasDentro').textContent = totais.viaturasDentro || 0;
  document.getElementById('totalViaturasDisponiveis').textContent = totais.viaturasDisponiveis || 0;
  document.getElementById('totalViaturasEmOcorrencia').textContent = totais.viaturasEmOcorrencia || 0;
  document.getElementById('totalMovimentacoesCiclo').textContent = totais.movimentacoesCiclo || 0;
  document.getElementById('cicloPainelComandante').textContent =
    painel.cicloInicio && painel.cicloFim
      ? `${painel.cicloInicio} até ${painel.cicloFim}`
      : 'Ciclo das 08h às 08h';
  document.getElementById('atualizadoEmPainelComandante').textContent =
    painel.atualizadoEm ? 'Atualizado em ' + painel.atualizadoEm : '';

  renderizarListaPessoasDentro(painel.dentro || []);
  renderizarListaMovimentacoesRecentes(painel.recentes || []);
  renderizarViaturasQuartelPainel(painel.viaturasQuartel || []);
}

function renderizarViaturasQuartelPainel(viaturas) {
  const lista = document.getElementById('listaViaturasQuartel');
  lista.innerHTML = '';

  if (!viaturas.length) {
    lista.appendChild(criarEstadoVazioPainel('Nenhuma viatura do quartel cadastrada.'));
    return;
  }

  viaturas.forEach(viatura => {
    const item = document.createElement('div');
    item.className = 'item-painel item-viatura-quartel ' +
      (viatura.Situacao_Atual === 'Em ocorrência' ? 'viatura-em-sos' : 'viatura-disponivel');
    const cabecalho = document.createElement('div');
    cabecalho.className = 'cabecalho-item-painel';
    const nome = document.createElement('strong');
    nome.textContent = viatura.Prefixo + (viatura.Descricao ? ' — ' + viatura.Descricao : '');
    const status = document.createElement('span');
    status.textContent = viatura.Situacao_Atual + (viatura.Categoria ? ' • ' + viatura.Categoria : '');
    cabecalho.appendChild(nome);
    cabecalho.appendChild(status);
    item.appendChild(cabecalho);

    if (viatura.Nome_Condutor_Atual) {
      const detalhes = document.createElement('div');
      detalhes.className = 'detalhes-item-painel';
      detalhes.textContent = 'Condutor: ' + viatura.Nome_Condutor_Atual;
      item.appendChild(detalhes);
    }

    lista.appendChild(item);
  });
}

function renderizarListaPessoasDentro(pessoas) {
  const lista = document.getElementById('listaPessoasDentro');
  lista.innerHTML = '';

  if (!pessoas.length) {
    lista.appendChild(criarEstadoVazioPainel('Nenhuma pessoa registrada dentro do quartel.'));
    return;
  }

  pessoas.forEach(pessoa => {
    const item = document.createElement('div');
    item.className = 'item-painel item-dentro';
    if (movimentacaoEhRetroativa(pessoa)) item.classList.add('movimentacao-retroativa');

    const cabecalho = document.createElement('div');
    cabecalho.className = 'cabecalho-item-painel';

    const nome = document.createElement('strong');
    nome.textContent = pessoa.nome || 'Pessoa não identificada';

    const horario = document.createElement('span');
    horario.textContent = pessoa.dataHora || '';

    cabecalho.appendChild(nome);
    cabecalho.appendChild(horario);
    adicionarSeloMovimentacaoRetroativa(cabecalho, pessoa);
    item.appendChild(cabecalho);
    item.appendChild(criarDetalhesPessoaPainel(pessoa));
    lista.appendChild(item);
  });
}

function renderizarListaMovimentacoesRecentes(movimentacoes, idLista = 'listaMovimentacoesRecentes') {
  const lista = document.getElementById(idLista);
  if (!lista) return;
  lista.innerHTML = '';

  if (!movimentacoes.length) {
    lista.appendChild(criarEstadoVazioPainel('Nenhuma movimentação registrada no período.'));
    return;
  }

  movimentacoes.forEach(movimentacao => {
    const item = document.createElement('div');
    const tipo = movimentacao.tipoMovimentacao === 'Saída' ? 'saida' : 'entrada';
    item.className = 'item-painel movimentacao-' + tipo;
    if (movimentacaoEhRetroativa(movimentacao)) item.classList.add('movimentacao-retroativa');

    const cabecalho = document.createElement('div');
    cabecalho.className = 'cabecalho-item-painel';

    const nome = document.createElement('strong');
    nome.textContent = movimentacao.nome || 'Pessoa não identificada';

    const tipoHorario = document.createElement('span');
    tipoHorario.textContent = (movimentacao.tipoMovimentacao || '') + ' • ' + (movimentacao.dataHora || '');

    cabecalho.appendChild(nome);
    cabecalho.appendChild(tipoHorario);
    adicionarSeloMovimentacaoRetroativa(cabecalho, movimentacao);
    item.appendChild(cabecalho);
    item.appendChild(criarDetalhesPessoaPainel(movimentacao));
    lista.appendChild(item);
  });
}

function criarDetalhesPessoaPainel(pessoa) {
  const detalhes = document.createElement('div');
  detalhes.className = 'detalhes-item-painel';
  const partes = [];

  if (pessoa.documento) partes.push('Doc.: ' + pessoa.documento);
  if (pessoa.tipoPessoa) partes.push(pessoa.tipoPessoa);
  if (pessoa.destino) partes.push('Destino: ' + pessoa.destino);
  if (pessoa.prefixoPlaca) {
    partes.push(
      (pessoa.funcaoViatura ? pessoa.funcaoViatura + ' • ' : '') +
      'Viatura ' + pessoa.prefixoPlaca
    );
  }

  const nomeOperador = pessoa.nomeOperador || pessoa.Nome_Operador || '';
  const perfilOperador = pessoa.perfilOperador || pessoa.Perfil_Operador || '';
  if (nomeOperador) {
    partes.push('Lançado por: ' + nomeOperador + (perfilOperador ? ' (' + perfilOperador + ')' : ''));
  }

  if (movimentacaoEhRetroativa(pessoa)) {
    if (pessoa.dataHoraRegistroReal) partes.push('Registrado em: ' + pessoa.dataHoraRegistroReal);
    if (pessoa.motivoRetroativo) partes.push('Motivo retroativo: ' + pessoa.motivoRetroativo);
  }

  detalhes.textContent = partes.join(' • ') || 'Sem detalhes adicionais';
  return detalhes;
}

function movimentacaoEhRetroativa(movimentacao) {
  const valor = String(
    movimentacao && (
      movimentacao.lancamentoRetroativo ||
      movimentacao.Lancamento_Retroativo ||
      movimentacao.retroativo
    ) || ''
  ).trim().toLowerCase();
  return valor === 'sim' || valor === 'true' || valor === 'retroativo';
}

function adicionarSeloMovimentacaoRetroativa(conteiner, movimentacao) {
  if (!conteiner || !movimentacaoEhRetroativa(movimentacao)) return;
  const selo = document.createElement('span');
  selo.className = 'selo-movimentacao-retroativa';
  selo.textContent = 'RETROATIVO';
  conteiner.appendChild(selo);
}

function criarEstadoVazioPainel(texto) {
  const vazio = document.createElement('div');
  vazio.className = 'estado-vazio-painel';
  vazio.textContent = texto;
  return vazio;
}

function carregarPessoasDentroGuarda(silencioso = false) {
  if (!aparelhoPodeOperarGuardaAtual()) {
    atualizarVisibilidadePessoasDentroGuarda();
    return;
  }

  const botao = document.getElementById('btnAtualizarPessoasDentroGuarda');

  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Atualizando...';
  }

  google.script.run
    .withSuccessHandler((resposta) => {
      renderizarPessoasDentroGuarda(resposta && resposta.pessoas ? resposta.pessoas : []);
      pessoasDentroGuardaCarregadas = true;

      const atualizadoEm = document.getElementById('atualizadoEmPessoasDentroGuarda');
      if (atualizadoEm) {
        atualizadoEm.textContent = resposta && resposta.atualizadoEm
          ? 'Atualizado em ' + resposta.atualizadoEm
          : '';
      }

      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }
    })
    .withFailureHandler((erro) => {
      if (!silencioso) {
        mostrarMensagem('Erro ao carregar pessoas dentro: ' + erro.message, 'erro');
      }

      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }
    })
    .getPessoasDentroGuarda();
}

function atualizarResumoPessoasDentroGuarda(pessoas) {
  const resumo = document.getElementById('resumoPessoasDentroGuarda');

  if (!resumo) return;

  const total = Array.isArray(pessoas) ? pessoas.length : 0;
  resumo.textContent = total === 1 ? '1 pessoa dentro' : total + ' pessoas dentro';
}

function definirPessoasDentroGuardaRecolhido(recolhido) {
  const card = document.getElementById('cardPessoasDentroGuarda');
  const conteudo = document.getElementById('conteudoPessoasDentroGuarda');
  const botao = document.getElementById('btnAlternarPessoasDentroGuarda');

  if (!card || !conteudo || !botao) return;

  conteudo.hidden = recolhido;
  card.classList.toggle('recolhido', recolhido);
  botao.setAttribute('aria-expanded', recolhido ? 'false' : 'true');
  localStorage.setItem('pessoas_dentro_recolhido', recolhido ? 'sim' : 'nao');
}

function alternarPessoasDentroGuarda() {
  const conteudo = document.getElementById('conteudoPessoasDentroGuarda');

  if (!conteudo) return;

  definirPessoasDentroGuardaRecolhido(!conteudo.hidden);
}

function restaurarEstadoPessoasDentroGuarda() {
  definirPessoasDentroGuardaRecolhido(
    localStorage.getItem('pessoas_dentro_recolhido') === 'sim'
  );
}

function renderizarPessoasDentroGuarda(pessoas) {
  const lista = document.getElementById('listaPessoasDentroGuarda');

  if (!lista) return;

  lista.innerHTML = '';
  atualizarResumoPessoasDentroGuarda(pessoas);

  if (!pessoas.length) {
    lista.appendChild(criarEstadoVazioPainel('Nenhuma pessoa consta como dentro do quartel.'));
    return;
  }

  pessoas.forEach(pessoa => {
    const item = document.createElement('div');
    item.className = 'item-painel item-dentro item-pessoa-dentro-guarda';

    const informacoes = document.createElement('div');
    const cabecalho = document.createElement('div');
    cabecalho.className = 'cabecalho-item-painel';

    const nome = document.createElement('strong');
    nome.textContent = pessoa.nome || 'Pessoa não identificada';

    const horario = document.createElement('span');
    horario.textContent = 'Entrada • ' + (pessoa.dataHora || 'horário não informado');

    cabecalho.appendChild(nome);
    cabecalho.appendChild(horario);
    informacoes.appendChild(cabecalho);
    informacoes.appendChild(criarDetalhesPessoaPainel(pessoa));
    item.appendChild(informacoes);

    const botaoSaida = document.createElement('button');
    botaoSaida.type = 'button';
    botaoSaida.className = 'botao-saida-rapida';
    botaoSaida.textContent = 'Registrar saída';
    botaoSaida.onclick = () => confirmarSaidaRapidaPessoa(pessoa, botaoSaida);
    item.appendChild(botaoSaida);
    lista.appendChild(item);
  });
}

function confirmarSaidaRapidaPessoa(pessoa, botao) {
  abrirModalConfirmacao(
    'Registrar saída',
    'Confirma a saída de <strong>' + escaparHtml(pessoa.nome || 'pessoa não identificada') +
      '</strong>?<br><br>O registro ficará vinculado ao militar que está efetivamente no posto.',
    () => registrarSaidaRapidaPessoaGuarda(pessoa.idMovimentacao, botao),
    true
  );
}

function registrarSaidaRapidaPessoaGuarda(idMovimentacaoEntrada, botao) {
  if (!garantirPermissaoOperacionalAtual()) return;

  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Registrando...';
  }

  google.script.run
    .withSuccessHandler((resposta) => {
      mostrarMensagem(resposta.mensagem || 'Saída registrada com sucesso.', 'sucesso');
      renderizarPessoasDentroGuarda(resposta.pessoasDentro || []);

      const atualizadoEm = document.getElementById('atualizadoEmPessoasDentroGuarda');
      if (atualizadoEm && resposta.atualizadoEm) {
        atualizadoEm.textContent = 'Atualizado em ' + resposta.atualizadoEm;
      }

      if (aparelhoTemAcessoPainelGestao()) {
        carregarPainelComandante(true);
      }
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Erro ao registrar saída: ' + erro.message, 'erro');

      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Registrar saída';
      }

      carregarPessoasDentroGuarda(true);
      carregarMovimentacoesGuarda(true);
    })
    .registrarSaidaRapidaPessoa(idMovimentacaoEntrada);
}

function inicializarPainelMotoristas() {
  const abaSalva = localStorage.getItem('painel_motoristas_aba');
  if (abaSalva && ABAS_PAINEL_MOTORISTAS[abaSalva]) abaPainelMotoristasAtual = abaSalva;
  selecionarAbaPainelMotoristas(abaPainelMotoristasAtual, false);
}

function obterAssinaturaSessaoPessoalMotoristas() {
  return obterSessaoTokenEncarregadoMotoristasLocal() || '';
}

function limparConteudoPainelMotoristas() {
  const textos = {
    totalMotoristasOperantes: '0',
    totalMotoristasInoperantes: '0',
    totalMotoristasForaUnidade: '0',
    totalMotoristasSisgeoPendentes: '0',
    nomeEncarregadoMotoristas: '',
    perfilAcessoMotoristas: '',
    atualizadoEmPainelMotoristas: ''
  };
  Object.keys(textos).forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = textos[id];
  });
  const lista = document.getElementById('listaPainelMotoristas');
  if (lista) lista.innerHTML = '';
  const viaturas = document.getElementById('viaturaEventoMotoristas');
  if (viaturas) viaturas.innerHTML = '<option value="">Selecione a viatura</option>';
}

function atualizarVisibilidadePainelMotoristas() {
  const card = document.getElementById('cardPainelMotoristas');
  if (!card) return;
  const assinaturaAtual = obterAssinaturaSessaoPessoalMotoristas();
  const possuiSessaoPessoal = !!assinaturaAtual;

  if (!possuiSessaoPessoal) {
    card.classList.add('oculto');
    painelMotoristasAtual = null;
    painelMotoristasCarregado = false;
    painelMotoristasAutorizado = false;
    assinaturaPainelMotoristasCarregado = '';
    limparConteudoPainelMotoristas();
    fecharModalEventoMotoristas(false);
    return;
  }

  if (assinaturaPainelMotoristasCarregado !== assinaturaAtual) {
    painelMotoristasAtual = null;
    painelMotoristasCarregado = false;
    painelMotoristasAutorizado = false;
  }

  card.classList.toggle('oculto', !painelMotoristasAutorizado);
  if (!painelMotoristasCarregado) carregarPainelMotoristas(true);
}

function carregarPainelMotoristas(silencioso = false) {
  const assinaturaRequisicao = obterAssinaturaSessaoPessoalMotoristas();
  if (!assinaturaRequisicao) {
    atualizarVisibilidadePainelMotoristas();
    return;
  }
  if (painelMotoristasEmCarregamento) return;
  const botao = document.getElementById('btnAtualizarPainelMotoristas');
  painelMotoristasEmCarregamento = true;
  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Atualizando...';
  }
  google.script.run
    .withSuccessHandler(resposta => {
      painelMotoristasEmCarregamento = false;
      const respostaObsoleta = assinaturaRequisicao !== obterAssinaturaSessaoPessoalMotoristas();
      if (!respostaObsoleta) {
        const painel = extrairPainelMotoristasResposta(resposta);
        const autorizado = painel && painel.autorizado === true &&
          painel.permissoes && painel.permissoes.podeAcessar === true;
        if (autorizado) {
          renderizarPainelMotoristas(painel);
        } else {
          painelMotoristasAtual = null;
          painelMotoristasAutorizado = false;
          const card = document.getElementById('cardPainelMotoristas');
          if (card) card.classList.add('oculto');
          limparConteudoPainelMotoristas();
          fecharModalEventoMotoristas(false);
        }
        painelMotoristasCarregado = true;
        assinaturaPainelMotoristasCarregado = assinaturaRequisicao;
      }
      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }
      if (respostaObsoleta && obterAssinaturaSessaoPessoalMotoristas()) {
        painelMotoristasCarregado = false;
        carregarPainelMotoristas(true);
      }
    })
    .withFailureHandler(erro => {
      painelMotoristasEmCarregamento = false;
      const respostaObsoleta = assinaturaRequisicao !== obterAssinaturaSessaoPessoalMotoristas();
      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }
      if (respostaObsoleta && obterAssinaturaSessaoPessoalMotoristas()) {
        painelMotoristasCarregado = false;
        assinaturaPainelMotoristasCarregado = '';
        carregarPainelMotoristas(true);
      } else {
        painelMotoristasAtual = null;
        painelMotoristasCarregado = false;
        painelMotoristasAutorizado = false;
        assinaturaPainelMotoristasCarregado = '';
        const card = document.getElementById('cardPainelMotoristas');
        if (card) card.classList.add('oculto');
        limparConteudoPainelMotoristas();
        fecharModalEventoMotoristas(false);
        const mensagemErro = String(erro && erro.message || erro || '').toLowerCase();
        if (/sess[aã]o|valide seu e-mail|encarregado de motoristas deste ciclo/.test(mensagemErro)) {
          carregarIdentidadesEquipeServico(true);
        }
        if (!silencioso) {
          mostrarMensagem('Erro ao atualizar o livro do Encarregado de Motoristas: ' + erro.message, 'erro');
        }
      }
    })
    .getPainelMotoristas();
}

function extrairPainelMotoristasResposta(resposta) {
  return resposta && resposta.painelMotoristas ? resposta.painelMotoristas : (resposta || {});
}

function valorCampoMotoristas(objeto, ...nomes) {
  const fonte = objeto || {};
  for (const nome of nomes) {
    if (fonte[nome] !== undefined && fonte[nome] !== null) return fonte[nome];
  }
  return '';
}

function normalizarTextoMotoristas(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('pt-BR')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizarBooleanoMotoristas(valor, padrao = true) {
  if (typeof valor === 'boolean') return valor;
  const texto = normalizarTextoMotoristas(valor);
  if (['NAO', 'N', '0', 'INATIVO', 'FALSE'].includes(texto)) return false;
  if (['SIM', 'S', '1', 'ATIVO', 'TRUE'].includes(texto)) return true;
  return padrao;
}

function renderizarPainelMotoristas(painel) {
  const card = document.getElementById('cardPainelMotoristas');
  const autorizado = painel && painel.autorizado === true && painel.permissoes &&
    painel.permissoes.podeAcessar === true;
  if (!autorizado) {
    painelMotoristasAtual = null;
    painelMotoristasAutorizado = false;
    if (card) card.classList.add('oculto');
    limparConteudoPainelMotoristas();
    fecharModalEventoMotoristas(false);
    return;
  }

  painelMotoristasAtual = painel || {};
  painelMotoristasAutorizado = true;
  if (card) card.classList.remove('oculto');
  const resumo = painelMotoristasAtual.resumo || painelMotoristasAtual.totais || {};
  const ciclo = painelMotoristasAtual.ciclo || {};
  const encarregado = painelMotoristasAtual.encarregado || null;
  const permissoes = painelMotoristasAtual.permissoes || {};
  const podeEditar = permissoes.podeEditar === true;

  if (!podeEditar) fecharModalEventoMotoristas(false);

  document.getElementById('totalMotoristasOperantes').textContent = Number(resumo.operantes || 0);
  document.getElementById('totalMotoristasInoperantes').textContent = Number(resumo.inoperantes || 0);
  document.getElementById('totalMotoristasForaUnidade').textContent = Number(resumo.foraUnidade || 0);
  document.getElementById('totalMotoristasSisgeoPendentes').textContent = Number(resumo.sisgeoPendentes || 0);
  const faixaCiclo = ciclo.faixa || (ciclo.inicio && ciclo.fim ? String(ciclo.inicio) + ' até ' + String(ciclo.fim) : '');
  document.getElementById('cicloPainelMotoristas').textContent = faixaCiclo || 'Ciclo das 08h às 08h';

  const nomeEncarregado = document.getElementById('nomeEncarregadoMotoristas');
  const perfil = document.getElementById('perfilAcessoMotoristas');
  if (encarregado) {
    const nome = valorCampoMotoristas(encarregado, 'nome', 'Nome', 'Nome_Encarregado') || 'Militar não identificado';
    const rg = valorCampoMotoristas(encarregado, 'rg', 'RG', 'RG_CPF', 'RG_Encarregado');
    nomeEncarregado.textContent = nome + (rg ? ' — RG ' + rg : '');
  } else {
    nomeEncarregado.textContent = 'Função ainda não assumida';
  }
  const origem = encarregado && valorCampoMotoristas(encarregado, 'origem', 'Origem');
  const perfilTexto = valorCampoMotoristas(permissoes, 'perfil', 'Perfil');
  perfil.textContent = [origem ? 'Origem: ' + origem : '', perfilTexto ? 'Seu acesso: ' + perfilTexto : '']
    .filter(Boolean).join(' • ');
  document.getElementById('avisoSomenteLeituraMotoristas').classList.add('oculto');
  document.getElementById('atualizadoEmPainelMotoristas').textContent = painelMotoristasAtual.atualizadoEm
    ? 'Atualizado em ' + painelMotoristasAtual.atualizadoEm : '';
  preencherListasMilitaresMotoristas();
  selecionarAbaPainelMotoristas(abaPainelMotoristasAtual, false);
}

function selecionarAbaPainelMotoristas(aba, salvar = true) {
  if (!ABAS_PAINEL_MOTORISTAS[aba]) aba = 'frota';
  abaPainelMotoristasAtual = aba;
  if (salvar) localStorage.setItem('painel_motoristas_aba', aba);
  document.querySelectorAll('[data-aba-motoristas]').forEach(botao => {
    const ativa = botao.dataset.abaMotoristas === aba;
    botao.classList.toggle('ativa', ativa);
    botao.setAttribute('aria-selected', String(ativa));
    botao.tabIndex = ativa ? 0 : -1;
  });
  const configuracao = ABAS_PAINEL_MOTORISTAS[aba];
  const titulo = document.getElementById('tituloAbaPainelMotoristas');
  const descricao = document.getElementById('descricaoAbaPainelMotoristas');
  const botaoNovo = document.getElementById('btnNovoEventoMotoristas');
  if (titulo) titulo.textContent = configuracao.titulo;
  if (descricao) descricao.textContent = configuracao.descricao;
  const podeEditar = !!(painelMotoristasAtual && painelMotoristasAtual.permissoes &&
    painelMotoristasAtual.permissoes.podeEditar === true);
  if (botaoNovo) {
    botaoNovo.textContent = configuracao.acao || '';
    botaoNovo.disabled = configuracao.automatico === true;
    botaoNovo.classList.toggle('oculto', !podeEditar || configuracao.automatico === true);
  }
  renderizarConteudoAbaPainelMotoristas();
}

function renderizarConteudoAbaPainelMotoristas() {
  const lista = document.getElementById('listaPainelMotoristas');
  if (!lista) return;
  lista.innerHTML = '';
  if (!painelMotoristasAtual) {
    lista.appendChild(criarEstadoVazioPainel('Carregando o livro do Encarregado de Motoristas...'));
    return;
  }
  if (abaPainelMotoristasAtual === 'frota') renderizarFrotaPainelMotoristas(lista);
  else if (abaPainelMotoristasAtual === 'administrativa') {
    renderizarMovimentacoesAdministrativasMotoristas(lista);
  } else renderizarRegistrosPainelMotoristas(lista, abaPainelMotoristasAtual);
}

function obterIdViaturaMotoristas(viatura) {
  return String(valorCampoMotoristas(viatura, 'vehicleId', 'idViatura', 'ID_Viatura', 'id') || '');
}

function obterPrefixoViaturaMotoristas(viatura) {
  return String(valorCampoMotoristas(viatura, 'prefixo', 'Prefixo', 'Prefixo_no_Momento') || 'Viatura');
}

function obterCondicaoViaturaMotoristas(viatura) {
  return String(valorCampoMotoristas(viatura, 'condicaoOperacional', 'Condicao_Operacional', 'condicao') || 'Não informada');
}

function renderizarFrotaPainelMotoristas(lista) {
  const viaturas = Array.isArray(painelMotoristasAtual.viaturas) ? painelMotoristasAtual.viaturas : [];
  const ativas = viaturas.filter(viatura => normalizarBooleanoMotoristas(valorCampoMotoristas(viatura, 'ativo', 'Ativo'), true));
  const podeEditar = painelMotoristasAtual.permissoes && painelMotoristasAtual.permissoes.podeEditar === true;
  if (!ativas.length) {
    lista.appendChild(criarEstadoVazioPainel('Nenhuma viatura ativa encontrada.'));
    return;
  }
  ativas.forEach(viatura => {
    const item = document.createElement('div');
    const condicao = obterCondicaoViaturaMotoristas(viatura);
    const tokenCondicao = normalizarTextoMotoristas(condicao);
    const classeCondicao = tokenCondicao === 'INOPERANTE' ? 'inoperante' : (tokenCondicao === 'OPERANTE' ? 'operante' : '');
    item.className = 'item-painel item-frota-motoristas ' + classeCondicao;
    const linha = document.createElement('div');
    linha.className = 'linha-principal-frota-motoristas';
    const identidade = document.createElement('div');
    const prefixo = document.createElement('strong');
    prefixo.textContent = obterPrefixoViaturaMotoristas(viatura);
    const descricao = document.createElement('small');
    descricao.textContent = [valorCampoMotoristas(viatura, 'descricao', 'Descricao'),
      valorCampoMotoristas(viatura, 'categoria', 'Categoria')].filter(Boolean).join(' • ') || 'Viatura da unidade';
    identidade.appendChild(prefixo);
    identidade.appendChild(descricao);
    const selos = document.createElement('div');
    selos.className = 'selos-frota-motoristas';
    const seloCondicao = document.createElement('span');
    seloCondicao.className = 'selo-frota-motoristas ' + classeCondicao;
    seloCondicao.textContent = condicao;
    const seloLocal = document.createElement('span');
    seloLocal.className = 'selo-frota-motoristas';
    seloLocal.textContent = valorCampoMotoristas(viatura, 'situacaoAtual', 'Situacao_Atual') || 'Local não informado';
    selos.appendChild(seloCondicao);
    selos.appendChild(seloLocal);
    linha.appendChild(identidade);
    linha.appendChild(selos);
    item.appendChild(linha);
    const detalhes = [
      valorCampoMotoristas(viatura, 'kmAtual', 'KM_Atual') !== '' ? 'KM: ' + valorCampoMotoristas(viatura, 'kmAtual', 'KM_Atual') : '',
      valorCampoMotoristas(viatura, 'destinoAtual', 'Destino_Atual') ? 'Destino: ' + valorCampoMotoristas(viatura, 'destinoAtual', 'Destino_Atual') : '',
      valorCampoMotoristas(viatura, 'observacaoCondicao', 'Observacao_Condicao')
    ].filter(Boolean);
    if (detalhes.length) {
      const detalhe = document.createElement('div');
      detalhe.className = 'detalhes-frota-motoristas';
      detalhe.textContent = detalhes.join(' • ');
      item.appendChild(detalhe);
    }
    if (podeEditar) {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'botao-condicao-frota-motoristas';
      botao.textContent = 'Atualizar condição operacional';
      botao.addEventListener('click', () => abrirModalEventoMotoristas('CONDICAO', obterIdViaturaMotoristas(viatura)));
      item.appendChild(botao);
    }
    lista.appendChild(item);
  });
}

function obterTipoRegistroMotoristas(registro) {
  return normalizarTextoMotoristas(valorCampoMotoristas(registro, 'tipo', 'Tipo'));
}

function registroPertenceAbaMotoristas(registro, aba) {
  const configuracao = ABAS_PAINEL_MOTORISTAS[aba];
  if (!configuracao) return false;
  const tipos = configuracao.tiposRegistro || [configuracao.tipo];
  return tipos.map(normalizarTextoMotoristas).includes(obterTipoRegistroMotoristas(registro));
}

function rotuloTipoRegistroMotoristas(tipo) {
  const rotulos = { CONDICAO: 'Condição operacional', ABASTECIMENTO: 'Abastecimento', ALTERACAO: 'Alteração',
    MOV_ADMINISTRATIVA: 'Movimento administrativo', MANUTENCAO: 'Manutenção', SISGEO: 'SISGEO',
    OBSERVACAO_GERAL: 'Observação geral', CADASTRO: 'Cadastro', ALTERACAO_CADASTRO: 'Alteração cadastral',
    SUBSTITUICAO: 'Substituição' };
  return rotulos[tipo] || String(tipo || 'Registro').replace(/_/g, ' ');
}

function formatarValorMonetarioMotoristas(valor) {
  const numero = Number(String(valor === undefined || valor === null ? '' : valor).replace(',', '.'));
  return Number.isFinite(numero) ? numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
}

function registroAdministrativoVeioDaGuardaMotoristas(registro) {
  const origem = normalizarTextoMotoristas(valorCampoMotoristas(
    registro, 'origemRegistro', 'Origem_Registro', 'origem', 'Origem'
  ));
  const somenteLeitura = valorCampoMotoristas(registro, 'somenteLeitura', 'Somente_Leitura');
  return origem === 'CONTROLE_ACESSO' || normalizarBooleanoMotoristas(somenteLeitura, false);
}

function renderizarMovimentacoesAdministrativasMotoristas(lista) {
  const todos = Array.isArray(painelMotoristasAtual.registros) ? painelMotoristasAtual.registros : [];
  const registros = todos.filter(registro => registroPertenceAbaMotoristas(registro, 'administrativa'));
  if (!registros.length) {
    lista.appendChild(criarEstadoVazioPainel(
      'Nenhuma entrada ou saída de viatura administrativa foi registrada pela Guarda neste ciclo.'
    ));
    return;
  }

  registros.slice(0, 30).forEach(registro => {
    const integrado = registroAdministrativoVeioDaGuardaMotoristas(registro);
    const movimento = String(valorCampoMotoristas(
      registro, 'tipoMovimentacao', 'movimentoResultado', 'resultado', 'movimento',
      'Tipo_Movimentacao', 'Movimento_Resultado'
    ) || '').trim();
    const movimentoNormalizado = normalizarTextoMotoristas(movimento);
    const prefixo = String(valorCampoMotoristas(
      registro, 'prefixo', 'prefixoPlaca', 'prefixoNoMomento',
      'Prefixo', 'Prefixo_Placa', 'Prefixo_no_Momento'
    ) || '').trim();
    const dataHora = String(valorCampoMotoristas(
      registro, 'dataHoraEvento', 'dataHora', 'DataHora_Evento', 'DataHora'
    ) || '').trim();
    const nomeCondutor = String(valorCampoMotoristas(
      registro, 'nomeCondutor', 'condutorNome', 'nome', 'Nome_Condutor'
    ) || '').trim();
    const rgCondutor = String(valorCampoMotoristas(
      registro, 'rgCondutor', 'documento', 'RG_Condutor', 'RG_CPF_Condutor'
    ) || '').trim();
    const destino = String(valorCampoMotoristas(
      registro, 'destino', 'Destino', 'destinoFornecedor', 'Destino_Fornecedor'
    ) || '').trim();
    const procedencia = String(valorCampoMotoristas(
      registro, 'procedencia', 'Procedência', 'Procedencia'
    ) || '').trim();
    const complementoProcedencia = String(valorCampoMotoristas(
      registro, 'complementoProcedencia', 'Complemento_Procedência', 'Complemento_Procedencia'
    ) || '').trim();
    const localConsolidado = String(valorCampoMotoristas(
      registro, 'destinoFornecedor', 'Destino_Fornecedor'
    ) || '').trim();
    const nomeGuarda = String(valorCampoMotoristas(
      registro, 'nomeGuardaHorario', 'Nome_Guarda_Horario'
    ) || '').trim();
    const nomeOperador = String(valorCampoMotoristas(
      registro, 'nomeOperador', 'Nome_Operador'
    ) || '').trim();
    const perfilOperador = String(valorCampoMotoristas(
      registro, 'perfilOperador', 'Perfil_Operador'
    ) || '').trim();
    const quantidadeOcupantes = Number(valorCampoMotoristas(
      registro, 'quantidadeOcupantes', 'Quantidade_Ocupantes'
    ));
    const observacoes = String(valorCampoMotoristas(registro, 'observacoes', 'Observacoes') || '').trim();
    const retroativo = normalizarBooleanoMotoristas(
      valorCampoMotoristas(registro, 'lancamentoRetroativo', 'Lancamento_Retroativo'), false
    );
    const motivoRetroativo = String(valorCampoMotoristas(
      registro, 'motivoRetroativo', 'Motivo_Retroativo'
    ) || '').trim();
    const dataHoraRegistro = String(valorCampoMotoristas(
      registro, 'dataHoraRegistro', 'DataHora_Registro_Real'
    ) || '').trim();
    const retroativoJaDescrito = normalizarTextoMotoristas(observacoes)
      .includes('LANCAMENTO_RETROATIVO');

    const item = document.createElement('div');
    item.className = 'item-painel item-registro-motoristas item-movimento-administrativo';

    const linha = document.createElement('div');
    linha.className = 'linha-principal-registro-motoristas';
    const identidade = document.createElement('div');
    const titulo = document.createElement('strong');
    titulo.textContent = [prefixo || 'Viatura administrativa', movimento].filter(Boolean).join(' — ');
    const horario = document.createElement('small');
    horario.textContent = dataHora || 'Horário não informado';
    identidade.appendChild(titulo);
    identidade.appendChild(horario);

    const selo = document.createElement('span');
    selo.className = 'selo-tipo-registro-motoristas' + (integrado ? ' selo-integracao-guarda' : '');
    selo.textContent = integrado ? 'Controle de Acesso' : 'Registro anterior';
    linha.appendChild(identidade);
    linha.appendChild(selo);
    item.appendChild(linha);

    const procedenciaCompleta = [procedencia, complementoProcedencia].filter(Boolean).join(' — ');
    const local = movimentoNormalizado === 'ENTRADA'
      ? (procedenciaCompleta || localConsolidado || destino)
      : (destino || localConsolidado || procedencia);
    const rotuloLocal = movimentoNormalizado === 'ENTRADA' ? 'Procedência' : 'Destino';
    const detalhes = [
      nomeCondutor ? 'Condutor: ' + nomeCondutor + (rgCondutor ? ' — RG ' + rgCondutor : '') : '',
      local ? rotuloLocal + ': ' + local : '',
      Number.isFinite(quantidadeOcupantes) && quantidadeOcupantes > 0
        ? (quantidadeOcupantes === 1 ? '1 ocupante' : quantidadeOcupantes + ' ocupantes') : '',
      retroativo && !retroativoJaDescrito
        ? 'Lançamento retroativo' + (motivoRetroativo ? ': ' + motivoRetroativo : '') : '',
      retroativo && !retroativoJaDescrito && dataHoraRegistro
        ? 'Registrado em: ' + dataHoraRegistro : ''
    ].filter(Boolean);
    if (detalhes.length) {
      const detalhe = document.createElement('div');
      detalhe.className = 'detalhes-registro-motoristas';
      detalhe.textContent = detalhes.join(' • ');
      item.appendChild(detalhe);
    }

    if (observacoes) {
      const observacao = document.createElement('div');
      observacao.className = 'observacao-registro-motoristas';
      observacao.textContent = observacoes;
      item.appendChild(observacao);
    }

    const auditoria = document.createElement('div');
    auditoria.className = 'detalhes-registro-motoristas' +
      (integrado ? ' origem-automatica-motoristas' : '');
    const dadosAuditoria = integrado
      ? ['Sincronizado automaticamente do Controle de Acesso',
          nomeGuarda ? 'Guarda no horário: ' + nomeGuarda : '',
          nomeOperador && nomeOperador !== nomeGuarda
            ? 'Registrado por: ' + nomeOperador + (perfilOperador ? ' (' + perfilOperador + ')' : '') : '']
      : ['Registro anterior do livro de motoristas',
          nomeOperador ? 'Lançado por: ' + nomeOperador +
            (perfilOperador ? ' (' + perfilOperador + ')' : '') : ''];
    auditoria.textContent = dadosAuditoria.filter(Boolean).join(' • ');
    item.appendChild(auditoria);
    lista.appendChild(item);
  });

  if (registros.length > 30) {
    lista.appendChild(criarEstadoVazioPainel('Exibindo as 30 movimentações administrativas mais recentes.'));
  }
}

function renderizarRegistrosPainelMotoristas(lista, aba) {
  const todos = Array.isArray(painelMotoristasAtual.registros) ? painelMotoristasAtual.registros : [];
  const registros = todos.filter(registro => registroPertenceAbaMotoristas(registro, aba));
  if (!registros.length) {
    lista.appendChild(criarEstadoVazioPainel('Nenhum lançamento nesta área durante o ciclo.'));
    return;
  }
  registros.slice(0, 30).forEach(registro => {
    const tipo = obterTipoRegistroMotoristas(registro);
    const item = document.createElement('div');
    item.className = 'item-painel item-registro-motoristas';
    const linha = document.createElement('div');
    linha.className = 'linha-principal-registro-motoristas';
    const identidade = document.createElement('div');
    const titulo = document.createElement('strong');
    const prefixo = valorCampoMotoristas(registro, 'prefixoNoMomento', 'prefixo', 'Prefixo_no_Momento', 'Prefixo');
    const resultado = valorCampoMotoristas(registro, 'movimentoResultado', 'resultado', 'movimento', 'Movimento_Resultado');
    titulo.textContent = [prefixo || rotuloTipoRegistroMotoristas(tipo), resultado].filter(Boolean).join(' — ');
    const horario = document.createElement('small');
    horario.textContent = String(valorCampoMotoristas(registro, 'dataHoraEvento', 'DataHora_Evento', 'dataHora') || 'Horário não informado');
    identidade.appendChild(titulo);
    identidade.appendChild(horario);
    const selo = document.createElement('span');
    selo.className = 'selo-tipo-registro-motoristas';
    selo.textContent = rotuloTipoRegistroMotoristas(tipo);
    linha.appendChild(identidade);
    linha.appendChild(selo);
    item.appendChild(linha);
    const valor = valorCampoMotoristas(registro, 'valor', 'Valor');
    const km = valorCampoMotoristas(registro, 'km', 'KM');
    const condutor = valorCampoMotoristas(registro, 'nomeCondutor', 'Nome_Condutor');
    const rg = valorCampoMotoristas(registro, 'rgCondutor', 'RG_Condutor');
    const destino = valorCampoMotoristas(registro, 'destinoFornecedor', 'Destino_Fornecedor');
    const detalhes = [condutor ? 'Condutor: ' + condutor + (rg ? ' — RG ' + rg : '') : '',
      valor !== '' ? 'Valor: ' + formatarValorMonetarioMotoristas(valor) : '', km !== '' ? 'KM: ' + km : '',
      destino ? 'Local: ' + destino : ''].filter(Boolean);
    if (detalhes.length) {
      const detalhe = document.createElement('div');
      detalhe.className = 'detalhes-registro-motoristas';
      detalhe.textContent = detalhes.join(' • ');
      item.appendChild(detalhe);
    }
    const observacoes = valorCampoMotoristas(registro, 'observacoes', 'Observacoes');
    if (observacoes) {
      const observacao = document.createElement('div');
      observacao.className = 'observacao-registro-motoristas';
      observacao.textContent = observacoes;
      item.appendChild(observacao);
    }
    const operador = valorCampoMotoristas(registro, 'nomeOperador', 'Nome_Operador');
    const perfilOperador = valorCampoMotoristas(registro, 'perfilOperador', 'Perfil_Operador');
    if (operador) {
      const auditoria = document.createElement('div');
      auditoria.className = 'detalhes-registro-motoristas';
      auditoria.textContent = 'Lançado por: ' + operador + (perfilOperador ? ' (' + perfilOperador + ')' : '');
      item.appendChild(auditoria);
    }
    lista.appendChild(item);
  });
  if (registros.length > 30) lista.appendChild(criarEstadoVazioPainel('Exibindo os 30 lançamentos mais recentes desta área.'));
}

function obterMilitaresPainelMotoristas() {
  return painelMotoristasAtual && Array.isArray(painelMotoristasAtual.militares)
    ? painelMotoristasAtual.militares : [];
}

function obterDadosMilitarMotoristas(militar) {
  const rg = String(valorCampoMotoristas(militar, 'rg', 'RG', 'RG_CPF', 'RG_CPF_Militar') || '').trim();
  const nome = String(valorCampoMotoristas(militar, 'nome', 'Nome', 'Nome_Militar') || '').trim();
  const id = String(valorCampoMotoristas(militar, 'militarId', 'id', 'ID_Pessoa', 'ID_Militar') || (rg ? 'EF1GBM:' + rg : ''));
  const ordem = Number(valorCampoMotoristas(militar, 'ordemAntiguidade', 'Ordem_Antiguidade') || 999999);
  return { id: id, rg: rg, nome: nome, ordem: ordem, rotulo: nome + (rg ? ' — RG ' + rg : '') };
}

function preencherListasMilitaresMotoristas() {
  const militares = obterMilitaresPainelMotoristas().map(obterDadosMilitarMotoristas)
    .filter(militar => militar.nome || militar.rg)
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
  const lista = document.getElementById('listaCondutoresEventoMotoristas');
  if (!lista) return;
  lista.innerHTML = '';
  militares.forEach(militar => {
    const option = document.createElement('option');
    option.value = militar.rotulo;
    lista.appendChild(option);
  });
}

function resolverMilitarPainelMotoristas(texto) {
  const termo = normalizarTextoSeletorGuarnicao(texto);
  const rgTermo = normalizarRgSeletorGuarnicao(texto);
  const exatos = obterMilitaresPainelMotoristas().map(obterDadosMilitarMotoristas).filter(militar => {
    const rotulo = normalizarTextoSeletorGuarnicao(militar.rotulo);
    const nome = normalizarTextoSeletorGuarnicao(militar.nome);
    const rg = normalizarRgSeletorGuarnicao(militar.rg);
    return rotulo === termo || nome === termo || (rgTermo && rg === rgTermo);
  });
  return exatos.length === 1 ? exatos[0] : null;
}

function preencherViaturasEventoMotoristas(tipo, idSelecionado) {
  const select = document.getElementById('viaturaEventoMotoristas');
  if (!select) return;
  select.innerHTML = '<option value="">Selecione a viatura</option>';
  const todas = painelMotoristasAtual && Array.isArray(painelMotoristasAtual.viaturas) ? painelMotoristasAtual.viaturas : [];
  let viaturas = todas.filter(viatura => normalizarBooleanoMotoristas(valorCampoMotoristas(viatura, 'ativo', 'Ativo'), true));
  if (tipo === 'MOV_ADMINISTRATIVA') {
    viaturas = viaturas.filter(viatura =>
      normalizarTextoMotoristas(valorCampoMotoristas(viatura, 'categoria', 'Categoria')).includes('ADMINISTRATIVA'));
  }
  viaturas.sort((a, b) => obterPrefixoViaturaMotoristas(a).localeCompare(obterPrefixoViaturaMotoristas(b), 'pt-BR', { numeric: true }));
  viaturas.forEach(viatura => {
    const option = document.createElement('option');
    option.value = obterIdViaturaMotoristas(viatura);
    option.textContent = obterPrefixoViaturaMotoristas(viatura) +
      (valorCampoMotoristas(viatura, 'descricao', 'Descricao') ? ' — ' + valorCampoMotoristas(viatura, 'descricao', 'Descricao') : '');
    select.appendChild(option);
  });
  select.value = idSelecionado || '';
}

function alternarCampoEventoMotoristas(id, visivel) {
  const campo = document.getElementById(id);
  if (!campo) return;
  campo.classList.toggle('oculto', !visivel);
  campo.setAttribute('aria-hidden', String(!visivel));
  campo.querySelectorAll('input, select, textarea').forEach(controle => { controle.disabled = !visivel; });
}

function obterResultadoSisgeoEventoMotoristas() {
  const selecionado = document.querySelector('input[name="resultadoSisgeoEventoMotoristas"]:checked');
  return selecionado ? selecionado.value : '';
}

function atualizarCamposSisgeoEventoMotoristas() {
  if (tipoEventoMotoristasAtual !== 'SISGEO') return;
  const foraDoPrazo = normalizarTextoMotoristas(obterResultadoSisgeoEventoMotoristas()) === 'NAO';
  const labelObservacoes = document.getElementById('labelObservacoesEventoMotoristas');
  const observacoes = document.getElementById('observacoesEventoMotoristas');

  alternarCampoEventoMotoristas('campoViaturaEventoMotoristas', foraDoPrazo);
  alternarCampoEventoMotoristas('campoObservacoesEventoMotoristas', foraDoPrazo);
  if (labelObservacoes) labelObservacoes.textContent = 'Motivo *';
  if (observacoes) observacoes.placeholder = 'Informe por que o SISGEO não foi realizado dentro do prazo';

  if (!foraDoPrazo) {
    const viatura = document.getElementById('viaturaEventoMotoristas');
    if (viatura) viatura.value = '';
    if (observacoes) observacoes.value = '';
  }
}

function opcoesResultadoEventoMotoristas(tipo) {
  if (tipo === 'CONDICAO') return ['Operante', 'Inoperante'];
  if (tipo === 'MOV_ADMINISTRATIVA') return ['Saída', 'Entrada'];
  if (tipo === 'MANUTENCAO') return ['Saída', 'Retorno'];
  return [];
}

function configurarModalEventoMotoristas(tipo, idViatura) {
  const configuracoes = {
    CONDICAO: { titulo: 'Condição operacional', descricao: 'Informe se a viatura está operante ou inoperante.', resultado: true, labelResultado: 'Condição operacional *' },
    ABASTECIMENTO: { titulo: 'Registrar abastecimento', descricao: 'Registre quem conduziu, quando, o valor e a quilometragem.', dataHora: true, condutor: true, valor: true, km: true, destino: true, labelDestino: 'Posto / estabelecimento' },
    ALTERACAO: { titulo: 'Registrar alteração', descricao: 'Descreva a alteração, avaria, conferência ou fato relacionado à viatura.', dataHora: true, observacaoObrigatoria: true },
    MOV_ADMINISTRATIVA: { titulo: 'Movimento administrativo', descricao: 'Registre a entrada ou saída de uma viatura administrativa.', resultado: true, dataHora: true, condutor: true, km: true, destino: true, labelResultado: 'Movimentação *', labelDestino: 'Destino / procedência (obrigatório na saída)' },
    MANUTENCAO: { titulo: 'Movimento de manutenção', descricao: 'Registre a saída para oficina ou o retorno à unidade.', resultado: true, dataHora: true, condutor: true, km: true, destino: true, labelResultado: 'Movimentação *', labelDestino: 'Oficina / destino (obrigatório na saída)' },
    SISGEO: { titulo: 'Informar SISGEO', descricao: 'Confirme se o SISGEO das viaturas foi realizado dentro do prazo.', semViatura: true, perguntaSisgeo: true },
    OBSERVACAO_GERAL: { titulo: 'Observação geral', descricao: 'Registre uma informação pertinente ao serviço.', dataHora: true, semViatura: true, observacaoObrigatoria: true }
  };
  const configuracao = configuracoes[tipo] || configuracoes.ALTERACAO;
  tipoEventoMotoristasAtual = tipo;
  viaturaPreselecionadaMotoristas = idViatura || '';
  document.getElementById('tituloModalEventoMotoristas').textContent = configuracao.titulo;
  document.getElementById('descricaoModalEventoMotoristas').textContent = configuracao.descricao;
  document.getElementById('labelResultadoEventoMotoristas').textContent = configuracao.labelResultado || 'Situação *';
  document.getElementById('labelDestinoEventoMotoristas').textContent = configuracao.labelDestino || 'Destino / estabelecimento';
  document.getElementById('labelKmEventoMotoristas').textContent = tipo === 'ABASTECIMENTO'
    ? 'Quilometragem *' : 'Quilometragem';
  document.getElementById('labelObservacoesEventoMotoristas').textContent = configuracao.observacaoObrigatoria ? 'Observações *' : 'Observações';
  document.getElementById('observacoesEventoMotoristas').placeholder = 'Informação complementar';
  alternarCampoEventoMotoristas('campoViaturaEventoMotoristas', !configuracao.semViatura);
  alternarCampoEventoMotoristas('campoResultadoEventoMotoristas', !!configuracao.resultado);
  alternarCampoEventoMotoristas('campoSisgeoEventoMotoristas', !!configuracao.perguntaSisgeo);
  alternarCampoEventoMotoristas('campoDataHoraEventoMotoristas', !!configuracao.dataHora);
  alternarCampoEventoMotoristas('campoCondutorEventoMotoristas', !!configuracao.condutor);
  alternarCampoEventoMotoristas('campoValorEventoMotoristas', !!configuracao.valor);
  alternarCampoEventoMotoristas('campoKmEventoMotoristas', !!configuracao.km);
  alternarCampoEventoMotoristas('campoJustificativaKmEventoMotoristas', !!configuracao.km);
  alternarCampoEventoMotoristas('campoDestinoEventoMotoristas', !!configuracao.destino);
  alternarCampoEventoMotoristas('campoObservacoesEventoMotoristas', !configuracao.perguntaSisgeo);
  preencherViaturasEventoMotoristas(tipo, idViatura);
  const selectResultado = document.getElementById('resultadoEventoMotoristas');
  selectResultado.innerHTML = '<option value="">Selecione</option>';
  opcoesResultadoEventoMotoristas(tipo).forEach(rotulo => {
    const option = document.createElement('option');
    option.value = rotulo;
    option.textContent = rotulo;
    selectResultado.appendChild(option);
  });
  const viaturaSelecionada = painelMotoristasAtual && Array.isArray(painelMotoristasAtual.viaturas)
    ? painelMotoristasAtual.viaturas.find(viatura => obterIdViaturaMotoristas(viatura) === String(idViatura || ''))
    : null;
  if (viaturaSelecionada && tipo === 'CONDICAO') {
    const condicaoAtual = obterCondicaoViaturaMotoristas(viaturaSelecionada);
    if (opcoesResultadoEventoMotoristas(tipo).includes(condicaoAtual)) selectResultado.value = condicaoAtual;
  }
  if (viaturaSelecionada && tipo === 'MOV_ADMINISTRATIVA') {
    selectResultado.value = normalizarTextoMotoristas(
      valorCampoMotoristas(viaturaSelecionada, 'situacaoAtual', 'Situacao_Atual')
    ) === 'FORA_DA_UNIDADE' ? 'Entrada' : 'Saída';
  }
  if (viaturaSelecionada && tipo === 'MANUTENCAO') {
    selectResultado.value = normalizarTextoMotoristas(
      valorCampoMotoristas(viaturaSelecionada, 'situacaoAtual', 'Situacao_Atual')
    ) === 'EM_MANUTENCAO' ? 'Retorno' : 'Saída';
  }
  document.getElementById('dataHoraEventoMotoristas').value = obterDataHoraLocalAtualMotoristas();
  document.getElementById('condutorEventoMotoristas').value = '';
  document.getElementById('valorEventoMotoristas').value = '';
  document.getElementById('kmEventoMotoristas').value = '';
  document.getElementById('justificativaKmEventoMotoristas').value = '';
  document.getElementById('destinoEventoMotoristas').value = '';
  document.getElementById('observacoesEventoMotoristas').value = '';
  document.querySelectorAll('input[name="resultadoSisgeoEventoMotoristas"]').forEach(opcao => {
    opcao.checked = false;
  });
  if (tipo === 'SISGEO') atualizarCamposSisgeoEventoMotoristas();
  definirMensagemModalMotoristas('mensagemEventoMotoristas', '', '');
}

function obterDataHoraLocalAtualMotoristas() {
  const agora = new Date();
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function gerarIdSolicitacaoMotoristas(prefixo) {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  return prefixo + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12);
}

function abrirModalEventoMotoristas(tipoForcado = '', idViatura = '') {
  const podeEditar = painelMotoristasAtual && painelMotoristasAtual.permissoes && painelMotoristasAtual.permissoes.podeEditar === true;
  if (!podeEditar) {
    mostrarMensagem('Somente o Encarregado de Motoristas deste ciclo pode lançar.', 'erro');
    return;
  }
  const tipo = tipoForcado || ABAS_PAINEL_MOTORISTAS[abaPainelMotoristasAtual].tipo;
  if (tipo === 'MOV_ADMINISTRATIVA') {
    mostrarMensagem(
      'As entradas e saídas das viaturas administrativas são registradas automaticamente pela Guarda.',
      'sucesso'
    );
    return;
  }
  focoAntesDoModalMotoristas = document.activeElement;
  idSolicitacaoEventoMotoristasAtual = gerarIdSolicitacaoMotoristas('MOT');
  configurarModalEventoMotoristas(tipo, idViatura);
  const modal = document.getElementById('modalEventoMotoristas');
  const botaoSalvar = document.getElementById('btnSalvarEventoMotoristas');
  botaoSalvar.disabled = false;
  botaoSalvar.textContent = 'Salvar lançamento';
  modal.classList.remove('oculto');
  document.body.classList.add('modal-motoristas-aberto');
  setTimeout(() => {
    const primeiro = modal.querySelector('select:not([disabled]), input:not([disabled]), textarea:not([disabled])');
    (primeiro || modal.querySelector('.fechar-modal-motoristas')).focus();
  }, 0);
}

function fecharModalEventoMotoristas(devolverFoco = true) {
  const modal = document.getElementById('modalEventoMotoristas');
  if (!modal || modal.classList.contains('oculto')) return;
  modal.classList.add('oculto');
  tipoEventoMotoristasAtual = '';
  viaturaPreselecionadaMotoristas = '';
  idSolicitacaoEventoMotoristasAtual = '';
  restaurarRolagemAposModalMotoristas();
  if (devolverFoco && focoAntesDoModalMotoristas && typeof focoAntesDoModalMotoristas.focus === 'function') focoAntesDoModalMotoristas.focus({ preventScroll: true });
  focoAntesDoModalMotoristas = null;
}

function definirMensagemModalMotoristas(id, texto, tipo) {
  const elemento = document.getElementById(id);
  if (!elemento) return;
  elemento.textContent = texto || '';
  elemento.classList.remove('erro', 'sucesso');
  if (tipo) elemento.classList.add(tipo);
  elemento.classList.toggle('oculto', !texto);
}

function validarEventoMotoristas() {
  const tipo = tipoEventoMotoristasAtual;
  const resultado = tipo === 'SISGEO'
    ? obterResultadoSisgeoEventoMotoristas()
    : document.getElementById('resultadoEventoMotoristas').value;
  const sisgeoForaDoPrazo = tipo === 'SISGEO' && normalizarTextoMotoristas(resultado) === 'NAO';
  const semViatura = tipo === 'OBSERVACAO_GERAL' || (tipo === 'SISGEO' && !sisgeoForaDoPrazo);
  const idViaturaInformada = document.getElementById('viaturaEventoMotoristas').value;
  const idViatura = semViatura ? '' : idViaturaInformada;
  const dataHoraLocal = document.getElementById('dataHoraEventoMotoristas').value;
  const textoCondutor = document.getElementById('condutorEventoMotoristas').value.trim();
  const valorTexto = document.getElementById('valorEventoMotoristas').value;
  const kmTexto = document.getElementById('kmEventoMotoristas').value;
  const justificativaKm = document.getElementById('justificativaKmEventoMotoristas').value.trim();
  const destino = document.getElementById('destinoEventoMotoristas').value.trim();
  const observacoesInformadas = document.getElementById('observacoesEventoMotoristas').value.trim();
  const observacoes = tipo === 'SISGEO' && !sisgeoForaDoPrazo ? '' : observacoesInformadas;
  const requerResultado = ['CONDICAO', 'MOV_ADMINISTRATIVA', 'MANUTENCAO', 'SISGEO'].includes(tipo);
  const requerDataHora = !['CONDICAO', 'SISGEO'].includes(tipo);
  const requerCondutor = ['ABASTECIMENTO', 'MOV_ADMINISTRATIVA', 'MANUTENCAO'].includes(tipo);
  const requerKm = tipo === 'ABASTECIMENTO';
  const movimentoSaida = normalizarTextoMotoristas(resultado) === 'SAIDA';
  const requerDestino = ['MOV_ADMINISTRATIVA', 'MANUTENCAO'].includes(tipo) && movimentoSaida;
  const requerObservacao = ['ALTERACAO', 'OBSERVACAO_GERAL'].includes(tipo) ||
    (tipo === 'CONDICAO' && normalizarTextoMotoristas(resultado) === 'INOPERANTE') || sisgeoForaDoPrazo;
  if (requerResultado && !resultado) {
    return { erro: tipo === 'SISGEO' ? 'Informe se o SISGEO foi realizado dentro do prazo.' : 'Selecione a situação do lançamento.' };
  }
  if (tipo === 'SISGEO' && !['SIM', 'NAO'].includes(normalizarTextoMotoristas(resultado))) {
    return { erro: 'Responda Sim ou Não sobre a realização do SISGEO dentro do prazo.' };
  }
  if (!semViatura && !idViatura) return { erro: tipo === 'SISGEO' ? 'Selecione a viatura cujo SISGEO ficou fora do prazo.' : 'Selecione a viatura.' };
  if (requerDataHora && !dataHoraLocal) return { erro: 'Informe a data e a hora.' };
  if (requerCondutor && !textoCondutor) return { erro: 'Selecione o condutor pelo nome ou RG.' };
  const condutor = requerCondutor ? resolverMilitarPainelMotoristas(textoCondutor) : null;
  if (requerCondutor && !condutor) return { erro: 'Selecione uma sugestão exata do efetivo para identificar o condutor sem ambiguidade.' };
  const valor = valorTexto === '' ? '' : Number(valorTexto);
  if (tipo === 'ABASTECIMENTO' && (!Number.isFinite(valor) || valor <= 0)) return { erro: 'Informe um valor de abastecimento maior que zero.' };
  const km = kmTexto === '' ? '' : Number(kmTexto);
  if (requerKm && (!Number.isFinite(km) || km < 0)) return { erro: 'Informe uma quilometragem válida.' };
  if (km !== '' && (!Number.isFinite(km) || km < 0)) return { erro: 'A quilometragem informada não é válida.' };
  if (requerDestino && !destino) return { erro: 'Informe o destino, a oficina ou o estabelecimento.' };
  if (requerObservacao && !observacoes) {
    return { erro: tipo === 'SISGEO' ? 'Informe o motivo de o SISGEO não ter sido realizado dentro do prazo.' : 'Descreva a ocorrência nas observações.' };
  }
  let dataHoraEvento = new Date().toISOString();
  if (dataHoraLocal) {
    const data = new Date(dataHoraLocal);
    if (isNaN(data.getTime())) return { erro: 'A data e a hora informadas não são válidas.' };
    dataHoraEvento = data.toISOString();
  }
  const condutorApi = condutor ? { ID_Pessoa: condutor.id, idPessoa: condutor.id, RG_CPF: condutor.rg, rg: condutor.rg, Nome: condutor.nome, nome: condutor.nome } : null;
  return { evento: {
    idSolicitacao: idSolicitacaoEventoMotoristasAtual,
    tipo: tipo,
    idViatura: idViatura,
    vehicleId: idViatura,
    dataHoraEvento: dataHoraEvento,
    condutor: condutorApi,
    condutorId: condutor ? condutor.id : '',
    rgCondutor: condutor ? condutor.rg : '',
    nomeCondutor: condutor ? condutor.nome : '',
    valor: valor,
    km: km,
    justificativaKm: justificativaKm,
    destinoFornecedor: destino,
    observacoes: observacoes,
    resultado: resultado,
    movimento: resultado,
    movimentoResultado: resultado
  } };
}

function salvarEventoMotoristas(eventoSubmit) {
  if (eventoSubmit) eventoSubmit.preventDefault();
  const validacao = validarEventoMotoristas();
  if (validacao.erro) {
    definirMensagemModalMotoristas('mensagemEventoMotoristas', validacao.erro, 'erro');
    return;
  }
  const botao = document.getElementById('btnSalvarEventoMotoristas');
  const idSolicitacaoEnviada = idSolicitacaoEventoMotoristasAtual;
  const assinaturaSessaoEnviada = obterAssinaturaSessaoPessoalMotoristas();
  botao.disabled = true;
  botao.textContent = 'Salvando...';
  definirMensagemModalMotoristas('mensagemEventoMotoristas', '', '');
  google.script.run
    .withSuccessHandler(resposta => {
      const modalAindaCorresponde = idSolicitacaoEventoMotoristasAtual === idSolicitacaoEnviada;
      const sessaoAindaCorresponde = assinaturaSessaoEnviada &&
        assinaturaSessaoEnviada === obterAssinaturaSessaoPessoalMotoristas();
      if (modalAindaCorresponde) {
        botao.disabled = false;
        botao.textContent = 'Salvar lançamento';
      }
      if (!sessaoAindaCorresponde) {
        if (modalAindaCorresponde) fecharModalEventoMotoristas(false);
        painelMotoristasAtual = null;
        painelMotoristasCarregado = false;
        painelMotoristasAutorizado = false;
        assinaturaPainelMotoristasCarregado = '';
        limparConteudoPainelMotoristas();
        atualizarVisibilidadePainelMotoristas();
        mostrarMensagem((resposta && resposta.mensagem) || 'Lançamento registrado. O livro foi fechado porque o acesso mudou.', 'sucesso');
        return;
      }
      const painel = resposta && resposta.painelMotoristas;
      if (modalAindaCorresponde) fecharModalEventoMotoristas();
      if (painel) {
        renderizarPainelMotoristas(painel);
        painelMotoristasCarregado = true;
      } else {
        painelMotoristasCarregado = false;
        carregarPainelMotoristas(true);
      }
      mostrarMensagem((resposta && resposta.mensagem) || 'Lançamento registrado no livro de motoristas.', 'sucesso');
    })
    .withFailureHandler(erro => {
      if (idSolicitacaoEventoMotoristasAtual !== idSolicitacaoEnviada) return;
      if (assinaturaSessaoEnviada !== obterAssinaturaSessaoPessoalMotoristas()) {
        fecharModalEventoMotoristas(false);
        atualizarVisibilidadePainelMotoristas();
        return;
      }
      botao.disabled = false;
      botao.textContent = 'Salvar lançamento';
      definirMensagemModalMotoristas('mensagemEventoMotoristas', erro.message || 'Não foi possível salvar.', 'erro');
    })
    .registrarEventoMotoristas(validacao.evento);
}

function obterModalMotoristasAberto() {
  return ['modalEventoMotoristas']
    .map(id => document.getElementById(id))
    .find(modal => modal && !modal.classList.contains('oculto')) || null;
}

function manterFocoDentroDoModal(evento, modal) {
  const focaveis = Array.from(modal.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
  )).filter(elemento => elemento.offsetParent !== null);
  if (!focaveis.length) {
    evento.preventDefault();
    return;
  }
  const primeiro = focaveis[0];
  const ultimo = focaveis[focaveis.length - 1];
  if (!modal.contains(document.activeElement)) {
    evento.preventDefault();
    (evento.shiftKey ? ultimo : primeiro).focus();
  } else if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primeiro.focus();
  }
}

function restaurarRolagemAposModalMotoristas() {
  if (!obterModalMotoristasAberto()) document.body.classList.remove('modal-motoristas-aberto');
}

function escaparHtml(valor) {
  return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function mostrarAreaTrocaComandante() {
  expandirPerfilServico('perfilComandante', true);
  document.getElementById('areaAssumirComandante').classList.remove('oculto');
  mostrarMensagem(
    'Informe seu e-mail cadastrado para assumir como Comandante da Guarda. A sessão anterior do comandante será encerrada após a confirmação.',
    'sucesso'
  );
}

function enviarCodigoComandante() {
  const email = document.getElementById('emailComandante').value.trim().toLowerCase();

  if (!email || !email.includes('@')) {
    mostrarMensagem('Informe um e-mail válido.', 'erro');
    return;
  }

  google.script.run
    .withSuccessHandler((resposta) => {
      dadosCodigoComandante = {
        email: email,
        militar: null,
        ticketAssuncao: ''
      };

      salvarCodigoComandantePendente(email);
      document.getElementById('areaCodigoComandante').classList.remove('oculto');
      mostrarMensagem('Se o e-mail estiver autorizado, o código será enviado.', 'sucesso');
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Erro ao enviar código do comandante: ' + erro.message, 'erro');
    })
    .enviarCodigoAssumirComandante(email);
}

function validarCodigoComandante() {
  const email = document.getElementById('emailComandante').value.trim().toLowerCase();
  const codigo = document.getElementById('codigoComandante').value.trim();

  if (!email || !codigo) {
    mostrarMensagem('Informe o e-mail e o código do comandante.', 'erro');
    return;
  }

  google.script.run
    .withSuccessHandler((resposta) => {
      dadosCodigoComandante = {
        email: resposta.email,
        militar: resposta.militar || null,
        ticketAssuncao: resposta.ticketAssuncao || ''
      };

      limparCodigoComandantePendente();

      const area = document.getElementById('areaComandanteIdentificado');
      area.classList.remove('oculto', 'erro');
      area.innerHTML = `
        E-mail validado.<br>
        Militar identificado:<br>
        ${escaparHtml(resposta.militar.Nome)} — RG ${escaparHtml(resposta.militar.RG)}
      `;

      document.getElementById('btnAssumirComandante').classList.remove('oculto');
      mostrarMensagem('Comandante identificado com sucesso.', 'sucesso');
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Erro ao validar comandante: ' + erro.message, 'erro');
    })
    .validarCodigoAssumirComandante(email, codigo);
}

function assumirComandante(encerrarAnterior = false) {
  if (!dadosCodigoComandante || !dadosCodigoComandante.militar) {
    mostrarMensagem('Valide o e-mail antes de assumir como comandante.', 'erro');
    return;
  }

  const botao = document.getElementById('btnAssumirComandante');
  botao.disabled = true;
  botao.textContent = 'Assumindo...';

  google.script.run
    .withSuccessHandler((resposta) => {
      botao.disabled = false;
      botao.textContent = 'Assumir como comandante';

      if (resposta && resposta.requerConfirmacaoTroca && resposta.comandanteAtivo) {
        const comandante = resposta.comandanteAtivo;

        abrirModalConfirmacao(
          'Comandante já assumido',
          `Já existe um Comandante da Guarda ativo:<br><br>
          <strong>${escaparHtml(comandante.Nome_Comandante)} — RG ${escaparHtml(comandante.RG_Comandante)}</strong><br><br>
          Deseja encerrar somente a sessão do comandante anterior e assumir neste celular?`,
          () => assumirComandante(true),
          true
        );
        return;
      }

      mostrarMensagem(resposta.mensagem || 'Comandante da Guarda assumido com sucesso.', 'sucesso');

      if (resposta && resposta.comandante) {
        comandanteAtual = resposta.comandante;
        salvarComandanteLocal(resposta.comandante);
        painelComandanteCarregado = false;
        permissoesPainelGestaoAtual = { podeLancarHorarioAnterior: false };
        atualizarTelaComandante();
        carregarIdentidadesEquipeServico(true);
      }

      limparAreaComandante();
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Erro ao assumir como comandante: ' + erro.message, 'erro');
      botao.disabled = false;
      botao.textContent = 'Assumir como comandante';
    })
    .assumirComandanteComEmailValidado({
      email: dadosCodigoComandante.email,
      militar: dadosCodigoComandante.militar,
      ticketAssuncao: dadosCodigoComandante.ticketAssuncao || '',
      encerrarAnterior: encerrarAnterior
    });
}

function encerrarComandante() {
  expandirPerfilServico('perfilComandante', true);
  abrirModalConfirmacao(
    'Encerrar Comandante da Guarda',
    'O encerramento fica disponível a partir das 07h. Será enviado um código para o e-mail do comandante atual e, antes de confirmar, ele poderá registrar as alterações e observações do serviço.<br><br>Se o encerramento ocorrer antes das 08h, o PDF ficará pendente e será gerado somente após o fechamento oficial do período.<br><br>Deseja continuar?',
    () => enviarCodigoParaEncerrarComandante(),
    true
  );
}

function enviarCodigoParaEncerrarComandante() {
  const botao = document.getElementById('btnEncerrarComandante');
  botao.disabled = true;
  botao.textContent = 'Enviando...';
  mostrarStatusAcaoComandante('Solicitando código de encerramento...', '');

  google.script.run
    .withSuccessHandler((resposta) => {
      const candidatosEmail = [
        resposta && resposta.email,
        comandanteAtual && comandanteAtual.Email_Comandante
      ];
      emailEncerramentoComandante = candidatosEmail
        .map(valor => String(valor || '').trim().toLowerCase())
        .find(valor => valor && valor.includes('@')) || '';

      if (!emailEncerramentoComandante) {
        document.getElementById('areaCodigoEncerrarComandante').classList.add('oculto');
        mostrarStatusAcaoComandante(
          'O código foi solicitado, mas não foi possível identificar o e-mail do comandante atual. Atualize a página e use Sair novamente.',
          'erro'
        );
        mostrarMensagem('Não foi possível identificar o e-mail do comandante atual.', 'erro');
        botao.disabled = false;
        botao.textContent = 'Sair';
        return;
      }

      expandirPerfilServico('perfilComandante', true);
      document.getElementById('areaCodigoEncerrarComandante').classList.remove('oculto');
      mostrarStatusAcaoComandante(
        `Código enviado para ${mascararEmailComandante(emailEncerramentoComandante)}. Informe-o abaixo para encerrar.`,
        'sucesso'
      );
      botao.disabled = false;
      botao.textContent = 'Sair';
    })
    .withFailureHandler((erro) => {
      mostrarStatusAcaoComandante('Não foi possível enviar o código: ' + erro.message, 'erro');
      mostrarMensagem('Erro ao enviar código do comandante: ' + erro.message, 'erro');
      botao.disabled = false;
      botao.textContent = 'Sair';
    })
    .enviarCodigoEncerrarComandante();
}

function validarCodigoEEncerrarComandante() {
  const codigo = document.getElementById('codigoEncerrarComandante').value.trim();
  const observacoesServico = document.getElementById('observacoesEncerramentoComandante').value.trim();
  const botao = document.getElementById('btnConfirmarEncerramentoComandante');

  if (!emailEncerramentoComandante) {
    mostrarStatusAcaoComandante('Não foi possível identificar o e-mail. Use Sair para solicitar um novo código.', 'erro');
    mostrarMensagem('Solicite um novo código de encerramento.', 'erro');
    return;
  }

  if (!codigo) {
    mostrarStatusAcaoComandante('Digite o código enviado ao comandante atual.', 'erro');
    mostrarMensagem('Informe o código enviado ao comandante atual.', 'erro');
    return;
  }

  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Encerrando...';
  }
  mostrarStatusAcaoComandante('Encerrando o serviço e gerando o relatório...', '');

  google.script.run
    .withSuccessHandler((resposta) => {
      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Encerrar serviço';
      }
      mostrarMensagem(resposta.mensagem || 'Comandante da Guarda encerrado. Relatório aguardando as 08h.', 'sucesso');
      comandanteAtual = null;
      emailEncerramentoComandante = null;
      limparComandanteLocal();
      limparAreaComandante();
      atualizarTelaComandante();
      carregarIdentidadesEquipeServico(true);
    })
    .withFailureHandler((erro) => {
      const mensagemErro = 'Erro ao encerrar comandante: ' + erro.message;
      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Encerrar serviço';
      }
      mostrarStatusAcaoComandante(mensagemErro, 'erro');
      mostrarMensagem(mensagemErro, 'erro');
    })
    .validarCodigoEEncerrarComandante(emailEncerramentoComandante, codigo, observacoesServico);
}

function mostrarStatusAcaoComandante(texto, tipo) {
  const status = document.getElementById('statusAcaoComandante');
  if (!status) return;
  status.textContent = texto || '';
  status.classList.remove('oculto', 'sucesso', 'erro');
  if (tipo) status.classList.add(tipo);
}

function mascararEmailComandante(email) {
  const partes = String(email || '').split('@');
  if (partes.length !== 2) return 'o e-mail cadastrado';
  const usuario = partes[0];
  const visivel = usuario.slice(0, Math.min(3, usuario.length));
  return `${visivel}${'*'.repeat(Math.max(3, usuario.length - visivel.length))}@${partes[1]}`;
}

function limparAreaComandante() {
  dadosCodigoComandante = null;
  emailEncerramentoComandante = null;
  limparCodigoComandantePendente();

  [
    'emailComandante',
    'codigoComandante',
    'codigoEncerrarComandante',
    'observacoesEncerramentoComandante'
  ].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.value = '';
  });

  [
    'areaCodigoComandante',
    'areaCodigoEncerrarComandante',
    'areaComandanteIdentificado',
    'btnAssumirComandante'
  ].forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.classList.add('oculto');
  });

  const identificado = document.getElementById('areaComandanteIdentificado');
  if (identificado) identificado.innerHTML = '';

  const statusAcao = document.getElementById('statusAcaoComandante');
  if (statusAcao) {
    statusAcao.textContent = '';
    statusAcao.classList.add('oculto');
    statusAcao.classList.remove('sucesso', 'erro');
  }
}

function salvarCodigoComandantePendente(email) {
  localStorage.setItem('comandante_email_pendente', email);
  localStorage.setItem('comandante_codigo_pendente_em', new Date().toISOString());
}

function limparCodigoComandantePendente() {
  localStorage.removeItem('comandante_email_pendente');
  localStorage.removeItem('comandante_codigo_pendente_em');
}

function restaurarCodigoComandantePendente() {
  const email = localStorage.getItem('comandante_email_pendente');
  const geradoEm = localStorage.getItem('comandante_codigo_pendente_em');

  if (!email || !geradoEm) return;

  if ((new Date() - new Date(geradoEm)) / 60000 > 10) {
    limparCodigoComandantePendente();
    return;
  }

  document.getElementById('emailComandante').value = email;
  document.getElementById('areaCodigoComandante').classList.remove('oculto');
  dadosCodigoComandante = { email: email, militar: null, ticketAssuncao: '' };
}

function salvarComandanteLocal(comandante) {
  if (!comandante || !comandante.ID_ComandanteGuarda) return;

  localStorage.setItem('comandante_id_local', comandante.ID_ComandanteGuarda);
  localStorage.removeItem('comandante_nome_local');
  localStorage.removeItem('comandante_rg_local');
  localStorage.removeItem('comandante_email_local');

  if (comandante.Sessao_Token) {
    localStorage.setItem('comandante_sessao_token', comandante.Sessao_Token);
    marcarInicioSessaoLocal('comandante_sessao_iniciada_em');
  }
}

function limparComandanteLocal() {
  localStorage.removeItem('comandante_id_local');
  localStorage.removeItem('comandante_nome_local');
  localStorage.removeItem('comandante_rg_local');
  localStorage.removeItem('comandante_email_local');
  localStorage.removeItem('comandante_sessao_token');
  localStorage.removeItem('comandante_sessao_iniciada_em');
}

function aparelhoAssumiuComandanteAtual() {
  if (!comandanteAtual || !comandanteAtual.ID_ComandanteGuarda) return false;

  const idLocal = localStorage.getItem('comandante_id_local');
  const tokenLocal = obterSessaoTokenComandanteLocal();

  return !!(
    idLocal &&
    idLocal === comandanteAtual.ID_ComandanteGuarda &&
    comandanteAtual.Sessao_Valida !== false &&
    (tokenLocal || typeof URL_API === 'undefined')
  );
}

function aparelhoReconheceComandanteAtual() {
  if (!comandanteAtual || !comandanteAtual.ID_ComandanteGuarda) return false;
  return !!obterSessaoTokenComandanteLocal() &&
    localStorage.getItem('comandante_id_local') === comandanteAtual.ID_ComandanteGuarda;
}


let acaoConfirmadaModal = null;
let focoAntesModalConfirmacao = null;

function abrirModalConfirmacao(titulo, texto, callback, estilo = false) {
  document.getElementById('modalTitulo').textContent = titulo;
  document.getElementById('modalTexto').innerHTML = texto;

  const botaoConfirmar = document.getElementById('btnModalConfirmar');
  const botaoCancelar = document.getElementById('btnModalCancelar');
  const estiloModal = estilo === true ? 'perigo' : String(estilo || '');
  botaoConfirmar.classList.toggle('perigo', estiloModal === 'perigo');
  botaoConfirmar.classList.toggle('retroativo', estiloModal === 'retroativo');
  botaoConfirmar.textContent = estiloModal === 'retroativo'
    ? 'Confirmar lançamento'
    : 'Confirmar';
  if (botaoCancelar) botaoCancelar.textContent = estiloModal === 'retroativo'
    ? 'Voltar e revisar'
    : 'Cancelar';
  acaoConfirmadaModal = typeof callback === 'function' ? callback : null;
  botaoConfirmar.onclick = confirmarAcaoModal;

  focoAntesModalConfirmacao = document.activeElement;
  const modal = document.getElementById('modalConfirmacao');
  const app = document.querySelector('.app');
  if (app) app.setAttribute('inert', '');
  modal.classList.remove('oculto');
  setTimeout(() => {
    if (botaoCancelar) botaoCancelar.focus();
  }, 30);
}

function confirmarAcaoModal() {
  const callback = acaoConfirmadaModal;
  fecharModalConfirmacao();
  if (typeof callback === 'function') callback();
}

function fecharModalConfirmacao() {
  const modal = document.getElementById('modalConfirmacao');
  const app = document.querySelector('.app');
  acaoConfirmadaModal = null;
  if (modal) modal.classList.add('oculto');
  if (app) app.removeAttribute('inert');
  if (focoAntesModalConfirmacao && typeof focoAntesModalConfirmacao.focus === 'function') {
    focoAntesModalConfirmacao.focus();
  }
  focoAntesModalConfirmacao = null;
}

function enviarCodigoParaEncerrarGuarda() {
  const botao = document.getElementById('btnEncerrarGuarda');
  botao.disabled = true;
  botao.textContent = 'Enviando...';

  google.script.run
    .withSuccessHandler((resposta) => {
      emailEncerramentoGuarda = resposta.email;

      document.getElementById('areaCodigoEncerrarGuarda').classList.remove('oculto');

      mostrarMensagem(
        'Código enviado para o e-mail do guarda atual. Informe o código para encerrar.',
        'sucesso'
      );

      botao.disabled = false;
      botao.textContent = 'Sair';
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Erro ao enviar código: ' + erro.message, 'erro');

      botao.disabled = false;
      botao.textContent = 'Sair';
    })
    .enviarCodigoEncerrarGuarda();
}

function validarCodigoEEncerrarGuarda() {
  const codigo = document.getElementById('codigoEncerrarGuarda').value.trim();

  if (!emailEncerramentoGuarda || !codigo) {
    mostrarMensagem('Informe o código enviado ao guarda atual.', 'erro');
    return;
  }

  google.script.run
    .withSuccessHandler((resposta) => {
      mostrarMensagem(resposta.mensagem || 'Guarda encerrada com sucesso.', 'sucesso');

      guardaAtual = null;
      emailEncerramentoGuarda = null;

      limparGuardaLocal();

      document.getElementById('codigoEncerrarGuarda').value = '';
      document.getElementById('areaCodigoEncerrarGuarda').classList.add('oculto');

      limparAreaGuarda();
      atualizarTelaGuarda();
      carregarIdentidadesEquipeServico(true);
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Erro ao encerrar Guarda: ' + erro.message, 'erro');
    })
    .validarCodigoEEncerrarGuarda(emailEncerramentoGuarda, codigo);
}

function salvarGuardaLocal(guarda) {
  if (!guarda || !guarda.ID_GuardaServico) {
    return;
  }

  localStorage.setItem('guarda_id_local', guarda.ID_GuardaServico);
  localStorage.removeItem('guarda_nome_local');
  localStorage.removeItem('guarda_rg_local');
  localStorage.removeItem('guarda_email_local');
  const token = guarda.Sessao_Token || (typeof URL_API === 'undefined' ? 'apps-script-local' : '');
  localStorage.setItem('guarda_sessao_token', token);
  if (token) marcarInicioSessaoLocal('guarda_sessao_iniciada_em');
}

function carregarMovimentacoesGuarda(silencioso = false) {
  if (!aparelhoPodeOperarGuardaAtual()) {
    atualizarVisibilidadeMovimentacoesGuarda();
    return;
  }

  const botao = document.getElementById('btnAtualizarMovimentacoesGuarda');
  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Atualizando...';
  }

  google.script.run
    .withSuccessHandler((resposta) => {
      const movimentacoes = resposta && resposta.movimentacoes ? resposta.movimentacoes : [];
      renderizarListaMovimentacoesRecentes(movimentacoes, 'listaMovimentacoesGuarda');
      movimentacoesGuardaCarregadas = true;

      const total = Number(resposta && resposta.total || 0);
      const resumo = document.getElementById('resumoMovimentacoesGuarda');
      if (resumo) resumo.textContent = total === 1 ? '1 registro nas últimas 24h' : total + ' registros nas últimas 24h';

      const ciclo = document.getElementById('cicloMovimentacoesGuarda');
      if (ciclo && resposta && resposta.periodoInicio && resposta.periodoFim) {
        ciclo.textContent = 'Período: ' + resposta.periodoInicio + ' até ' + resposta.periodoFim + '.';
      }

      const atualizado = document.getElementById('atualizadoEmMovimentacoesGuarda');
      if (atualizado) atualizado.textContent = resposta && resposta.atualizadoEm ? 'Atualizado em ' + resposta.atualizadoEm : '';
      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }
    })
    .withFailureHandler((erro) => {
      if (!silencioso) mostrarMensagem('Erro ao carregar movimentações: ' + erro.message, 'erro');
      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }
    })
    .getMovimentacoesRecentesGuarda();
}

function obterSessaoConsultaEfetivo() {
  return obterSessaoTokenConsultaEfetivoLocal();
}

function enviarCodigoConsultaEfetivo() {
  const email = String(document.getElementById('emailConsultaEfetivo').value || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    mostrarMensagem('Informe o e-mail cadastrado no efetivo do 1º GBM.', 'erro');
    return;
  }
  const botao = document.getElementById('btnEnviarCodigoConsultaEfetivo');
  botao.disabled = true;
  botao.textContent = 'Enviando...';
  google.script.run
    .withSuccessHandler((resposta) => {
      document.getElementById('areaCodigoConsultaEfetivo').classList.remove('oculto');
      document.getElementById('codigoConsultaEfetivo').focus();
      mostrarMensagem((resposta && resposta.mensagem) || 'Código enviado por e-mail.', 'sucesso');
      botao.disabled = false;
      botao.textContent = 'Reenviar código';
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Não foi possível liberar a consulta: ' + erro.message, 'erro');
      botao.disabled = false;
      botao.textContent = 'Enviar código';
    })
    .enviarCodigoConsultaEfetivo(email);
}

function validarCodigoConsultaEfetivo() {
  const email = String(document.getElementById('emailConsultaEfetivo').value || '').trim().toLowerCase();
  const codigo = String(document.getElementById('codigoConsultaEfetivo').value || '').trim();
  if (!email || !codigo) {
    mostrarMensagem('Informe o e-mail e o código recebido.', 'erro');
    return;
  }
  const botao = document.getElementById('btnValidarConsultaEfetivo');
  botao.disabled = true;
  botao.textContent = 'Validando...';
  google.script.run
    .withSuccessHandler((resposta) => {
      consultaEfetivoAtual = resposta && resposta.militar ? resposta.militar : null;
      localStorage.setItem('consulta_efetivo_sessao_token', resposta.sessaoToken || '');
      marcarInicioSessaoLocal('consulta_efetivo_sessao_iniciada_em');
      localStorage.setItem('consulta_efetivo_militar', JSON.stringify(consultaEfetivoAtual || {}));
      atualizarTelaConsultaEfetivo();
      carregarMovimentacoesConsultaEfetivo();
      carregarIdentidadesEquipeServico(true);
      atualizarVisibilidadePainelComandante();
      mostrarMensagem('E-mail validado. Painel de Gestão e consulta de movimentações liberados.', 'sucesso');
      botao.disabled = false;
      botao.textContent = 'Validar';
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Não foi possível validar a consulta: ' + erro.message, 'erro');
      botao.disabled = false;
      botao.textContent = 'Validar';
    })
    .validarCodigoConsultaEfetivo(email, codigo);
}

function restaurarConsultaEfetivo() {
  try {
    consultaEfetivoAtual = JSON.parse(localStorage.getItem('consulta_efetivo_militar') || 'null');
  } catch (erro) {
    consultaEfetivoAtual = null;
  }
  atualizarTelaConsultaEfetivo();
  if (obterSessaoConsultaEfetivo()) {
    carregarMovimentacoesConsultaEfetivo(true);
    atualizarVisibilidadePainelComandante();
  }
}

function atualizarTelaConsultaEfetivo() {
  const autenticado = !!obterSessaoConsultaEfetivo();
  const login = document.getElementById('areaLoginConsultaEfetivo');
  const area = document.getElementById('areaMovimentacoesConsultaEfetivo');
  const sair = document.getElementById('btnSairConsultaEfetivo');
  if (!login || !area || !sair) return;
  login.classList.toggle('oculto', autenticado);
  area.classList.toggle('oculto', !autenticado);
  sair.classList.toggle('oculto', !autenticado);
  const nome = document.getElementById('militarConsultaEfetivo');
  if (nome && consultaEfetivoAtual) {
    nome.textContent = (consultaEfetivoAtual.Nome || 'Militar do 1º GBM') + ' • Painel de Gestão liberado';
  }
}

function carregarMovimentacoesConsultaEfetivo(silencioso = false) {
  const token = obterSessaoConsultaEfetivo();
  if (!token) return;
  const botao = document.getElementById('btnAtualizarConsultaEfetivo');
  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Atualizando...';
  }
  google.script.run
    .withSuccessHandler((resposta) => {
      consultaEfetivoAtual = resposta && resposta.militar ? resposta.militar : consultaEfetivoAtual;
      localStorage.setItem('consulta_efetivo_militar', JSON.stringify(consultaEfetivoAtual || {}));
      atualizarTelaConsultaEfetivo();
      atualizarVisibilidadePainelComandante();
      const movimentacoes = resposta && resposta.movimentacoes ? resposta.movimentacoes : [];
      renderizarListaMovimentacoesRecentes(movimentacoes, 'listaMovimentacoesConsultaEfetivo');
      const total = Number(resposta && resposta.total || 0);
      document.getElementById('resumoConsultaEfetivo').textContent =
        total === 1 ? '1 movimentação nas últimas 48h' : total + ' movimentações nas últimas 48h';
      if (resposta && resposta.periodoInicio && resposta.periodoFim) {
        document.getElementById('periodoConsultaEfetivo').textContent =
          'Período: ' + resposta.periodoInicio + ' até ' + resposta.periodoFim + '.';
      }
      document.getElementById('atualizadoEmConsultaEfetivo').textContent =
        resposta && resposta.atualizadoEm ? 'Atualizado em ' + resposta.atualizadoEm : '';
      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }

    })
    .withFailureHandler((erro) => {
      sairConsultaEfetivo(false);
      if (!silencioso) mostrarMensagem('Erro ao consultar movimentações: ' + erro.message, 'erro');
      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }
    })
    .getMovimentacoesConsultaEfetivo(token);
}

function sairConsultaEfetivo(exibirMensagem = true) {
  consultaEfetivoAtual = null;
  localStorage.removeItem('consulta_efetivo_sessao_token');
  localStorage.removeItem('consulta_efetivo_sessao_iniciada_em');
  localStorage.removeItem('consulta_efetivo_militar');
  const codigo = document.getElementById('codigoConsultaEfetivo');
  if (codigo) codigo.value = '';
  atualizarTelaConsultaEfetivo();
  atualizarVisibilidadePainelComandante();
  carregarIdentidadesEquipeServico(true);
  if (exibirMensagem) mostrarMensagem('Acesso do efetivo encerrado neste aparelho.', 'sucesso');
}


function definirMovimentacoesGuardaRecolhido(recolhido) {
  const card = document.getElementById('cardMovimentacoesGuarda');
  const conteudo = document.getElementById('conteudoMovimentacoesGuarda');
  const botao = document.getElementById('btnAlternarMovimentacoesGuarda');
  if (!card || !conteudo || !botao) return;
  conteudo.hidden = recolhido;
  card.classList.toggle('recolhido', recolhido);
  botao.setAttribute('aria-expanded', recolhido ? 'false' : 'true');
  localStorage.setItem('movimentacoes_guarda_recolhido', recolhido ? 'sim' : 'nao');
}

function alternarMovimentacoesGuarda() {
  const conteudo = document.getElementById('conteudoMovimentacoesGuarda');
  if (!conteudo) return;
  definirMovimentacoesGuardaRecolhido(!conteudo.hidden);
}

function restaurarEstadoMovimentacoesGuarda() {
  definirMovimentacoesGuardaRecolhido(
    localStorage.getItem('movimentacoes_guarda_recolhido') !== 'nao'
  );
}

function limparGuardaLocal() {
  localStorage.removeItem('guarda_id_local');
  localStorage.removeItem('guarda_nome_local');
  localStorage.removeItem('guarda_rg_local');
  localStorage.removeItem('guarda_email_local');
  localStorage.removeItem('guarda_sessao_token');
  localStorage.removeItem('guarda_sessao_iniciada_em');
}

function aparelhoAssumiuGuardaAtual() {
  if (!guardaAtual || !guardaAtual.ID_GuardaServico) {
    return false;
  }

  const idLocal = localStorage.getItem('guarda_id_local');
  const tokenLocal = obterSessaoTokenLocal();
  const sessaoAceita = guardaAtual.Sessao_Valida === undefined || guardaAtual.Sessao_Valida === true;

  return !!(idLocal && tokenLocal && idLocal === guardaAtual.ID_GuardaServico && sessaoAceita);
}

function atualizarVisibilidadePessoasDentroGuarda() {
  const card = document.getElementById('cardPessoasDentroGuarda');

  if (!card) return;

  if (aparelhoPodeOperarGuardaAtual()) {
    card.classList.remove('oculto');
    restaurarEstadoPessoasDentroGuarda();

    if (!pessoasDentroGuardaCarregadas) {
      carregarPessoasDentroGuarda(true);
    }
  } else {
    card.classList.add('oculto');
    pessoasDentroGuardaCarregadas = false;
  }
}

function normalizarIdOperacional(valor) {
  return String(valor || '').trim();
}

function obterCoberturaOperacionalAtual() {
  const status = statusToqueFogoAtual || {};
  const cobertura = status.cobertura || null;

  if (!estadoToqueFogoCarregado || !cobertura || !guardaAtual) return null;

  const idTitular = normalizarIdOperacional(cobertura.ID_GuardaServico_Titular);
  const idGuardaAtual = normalizarIdOperacional(guardaAtual.ID_GuardaServico);

  // Uma nova Guarda sempre tem prioridade sobre eventual cobertura antiga ainda
  // presente numa resposta em trânsito.
  if (!idTitular || !idGuardaAtual || idTitular !== idGuardaAtual) return null;

  return cobertura;
}

function coberturaPertenceAoToqueAtual(cobertura) {
  const toque = statusToqueFogoAtual && statusToqueFogoAtual.toque;
  if (!cobertura || !toque) return false;

  const idCobertura = normalizarIdOperacional(cobertura.ID_ToqueFogo);
  const idToqueAtual = normalizarIdOperacional(toque.ID_ToqueFogo);
  return !!(idCobertura && idToqueAtual && idCobertura === idToqueAtual);
}

function aparelhoAtuaComoGuardaTitular() {
  return estadoToqueFogoCarregado && !obterCoberturaOperacionalAtual() && aparelhoAssumiuGuardaAtual();
}

function aparelhoAtuaComoToqueNaCobertura() {
  const cobertura = obterCoberturaOperacionalAtual();
  const status = statusToqueFogoAtual || {};
  return !!(
    cobertura &&
    obterSessaoTokenToqueLocal() &&
    status.sessaoCoberturaAtiva === true
  );
}

function podeGuardaRetomarNesteAparelho() {
  const cobertura = obterCoberturaOperacionalAtual();
  if (!cobertura || !aparelhoAssumiuGuardaAtual()) return false;

  const idTitular = normalizarIdOperacional(cobertura.ID_GuardaServico_Titular);
  const idGuardaAtual = normalizarIdOperacional(guardaAtual && guardaAtual.ID_GuardaServico);
  return !!(idTitular && idGuardaAtual && idTitular === idGuardaAtual);
}

function podeToqueAssumirHoraNesteAparelho() {
  const status = statusToqueFogoAtual || {};
  const cobertura = obterCoberturaOperacionalAtual();
  return !!(
    estadoToqueFogoCarregado &&
    guardaAtual &&
    status.toque &&
    aparelhoAssumiuToqueAtual() &&
    (!cobertura || !coberturaPertenceAoToqueAtual(cobertura))
  );
}

function carregarStatusToqueFogo(silencioso = false) {
  carregarIdentidadesEquipeServico(silencioso, true);
}

function atualizarVisibilidadeMovimentacoesGuarda() {
  const card = document.getElementById('cardMovimentacoesGuarda');
  if (!card) return;
  if (aparelhoPodeOperarGuardaAtual()) {
    card.classList.remove('oculto');
    restaurarEstadoMovimentacoesGuarda();
    if (!movimentacoesGuardaCarregadas) carregarMovimentacoesGuarda(true);
  } else {
    card.classList.add('oculto');
    movimentacoesGuardaCarregadas = false;
  }
}

function obterProgramacaoToqueFogoExibicao() {
  const status = statusToqueFogoAtual || {};
  if (Array.isArray(status.programacao) && status.programacao.length) {
    return status.programacao;
  }

  const periodoAtual = status.periodo || {};
  return [
    {
      periodo: { nome: 'Diurno', faixa: '08h às 22h' },
      toque: periodoAtual.nome === 'Diurno' ? (status.toque || null) : null
    },
    {
      periodo: { nome: 'Noturno', faixa: '22h às 08h' },
      toque: periodoAtual.nome === 'Noturno' ? (status.toque || null) : null
    }
  ];
}

function obterPeriodoAlvoToqueFogo() {
  const campo = document.getElementById('periodoAlvoToqueFogo');
  return campo && campo.value === 'Noturno' ? 'Noturno' : 'Diurno';
}

function atualizarTituloDefinicaoToqueFogo() {
  const periodo = obterPeriodoAlvoToqueFogo();
  const titulo = document.getElementById('tituloDefinicaoToqueFogo');
  const botao = document.getElementById('btnAssumirToqueFogo');
  if (titulo) titulo.textContent = 'Definir Toque de Fogo ' + periodo.toLowerCase();
  if (botao && !botao.disabled) botao.textContent = 'Confirmar Toque ' + periodo.toLowerCase();
}

function renderizarProgramacaoToqueFogo() {
  const container = document.getElementById('programacaoToqueFogo');
  if (!container) return;
  const status = statusToqueFogoAtual || {};
  const nomePeriodoAtual = String(status.periodo && status.periodo.nome || '');

  container.innerHTML = obterProgramacaoToqueFogoExibicao().map(item => {
    const periodo = item && item.periodo ? item.periodo : {};
    const toque = item && item.toque ? item.toque : null;
    const nomePeriodo = String(periodo.nome || '').toLowerCase() === 'noturno'
      ? 'Noturno'
      : 'Diurno';
    const periodoAtual = nomePeriodo === nomePeriodoAtual;
    const periodoEncerrado = nomePeriodoAtual === 'Noturno' && nomePeriodo === 'Diurno';
    let situacao = 'A definir';
    if (!toque && periodoEncerrado) situacao = 'Não definido';
    else if (toque && periodoAtual) situacao = 'Em serviço';
    else if (toque && nomePeriodoAtual === 'Diurno' && nomePeriodo === 'Noturno') situacao = 'Programado';
    else if (toque && periodoEncerrado) situacao = 'Concluído';

    const identificacao = toque
      ? (toque.Nome_Toque
          ? escaparHtml(toque.Nome_Toque) +
            (toque.RG_Toque ? ' — RG ' + escaparHtml(toque.RG_Toque) : '')
          : 'Militar definido')
      : 'Ainda não definido';
    const rotuloBotao = periodoEncerrado ? 'Encerrado' : (toque ? 'Trocar' : 'Definir');

    return '<div class="periodo-programado-toque' + (periodoAtual ? ' periodo-atual' : '') + '">' +
      '<div><strong>' + escaparHtml(nomePeriodo) + ' • ' + escaparHtml(periodo.faixa || '') +
      '<span class="selo-periodo-toque">' + escaparHtml(situacao) + '</span></strong>' +
      '<small>' + identificacao + '</small></div>' +
      '<button type="button" class="botao-periodo-toque"' +
      (periodoEncerrado ? ' disabled' : '') +
      ' onclick="mostrarAreaTrocaToqueFogo(\'' + escaparHtml(nomePeriodo) + '\')">' +
      rotuloBotao + '</button></div>';
  }).join('');
}

function atualizarTelaToqueFogo() {
  const status = statusToqueFogoAtual || {};
  const periodo = status.periodo || {};
  const toque = status.toque || null;
  const cobertura = obterCoberturaOperacionalAtual();
  const statusEl = document.getElementById('statusToqueFogo');
  const periodoEl = document.getElementById('periodoToqueFogo');
  const areaAssumir = document.getElementById('areaAssumirToqueFogo');
  const btnTrocar = document.getElementById('btnTrocarToqueFogo');
  const coberturaEl = document.getElementById('statusCoberturaToque');

  periodoEl.textContent = (periodo.nome || 'Período atual') + ' • ' + (periodo.faixa || '');
  statusEl.classList.remove('sem-guarda', 'com-guarda');

  const seletorPeriodo = document.getElementById('periodoAlvoToqueFogo');
  const opcaoDiurna = seletorPeriodo && seletorPeriodo.querySelector('option[value="Diurno"]');
  if (opcaoDiurna) opcaoDiurna.disabled = periodo.nome === 'Noturno';
  if (opcaoDiurna && opcaoDiurna.disabled && seletorPeriodo.value === 'Diurno') {
    seletorPeriodo.value = 'Noturno';
    alterarPeriodoAlvoToqueFogo();
  }

  if (obterSessaoTokenToqueLocal() && status.sessaoValida === false) {
    limparToqueFogoLocal();
  }

  if (toque) {
    statusEl.classList.add('com-guarda');
    statusEl.innerHTML = toque.Nome_Toque && toque.RG_Toque
      ? 'Em serviço agora:<br>' + escaparHtml(toque.Nome_Toque) +
        ' — RG ' + escaparHtml(toque.RG_Toque)
      : 'O Toque de Fogo do período atual já está definido.<br><small>Entre para consultar a programação.</small>';
  } else {
    statusEl.classList.add('sem-guarda');
    statusEl.textContent = 'Nenhum Toque de Fogo foi definido para o período ' +
      (periodo.faixa || 'atual') + '.';
  }

  if (status.sessaoValida === true && status.sessaoPeriodoAtual !== true) {
    const idLocal = localStorage.getItem('toque_fogo_id_local') || '';
    const itemLocal = obterProgramacaoToqueFogoExibicao().find(item =>
      item && item.toque && String(item.toque.ID_ToqueFogo || '') === idLocal
    );
    const nomeLocal = itemLocal && itemLocal.periodo ? itemLocal.periodo.nome : '';
    statusEl.innerHTML += '<br><small>' + (nomeLocal === 'Noturno'
      ? 'Este celular está validado para o período noturno e será habilitado automaticamente às 22h.'
      : 'Este celular está validado para outro período deste ciclo.') + '</small>';
  }

  areaAssumir.classList.toggle('oculto', !loginToqueFogoAberto);
  btnTrocar.classList.remove('oculto');
  btnTrocar.textContent = 'Definir / Trocar';
  renderizarProgramacaoToqueFogo();

  if (cobertura) {
    coberturaEl.classList.remove('oculto');
    coberturaEl.innerHTML = cobertura.Nome_Toque && cobertura.Nome_Guarda_Titular
      ? '<strong>Cobertura ativa</strong><br>' +
        escaparHtml(cobertura.Nome_Toque) + ' está no posto por ' +
        escaparHtml(cobertura.Nome_Guarda_Titular) + '.<br>' +
        'Início: ' + escaparHtml(cobertura.DataHora_Inicio || '-')
      : '<strong>Cobertura ativa</strong><br>O posto está em cobertura temporária.';
  } else {
    coberturaEl.classList.add('oculto');
    coberturaEl.innerHTML = '';
  }

  atualizarAcoesCoberturaEPermissoes();
}

function escolherPeriodoPadraoToqueFogo() {
  const atual = String(statusToqueFogoAtual && statusToqueFogoAtual.periodo &&
    statusToqueFogoAtual.periodo.nome || 'Diurno');
  const programacao = obterProgramacaoToqueFogoExibicao().filter(item =>
    !(atual === 'Noturno' && item && item.periodo && item.periodo.nome === 'Diurno')
  );
  const faltanteAtual = programacao.find(item => item && item.periodo &&
    item.periodo.nome === atual && !item.toque);
  const faltante = faltanteAtual || programacao.find(item => item && !item.toque);
  return faltante && faltante.periodo ? faltante.periodo.nome : atual;
}

function mostrarAreaTrocaToqueFogo(periodoAlvo) {
  const periodoAtual = String(statusToqueFogoAtual && statusToqueFogoAtual.periodo &&
    statusToqueFogoAtual.periodo.nome || '');
  if (periodoAtual === 'Noturno' && periodoAlvo === 'Diurno') {
    mostrarMensagem('O período diurno deste ciclo já foi encerrado.', 'erro');
    return;
  }
  loginToqueFogoAberto = true;
  expandirPerfilServico('cardToqueFogo', true);
  const campoPeriodo = document.getElementById('periodoAlvoToqueFogo');
  if (campoPeriodo) {
    campoPeriodo.value = periodoAlvo === 'Noturno' || periodoAlvo === 'Diurno'
      ? periodoAlvo
      : escolherPeriodoPadraoToqueFogo();
  }
  atualizarTituloDefinicaoToqueFogo();
  document.getElementById('areaAssumirToqueFogo').classList.remove('oculto');
  mostrarMensagem(
    'Valide o e-mail do militar que ficará como Toque de Fogo ' +
      obterPeriodoAlvoToqueFogo().toLowerCase() + '.',
    'sucesso'
  );
}

function alterarPeriodoAlvoToqueFogo() {
  const haviaValidacao = !!dadosCodigoToqueFogo ||
    !document.getElementById('areaCodigoToqueFogo').classList.contains('oculto');
  geracaoValidacaoToqueFogo += 1;
  dadosCodigoToqueFogo = null;
  const codigo = document.getElementById('codigoToqueFogo');
  if (codigo) codigo.value = '';
  ['areaCodigoToqueFogo', 'areaToqueFogoIdentificado', 'areaToqueFogoManual', 'btnAssumirToqueFogo']
    .forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) elemento.classList.add('oculto');
    });
  atualizarTituloDefinicaoToqueFogo();
  if (haviaValidacao) {
    mostrarMensagem('O período foi alterado. Solicite um novo código para continuar.', 'erro');
  }
}

function enviarCodigoToqueFogo() {
  const email = document.getElementById('emailToqueFogo').value.trim().toLowerCase();
  const periodoAlvo = obterPeriodoAlvoToqueFogo();
  if (!email || !email.includes('@')) {
    mostrarMensagem('Informe um e-mail válido.', 'erro');
    return;
  }
  const geracao = ++geracaoValidacaoToqueFogo;
  google.script.run
    .withSuccessHandler((resposta) => {
      if (geracao !== geracaoValidacaoToqueFogo) return;
      dadosCodigoToqueFogo = {
        email: email,
        encontradoNoEfetivo: false,
        militar: null,
        ticketAssuncao: '',
        periodoAlvo: resposta.periodo || periodoAlvo
      };
      document.getElementById('areaCodigoToqueFogo').classList.remove('oculto');
      mostrarMensagem(
        'Se o e-mail estiver autorizado, o código do período ' +
          periodoAlvo.toLowerCase() + ' será enviado.',
        'sucesso'
      );
    })
    .withFailureHandler((erro) => mostrarMensagem('Erro ao enviar código: ' + erro.message, 'erro'))
    .enviarCodigoAssumirToqueFogo(email, periodoAlvo);
}

function validarCodigoToqueFogo() {
  const email = document.getElementById('emailToqueFogo').value.trim().toLowerCase();
  const codigo = document.getElementById('codigoToqueFogo').value.trim();
  const periodoAlvo = obterPeriodoAlvoToqueFogo();
  if (!email || !codigo) {
    mostrarMensagem('Informe o e-mail e o código.', 'erro');
    return;
  }
  if (!dadosCodigoToqueFogo || dadosCodigoToqueFogo.periodoAlvo !== periodoAlvo) {
    mostrarMensagem('Solicite primeiro o código para este período.', 'erro');
    return;
  }
  const geracao = geracaoValidacaoToqueFogo;
  google.script.run
    .withSuccessHandler((resposta) => {
      if (geracao !== geracaoValidacaoToqueFogo) return;
      dadosCodigoToqueFogo = {
        email: resposta.email,
        encontradoNoEfetivo: resposta.encontradoNoEfetivo,
        militar: resposta.militar || null,
        ticketAssuncao: resposta.ticketAssuncao || '',
        periodoAlvo: resposta.periodo || periodoAlvo
      };
      const area = document.getElementById('areaToqueFogoIdentificado');
      const manual = document.getElementById('areaToqueFogoManual');
      area.classList.remove('oculto');
      document.getElementById('btnAssumirToqueFogo').classList.remove('oculto');
      if (resposta.encontradoNoEfetivo && resposta.militar) {
        area.innerHTML = 'Militar identificado:<br>' + escaparHtml(resposta.militar.Nome) +
          ' — RG ' + escaparHtml(resposta.militar.RG);
        manual.classList.add('oculto');
      } else {
        area.textContent = 'E-mail validado. Informe RG e nome do militar.';
        manual.classList.remove('oculto');
      }
      atualizarTituloDefinicaoToqueFogo();
      mostrarMensagem('Código validado para o período ' + periodoAlvo.toLowerCase() + '.', 'sucesso');
    })
    .withFailureHandler((erro) => mostrarMensagem('Erro ao validar código: ' + erro.message, 'erro'))
    .validarCodigoAssumirToqueFogo(email, codigo, periodoAlvo);
}

function assumirToqueFogo(encerrarAnterior = false, idToqueAnteriorEsperado = '') {
  if (!dadosCodigoToqueFogo) {
    mostrarMensagem('Valide o e-mail antes de assumir o Toque de Fogo.', 'erro');
    return;
  }
  const botao = document.getElementById('btnAssumirToqueFogo');
  botao.disabled = true;
  botao.textContent = 'Definindo...';
  const dados = {
    email: dadosCodigoToqueFogo.email,
    origemIdentificacao: dadosCodigoToqueFogo.encontradoNoEfetivo ? 'Efetivo' : 'Manual',
    militar: dadosCodigoToqueFogo.militar,
    rgManual: document.getElementById('rgToqueFogoManual').value.trim(),
    nomeManual: document.getElementById('nomeToqueFogoManual').value.trim(),
    ticketAssuncao: dadosCodigoToqueFogo.ticketAssuncao || '',
    periodoAlvo: dadosCodigoToqueFogo.periodoAlvo || obterPeriodoAlvoToqueFogo(),
    encerrarAnterior: encerrarAnterior,
    idToqueAnteriorEsperado: idToqueAnteriorEsperado
  };
  google.script.run
    .withSuccessHandler((resposta) => {
      botao.disabled = false;
      atualizarTituloDefinicaoToqueFogo();
      if (resposta.requerConfirmacaoTroca && resposta.toqueAtivo) {
        abrirModalConfirmacao(
          'Toque de Fogo já definido',
          'O período ' + escaparHtml(dados.periodoAlvo.toLowerCase()) +
            ' está definido para <strong>' + escaparHtml(resposta.toqueAtivo.Nome_Toque) +
            '</strong>.<br><br>Deseja realizar a troca?',
          () => assumirToqueFogo(true, resposta.toqueAtivo.ID_ToqueFogo || ''),
          true
        );
        return;
      }
      if (resposta.sucesso === false) {
        carregarIdentidadesEquipeServico(true);
        mostrarMensagem(resposta.mensagem || 'A programação mudou. Tente novamente.', 'erro');
        return;
      }
      if (resposta.toque) salvarToqueFogoLocal(resposta.toque);
      geracaoConsultaToque += 1;
      statusToqueFogoAtual = resposta.statusToque || statusToqueFogoAtual;
      limparAreaToqueFogo();
      carregarIdentidadesEquipeServico(true);
      mostrarMensagem(resposta.mensagem || 'Toque de Fogo definido.', 'sucesso');
    })
    .withFailureHandler((erro) => {
      botao.disabled = false;
      atualizarTituloDefinicaoToqueFogo();
      mostrarMensagem('Erro ao definir Toque de Fogo: ' + erro.message, 'erro');
    })
    .assumirToqueFogoComEmailValidado(dados);
}

function limparAreaToqueFogo() {
  geracaoValidacaoToqueFogo += 1;
  dadosCodigoToqueFogo = null;
  loginToqueFogoAberto = false;
  ['emailToqueFogo', 'codigoToqueFogo', 'rgToqueFogoManual', 'nomeToqueFogoManual'].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.value = '';
  });
  ['areaCodigoToqueFogo', 'areaToqueFogoIdentificado', 'areaToqueFogoManual', 'btnAssumirToqueFogo'].forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.classList.add('oculto');
  });
  atualizarTituloDefinicaoToqueFogo();
}

function salvarToqueFogoLocal(toque) {
  if (!toque || !toque.ID_ToqueFogo) return;
  localStorage.setItem('toque_fogo_id_local', toque.ID_ToqueFogo);
  localStorage.setItem('toque_fogo_sessao_token', toque.Sessao_Token || 'apps-script-local');
  marcarInicioSessaoLocal('toque_fogo_sessao_iniciada_em');
}

function limparToqueFogoLocal() {
  localStorage.removeItem('toque_fogo_id_local');
  localStorage.removeItem('toque_fogo_sessao_token');
  localStorage.removeItem('toque_fogo_sessao_iniciada_em');
}

function aparelhoAssumiuToqueAtual() {
  const toque = statusToqueFogoAtual && statusToqueFogoAtual.toque;
  if (!toque || !toque.ID_ToqueFogo) return false;
  const token = obterSessaoTokenToqueLocal();
  if (!token) return false;
  if (typeof statusToqueFogoAtual.sessaoPeriodoAtual === 'boolean') {
    return statusToqueFogoAtual.sessaoPeriodoAtual;
  }
  const idLocal = localStorage.getItem('toque_fogo_id_local');
  const sessaoAceita = toque.Sessao_Valida === undefined || toque.Sessao_Valida === true;
  return !!(idLocal && idLocal === toque.ID_ToqueFogo && sessaoAceita);
}

function aparelhoPodeOperarGuardaAtual() {
  return aparelhoAtuaComoGuardaTitular() || aparelhoAtuaComoToqueNaCobertura();
}

function garantirPermissaoOperacionalAtual() {
  if (guardaAtual && aparelhoPodeOperarGuardaAtual()) return true;

  atualizarAcoesCoberturaEPermissoes();
  carregarIdentidadesEquipeServico(true);
  mostrarMensagem(
    'Este celular não está autorizado a lançar agora. Atualizamos o estado da Guarda para sua segurança.',
    'erro'
  );
  return false;
}

function manterAcoesCoberturaAcessiveis(retomarVisivel, assumirVisivel) {
  const perfilGuarda = document.getElementById('perfilGuarda');
  const perfilToque = document.getElementById('cardToqueFogo');
  if (perfilGuarda) perfilGuarda.classList.toggle('tem-acao-cobertura', retomarVisivel);
  if (perfilToque) perfilToque.classList.toggle('tem-acao-cobertura', assumirVisivel);

  if (!retomarVisivel && !assumirVisivel) return;

  const cardEquipe = document.getElementById('cardEquipeServico');
  const botaoEquipe = document.getElementById('btnAlternarEquipeServico');
  if (cardEquipe) cardEquipe.classList.remove('equipe-recolhida');
  if (botaoEquipe) botaoEquipe.setAttribute('aria-expanded', 'true');
}

function atualizarAcoesCoberturaEPermissoes() {
  const btnRetomar = document.getElementById('btnRetomarPosto');
  const btnAssumirHora = document.getElementById('btnAssumirHoraToque');
  const retomarVisivel = podeGuardaRetomarNesteAparelho();
  const assumirVisivel = podeToqueAssumirHoraNesteAparelho();

  if (btnRetomar) btnRetomar.classList.toggle('oculto', !retomarVisivel);
  if (btnAssumirHora) btnAssumirHora.classList.toggle('oculto', !assumirVisivel);

  manterAcoesCoberturaAcessiveis(retomarVisivel, assumirVisivel);
  atualizarPermissaoLancamento();
}

function confirmarRetomadaPosto() {
  const cobertura = obterCoberturaOperacionalAtual();
  const idCobertura = normalizarIdOperacional(cobertura && cobertura.ID_Cobertura);

  if (!podeGuardaRetomarNesteAparelho() || !idCobertura) {
    carregarIdentidadesEquipeServico(true);
    mostrarMensagem('A cobertura foi atualizada. Verifique novamente antes de retomar o posto.', 'erro');
    return;
  }

  abrirModalConfirmacao(
    'Retomar Posto',
    'Confirma que o militar da hora retornou e está retomando o posto da Guarda?',
    () => retomarPostoAposSOS(idCobertura)
  );
}

function confirmarAssuncaoHoraToque() {
  abrirModalConfirmacao(
    'Assumir Hora',
    'Confirma que o Toque de Fogo está assumindo imediatamente o posto do militar da hora?',
    () => assumirHoraToqueFogo()
  );
}

function assumirHoraToqueFogo() {
  const botao = document.getElementById('btnAssumirHoraToque');
  const geracaoSessao = geracaoSessaoEquipe;

  if (!podeToqueAssumirHoraNesteAparelho()) {
    carregarIdentidadesEquipeServico(true);
    mostrarMensagem('A Guarda foi atualizada e este Toque de Fogo não pode assumir a hora agora.', 'erro');
    return;
  }

  botao.disabled = true;
  botao.textContent = 'Assumindo...';

  google.script.run
    .withSuccessHandler((resposta) => {
      botao.disabled = false;
      botao.textContent = 'Assumir Hora';
      if (!respostaPertenceASessaoEquipe(geracaoSessao)) {
        carregarIdentidadesEquipeServico(true);
        return;
      }
      geracaoConsultaToque += 1;
      statusToqueFogoAtual = resposta.statusToque || statusToqueFogoAtual || {};
      statusToqueFogoAtual.sessaoValida = true;
      statusToqueFogoAtual.sessaoPeriodoAtual = true;
      statusToqueFogoAtual.sessaoCoberturaAtiva = true;
      estadoToqueFogoCarregado = true;
      atualizarTelaToqueFogo();
      carregarIdentidadesEquipeServico(true);
      mostrarMensagem(resposta.mensagem || 'Hora assumida pelo Toque de Fogo.', 'sucesso');
    })
    .withFailureHandler((erro) => {
      botao.disabled = false;
      botao.textContent = 'Assumir Hora';
      mostrarMensagem('Erro ao assumir a hora: ' + erro.message, 'erro');
    })
    .assumirHoraToqueFogo();
}

function retomarPostoAposSOS(idCobertura) {
  const botao = document.getElementById('btnRetomarPosto');
  const geracaoSessao = geracaoSessaoEquipe;
  const coberturaAtual = obterCoberturaOperacionalAtual();
  const idCoberturaAtual = normalizarIdOperacional(coberturaAtual && coberturaAtual.ID_Cobertura);

  if (!podeGuardaRetomarNesteAparelho() || !idCoberturaAtual || idCoberturaAtual !== idCobertura) {
    carregarIdentidadesEquipeServico(true);
    mostrarMensagem('A cobertura mudou antes da confirmação. Verifique novamente para retomar o posto.', 'erro');
    return;
  }

  botao.disabled = true;
  botao.textContent = 'Retomando...';

  google.script.run
    .withSuccessHandler((resposta) => {
      botao.disabled = false;
      botao.textContent = 'Retomar Posto';
      if (!respostaPertenceASessaoEquipe(geracaoSessao)) {
        carregarIdentidadesEquipeServico(true);
        return;
      }
      geracaoConsultaToque += 1;
      statusToqueFogoAtual = resposta.statusToque || statusToqueFogoAtual || {};
      estadoToqueFogoCarregado = true;
      atualizarTelaToqueFogo();
      carregarIdentidadesEquipeServico(true);
      mostrarMensagem(resposta.mensagem || 'Posto retomado pelo guarda.', 'sucesso');
    })
    .withFailureHandler((erro) => {
      botao.disabled = false;
      botao.textContent = 'Retomar Posto';
      carregarIdentidadesEquipeServico(true);
      mostrarMensagem('Erro ao retomar o posto: ' + erro.message, 'erro');
    })
    .retomarPostoAposSOS(idCoberturaAtual);
}

function atualizarPermissaoLancamento() {
  const cardMovimentacao = document.getElementById('cardMovimentacao');
  const aviso = document.getElementById('avisoSemPermissaoLancamento');

  if (!cardMovimentacao || !aviso) {
    return;
  }

  const podeLancar = guardaAtual && aparelhoPodeOperarGuardaAtual();
  const podeLancarRetroativo = modoLancamentoRetroativoAtivo && aparelhoAssumiuComandanteAtual();
  const cobertura = obterCoberturaOperacionalAtual();

  if (modoLancamentoRetroativoAtivo && !podeLancarRetroativo) {
    cancelarLancamentoRetroativoPendente();
  }

  atualizarVisibilidadePessoasDentroGuarda();
  atualizarVisibilidadeMovimentacoesGuarda();
  atualizarVisibilidadeGuarnicoesServico();

  if (podeLancar || podeLancarRetroativo) {
    cardMovimentacao.classList.remove('oculto');
    aviso.classList.add('oculto');
  } else {
    cardMovimentacao.classList.add('oculto');

    if (guardaAtual) {
      if (!estadoToqueFogoCarregado) {
        aviso.textContent = 'Atualizando quem está efetivamente no posto...';
      } else if (cobertura && aparelhoAssumiuGuardaAtual()) {
        aviso.textContent = 'O Toque de Fogo assumiu a hora. Os lançamentos deste celular ficam bloqueados até o guarda usar Retomar Posto.';
      } else if (cobertura) {
        aviso.textContent = 'A Guarda está em cobertura. Somente o celular do Toque de Fogo que assumiu a hora pode lançar.';
      } else if (aparelhoAssumiuToqueAtual()) {
        aviso.textContent = 'O guarda titular está no posto. Para substituí-lo, use Assumir Hora no cartão do Toque de Fogo.';
      } else {
        aviso.textContent = 'Este celular não está autorizado para lançar registros. Assuma a Guarda neste aparelho.';
      }
      aviso.classList.remove('oculto');
    } else {
      aviso.classList.add('oculto');
    }
  }
}
