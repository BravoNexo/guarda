const URL_API = 'https://script.google.com/macros/s/AKfycbwqSpqWQOjFcOfSClEGTesKZAGPnuMaKQiIIu9RYChC5yFX6gwXpwFg1f5DpvbNHy5j/exec';
const parametrosUrl = new URLSearchParams(window.location.search);

window.PARAM_EMAIL_GUARDA = parametrosUrl.get('email') || '';
window.PARAM_CODIGO_GUARDA = parametrosUrl.get('codigo') || '';
window.PARAM_PERFIL = parametrosUrl.get('perfil') || '';

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
  return localStorage.getItem('guarda_sessao_token') || '';
}

function obterSessaoTokenComandanteLocal() {
  return localStorage.getItem('comandante_sessao_token') || '';
}

function obterSessaoTokenToqueLocal() {
  return localStorage.getItem('toque_fogo_sessao_token') || '';
}

function obterSessaoTokenOficialLocal() {
  return localStorage.getItem('oficial_dia_sessao_token') || '';
}

function obterSessaoTokenConsultaEfetivoLocal() {
  return localStorage.getItem('consulta_efetivo_sessao_token') || '';
}

function montarDadosChamadaApi(nome, argumentos) {
  const sessaoToken = obterSessaoTokenLocal();
  const sessaoComandanteToken = obterSessaoTokenComandanteLocal();
  const sessaoToqueToken = obterSessaoTokenToqueLocal();
  const sessaoOficialToken = obterSessaoTokenOficialLocal();

  switch (nome) {
    case 'getListasFormulario':
      return {};
    case 'getGuardaAtivo':
      return { sessaoToken: sessaoToken };
    case 'getComandanteAtivo':
      return { sessaoToken: sessaoComandanteToken };
    case 'getOficialDiaAtivo':
      return {};
    case 'getDadosOficialDiaParaComandante':
      return { sessaoToken: sessaoComandanteToken };
    case 'designarOficialDia':
      return { rgOficial: argumentos[0], sessaoToken: sessaoComandanteToken };
    case 'getStatusToqueFogo':
      return { sessaoToken: sessaoToqueToken };
    case 'getPainelComandante':
      return { sessaoToken: sessaoComandanteToken, sessaoOficialToken: sessaoOficialToken };
    case 'consultarHistoricoMovimentacoes':
      return {
        filtros: argumentos[0] || {},
        sessaoToken: sessaoComandanteToken,
        sessaoOficialToken: sessaoOficialToken
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
        sessaoToqueToken: sessaoToqueToken
      };
    case 'registrarMovimentacao':
      return { movimentacao: argumentos[0], sessaoToken: sessaoToken, sessaoToqueToken: sessaoToqueToken };
    case 'enviarCodigoAssumirToqueFogo':
      return { email: argumentos[0] };
    case 'validarCodigoAssumirToqueFogo':
      return { email: argumentos[0], codigo: argumentos[1] };
    case 'assumirToqueFogoComEmailValidado':
      return argumentos[0] || {};
    case 'retomarPostoAposSOS':
      return { sessaoToken: sessaoToken };
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
    if (status.toque) status.toque.Sessao_Valida = status.sessaoValida === true;
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
    'getGuardaAtivo',
    'getComandanteAtivo',
    'getOficialDiaAtivo',
    'getDadosOficialDiaParaComandante',
    'designarOficialDia',
    'getStatusToqueFogo',
    'getPainelComandante',
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

  let dadosCodigoGuarda = null;
  let guardaAtual = null;
  let emailEncerramentoGuarda = null;
  let dadosCodigoComandante = null;
  let comandanteAtual = null;
  let emailEncerramentoComandante = null;
  let painelComandanteCarregado = false;
  let historicoInicializado = false;
  let dadosCodigoOficial = null;
  let oficialAtual = null;
  let oficialAcessoAtual = null;
  let emailEncerramentoOficial = null;
  let pessoasDentroGuardaCarregadas = false;
  let movimentacoesGuardaCarregadas = false;
  let statusToqueFogoAtual = null;
let dadosCodigoToqueFogo = null;
let loginToqueFogoAberto = false;
let consultaEfetivoAtual = null;


  document.addEventListener('DOMContentLoaded', () => {
    inicializarEquipeServico();
    carregarListas();
    selecionarModoRegistro('Individual');
    alternarTipoRegistro();
    carregarGuardaAtivo();
    carregarComandanteAtivo();
    carregarOficialDiaAtivo();
    carregarStatusToqueFogo();
    restaurarCodigoGuardaPendente();
    restaurarCodigoComandantePendente();
    restaurarCodigoOficialPendente();
    restaurarAcessoOficial();
    aplicarCodigoDoLink();
    inicializarFiltrosHistorico();
  inicializarSecoesPainelComandante();
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

    setInterval(() => {
      if (aparelhoPodeOperarGuardaAtual()) {
        carregarPessoasDentroGuarda(true);
        carregarMovimentacoesGuarda(true);
      }

      carregarStatusToqueFogo(true);

    if (aparelhoAssumiuComandanteAtual() || aparelhoAssumiuOficialAtual()) {
      carregarPainelComandante(true);
    }

    if (obterSessaoConsultaEfetivo()) carregarMovimentacoesConsultaEfetivo(true);
    }, 60000);
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

  function criarSelectMilitaresSOS(valorAtual, textoInicial) {
    const select = document.createElement('select');
    const inicial = document.createElement('option');
    inicial.value = '';
    inicial.textContent = textoInicial;
    select.appendChild(inicial);

    militaresSOS.forEach(militar => {
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
        mostrarMensagem(resposta.mensagem || 'SOS registrado com sucesso.', 'sucesso');
        viaturasSOS = resposta.dadosSOS ? resposta.dadosSOS.viaturas || [] : viaturasSOS;
        militaresSOS = resposta.dadosSOS ? resposta.dadosSOS.militares || [] : militaresSOS;
        guarnicoesServico = resposta.dadosSOS ? resposta.dadosSOS.guarnicoesServico || [] : guarnicoesServico;
        cicloGuarnicoesServico = resposta.dadosSOS ? resposta.dadosSOS.ciclo || cicloGuarnicoesServico : cicloGuarnicoesServico;
        statusToqueFogoAtual = resposta.statusToque || statusToqueFogoAtual;
        selecoesViaturasSOS = {};
        document.getElementById('observacoesSOS').value = '';
        renderizarSelecaoViaturasSOS();
        renderizarEditorGuarnicoesServico();
        carregarPessoasDentroGuarda(true);
        carregarMovimentacoesGuarda(true);
        carregarPainelComandante(true);
        carregarStatusToqueFogo(true);
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
    return aparelhoAssumiuGuardaAtual() ||
      aparelhoAssumiuToqueAtual() ||
      aparelhoAssumiuComandanteAtual();
  }

  function definirGuarnicoesServicoRecolhido(recolhido) {
    const card = document.getElementById('cardGuarnicoesServico');
    const conteudo = document.getElementById('conteudoGuarnicoesServico');
    const botao = document.getElementById('btnAlternarGuarnicoesServico');

    if (!card || !conteudo || !botao) return;

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
    };
    renderizarIntegrantesGuarnicaoServico();
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
      chip.onclick = () => {
        idsGuarnicaoServicoEdicao = idsGuarnicaoServicoEdicao.filter(item => item !== id);
        renderizarIntegrantesGuarnicaoServico();
      };
      chips.appendChild(chip);
    });
  }

  function adicionarIntegranteGuarnicaoServico() {
    const select = document.getElementById('integranteGuarnicaoServico');
    if (!select.value) return;
    idsGuarnicaoServicoEdicao.push(select.value);
    renderizarIntegrantesGuarnicaoServico();
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

    lista.sort((a, b) => Number(a.Ordem || 999) - Number(b.Ordem || 999));

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
    document.getElementById('nomePessoaNaoEncontrada').value = '';
    preencherDestinos();
    preencherProcedencias();
  }

  function termoBuscaPessoaValido(termo) {
    const texto = String(termo || '').trim();
    const digitos = texto.replace(/\D/g, '');
    return texto.length >= 2 || digitos.length >= 2;
  }

  function sugerirPessoasEnquantoDigita() {
    clearTimeout(temporizadorSugestaoPessoa);
    numeroBuscaPessoa++;
    pessoaSelecionada = null;
    document.getElementById('areaPessoaNaoEncontrada').classList.add('oculto');
    const resultado = document.getElementById('resultadoPessoa');
    resultado.innerHTML = '';
    resultado.classList.add('oculto');
    const termo = document.getElementById('rgCpfBusca').value.trim();
    if (!termoBuscaPessoaValido(termo)) return;
    temporizadorSugestaoPessoa = setTimeout(() => buscarPessoa(true), 350);
  }

  function buscarPessoa(somenteSugestao = false) {
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
              `${categoriaPessoaIndividualAtual} não encontrado(a). Informe o nome para cadastrar automaticamente.`;
            document.getElementById('areaPessoaNaoEncontrada').classList.remove('oculto');
            document.getElementById('nomePessoaNaoEncontrada').focus();
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
    preencherDestinos();
    preencherProcedencias();

    const resultado = document.getElementById('resultadoPessoa');
    resultado.classList.remove('erro');
    resultado.innerHTML = `
      <div class="pessoa-selecionada">
        Selecionado: ${pessoa.Nome} — ${pessoa.RG_CPF}
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

  function registrarMovimentacao() {
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
      rgCpfPessoaNaoEncontrada: document.getElementById('rgCpfBusca').value.trim(),
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

    if (tipoRegistro === 'Pessoa não encontrada' && !dados.nomePessoaNaoEncontrada) {
      mostrarMensagem('Informe o nome completo da pessoa.', 'erro');
      return;
    }

    const areaComplemento = document.getElementById('areaComplementoProcedencia');
    const complementoVisivel = !areaComplemento.classList.contains('oculto');

    if (complementoVisivel && !dados.complementoProcedencia) {
      mostrarMensagem('Informe o complemento da procedência.', 'erro');
      return;
    }

    const botao = document.getElementById('btnRegistrarMovimentacao');
    botao.disabled = true;
    botao.textContent = 'Registrando...';

    google.script.run
      .withSuccessHandler((resposta) => {
        mostrarMensagem(resposta.mensagem || 'Movimentação registrada com sucesso.', 'sucesso');
        limparFormulario();
        carregarPessoasDentroGuarda(true);
        carregarMovimentacoesGuarda(true);

        if (aparelhoAssumiuComandanteAtual() || aparelhoAssumiuOficialAtual()) {
          carregarPainelComandante(true);
        }

        botao.disabled = false;
        botao.textContent = modoRegistroAtual === 'Viatura' ? 'Registrar Auto/VTR' : 'Registrar';
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao registrar movimentação: ' + erro.message, 'erro');

        botao.disabled = false;
        botao.textContent = modoRegistroAtual === 'Viatura' ? 'Registrar Auto/VTR' : 'Registrar';
      })
      .registrarMovimentacao(dados);
  }

  function limparFormulario() {
    pessoaSelecionada = null;
    condutorExternoAtivo = false;
    ocupantesViatura = [];

    document.getElementById('rgCpfBusca').value = '';
    document.getElementById('resultadoPessoa').innerHTML = '';
    document.getElementById('resultadoPessoa').classList.add('oculto');

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
    mensagem.classList.remove('oculto', 'sucesso', 'erro');
    mensagem.classList.add(tipo);

    setTimeout(() => {
      mensagem.classList.add('oculto');
    }, 3500);
  }

  function carregarGuardaAtivo() {
    google.script.run
      .withSuccessHandler((guarda) => {
        guardaAtual = guarda;
        atualizarTelaGuarda();
      })
      .withFailureHandler((erro) => {
        mostrarMensagem('Erro ao carregar guarda: ' + erro.message, 'erro');
      })
      .getGuardaAtivo();
  }

  function atualizarTelaGuarda() {
    const status = document.getElementById('statusGuarda');
    const areaAssumir = document.getElementById('areaAssumirGuarda');
    const btnEncerrar = document.getElementById('btnEncerrarGuarda');
    const btnTrocar = document.getElementById('btnTrocarGuarda');

    status.classList.remove('sem-guarda', 'com-guarda');

    if (guardaAtual) {
      const esteAparelhoAssumiu = aparelhoAssumiuGuardaAtual();

      status.classList.add('com-guarda');
      status.innerHTML = `
        Guarda atual:<br>
        ${guardaAtual.Nome_Guarda} — RG ${guardaAtual.RG_Guarda}
      `;

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

    atualizarPermissaoLancamento();
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
          email: resposta.email,
          encontradoNoEfetivo: resposta.encontradoNoEfetivo,
          militar: resposta.militar || null,
          ticketAssuncao: ''
        };

        salvarCodigoGuardaPendente(resposta.email);

        document.getElementById('areaCodigoGuarda').classList.remove('oculto');

        mostrarMensagem('Código enviado. Você pode abrir seu e-mail e voltar para informar o código.', 'sucesso');
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
            ${resposta.militar.Nome} — RG ${resposta.militar.RG}
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
            <strong>${g.Nome_Guarda} — RG ${g.RG_Guarda}</strong><br><br>
            Deseja encerrar a sessão anterior e assumir a Guarda neste celular?`,
            () => assumirGuarda(true),
            true
          );

          return;
        }

        mostrarMensagem(resposta.mensagem || 'Guarda assumida com sucesso.', 'sucesso');

        if (resposta && resposta.guarda) {
          guardaAtual = resposta.guarda;

          // Autoriza o celular pessoal usado pelo guarda durante este serviço.
          salvarGuardaLocal(resposta.guarda);

          atualizarTelaGuarda();
          carregarStatusToqueFogo(true);
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

        guardaAtual = null;
        limparGuardaLocal();

        limparAreaGuarda();
        atualizarTelaGuarda();

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

function carregarOficialDiaAtivo() {
  google.script.run
    .withSuccessHandler((oficial) => {
      oficialAtual = oficial;
      atualizarTelaOficial();
    })
    .withFailureHandler((erro) => mostrarMensagem('Erro ao carregar Oficial de Dia: ' + erro.message, 'erro'))
    .getOficialDiaAtivo();
}

function atualizarTelaOficial() {
  const status = document.getElementById('statusOficial');
  const btnEditar = document.getElementById('btnEditarOficialDia');
  const areaDesignar = document.getElementById('areaDesignarOficial');
  if (!status) return;

  if (oficialAtual) {
    status.classList.add('ativo');
    status.innerHTML = `Oficial de Dia informado pelo Comandante:<br>${oficialAtual.Nome_Oficial} — RG ${oficialAtual.RG_Oficial}`;
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
  google.script.run
    .withSuccessHandler((dados) => {
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
  const botao = document.getElementById('btnSalvarOficialDia');
  botao.disabled = true;
  botao.textContent = 'Salvando...';
  google.script.run
    .withSuccessHandler((resposta) => {
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
      dadosCodigoOficial = { email: resposta.email, militar: null };
      salvarCodigoOficialPendente(resposta.email);
      document.getElementById('areaCodigoOficial').classList.remove('oculto');
      document.getElementById('codigoOficial').focus();
      mostrarMensagem('Código enviado ao e-mail do oficial.', 'sucesso');
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
      oficialAcessoAtual = resposta.militar;
      localStorage.setItem('oficial_dia_sessao_token', resposta.sessaoToken || '');
      localStorage.setItem('oficial_acesso_militar', JSON.stringify(oficialAcessoAtual || {}));
      limparCodigoOficialPendente();
      atualizarTelaAcessoOficial();
      atualizarVisibilidadePainelComandante();
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
          `Já existe Oficial de Dia ativo:<br><br><strong>${atual.Nome_Oficial} — RG ${atual.RG_Oficial}</strong><br><br>Deseja substituir o Oficial de Dia anterior?`,
          () => assumirOficial(true), true
        );
        return;
      }
      oficialAtual = resposta.oficial;
      salvarOficialLocal(resposta.oficial);
      limparAreaOficial();
      atualizarTelaOficial();
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
    const perfis = ['perfilGuarda', 'cardToqueFogo', 'perfilComandante', 'perfilOficial']
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
    subtituloEquipe.textContent = 'Guarda, Toque de Fogo, Comandante e Oficial de Dia';
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
    card.classList.toggle('equipe-recolhida', recolher);
    botao.setAttribute('aria-expanded', String(!recolher));
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
  oficialAcessoAtual = oficial || null;
  localStorage.setItem('oficial_acesso_militar', JSON.stringify(oficialAcessoAtual || {}));
}

function limparOficialLocal() {
  localStorage.removeItem('oficial_dia_sessao_token');
  localStorage.removeItem('oficial_acesso_militar');
  ['oficial_dia_id_local', 'oficial_dia_nome_local', 'oficial_dia_rg_local'].forEach(chave => localStorage.removeItem(chave));
  oficialAcessoAtual = null;
}

function aparelhoAssumiuOficialAtual() {
  return !!localStorage.getItem('oficial_dia_sessao_token') && !!oficialAcessoAtual;
}

function restaurarAcessoOficial() {
  try {
    oficialAcessoAtual = JSON.parse(localStorage.getItem('oficial_acesso_militar') || 'null');
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
  mostrarMensagem('Acesso de oficial encerrado neste aparelho.', 'sucesso');
}

function carregarComandanteAtivo() {
  google.script.run
    .withSuccessHandler((comandante) => {
      comandanteAtual = comandante;
      atualizarTelaComandante();
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Erro ao carregar comandante: ' + erro.message, 'erro');
    })
    .getComandanteAtivo();
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

    status.classList.add('com-guarda');
    status.innerHTML = `
      Comandante atual:<br>
      ${comandanteAtual.Nome_Comandante} — RG ${comandanteAtual.RG_Comandante}
      ${esteAparelhoReconhecido && !esteAparelhoAssumiu
        ? '<br><small>Sessão expirada. Use Sair para receber um novo código no e-mail.</small>'
        : ''}
    `;

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

  if (!painel) return;

  if (aparelhoAssumiuComandanteAtual() || aparelhoAssumiuOficialAtual()) {
    painel.classList.remove('oculto');
    if (historico) historico.classList.remove('oculto');

    if (!painelComandanteCarregado) {
      carregarPainelComandante(true);
    }
  } else {
    painel.classList.add('oculto');
    if (historico) historico.classList.add('oculto');
    painelComandanteCarregado = false;
  }
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
  if (!aparelhoAssumiuComandanteAtual() && !aparelhoAssumiuOficialAtual()) return;
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

    const responsaveis = [
      registro.guarda ? 'Guarda: ' + registro.guarda : '',
      registro.comandante ? 'Comandante: ' + registro.comandante : '',
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
  if (!aparelhoAssumiuComandanteAtual() && !aparelhoAssumiuOficialAtual()) {
    atualizarVisibilidadePainelComandante();
    return;
  }

  const botao = document.getElementById('btnAtualizarPainelComandante');

  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Atualizando...';
  }

  google.script.run
    .withSuccessHandler((painel) => {
      renderizarPainelComandante(painel || {});
      painelComandanteCarregado = true;

      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }
    })
    .withFailureHandler((erro) => {
      if (!silencioso) {
        mostrarMensagem('Erro ao atualizar painel: ' + erro.message, 'erro');
      }

      if (!aparelhoAssumiuComandanteAtual() && aparelhoAssumiuOficialAtual()) {
        limparOficialLocal();
        atualizarTelaAcessoOficial();
        atualizarVisibilidadePainelComandante();
      }

      if (botao) {
        botao.disabled = false;
        botao.textContent = 'Atualizar';
      }
    })
    .getPainelComandante();
}

function renderizarPainelComandante(painel) {
  const totais = painel.totais || {};

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

    const cabecalho = document.createElement('div');
    cabecalho.className = 'cabecalho-item-painel';

    const nome = document.createElement('strong');
    nome.textContent = pessoa.nome || 'Pessoa não identificada';

    const horario = document.createElement('span');
    horario.textContent = pessoa.dataHora || '';

    cabecalho.appendChild(nome);
    cabecalho.appendChild(horario);
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

    const cabecalho = document.createElement('div');
    cabecalho.className = 'cabecalho-item-painel';

    const nome = document.createElement('strong');
    nome.textContent = movimentacao.nome || 'Pessoa não identificada';

    const tipoHorario = document.createElement('span');
    tipoHorario.textContent = (movimentacao.tipoMovimentacao || '') + ' • ' + (movimentacao.dataHora || '');

    cabecalho.appendChild(nome);
    cabecalho.appendChild(tipoHorario);
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

  detalhes.textContent = partes.join(' • ') || 'Sem detalhes adicionais';
  return detalhes;
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
      '</strong>?<br><br>O registro ficará vinculado ao guarda atualmente logado.',
    () => registrarSaidaRapidaPessoaGuarda(pessoa.idMovimentacao, botao),
    true
  );
}

function registrarSaidaRapidaPessoaGuarda(idMovimentacaoEntrada, botao) {
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

      if (aparelhoAssumiuComandanteAtual() || aparelhoAssumiuOficialAtual()) {
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
        email: resposta.email,
        militar: resposta.militar || null,
        ticketAssuncao: ''
      };

      salvarCodigoComandantePendente(resposta.email);
      document.getElementById('areaCodigoComandante').classList.remove('oculto');
      mostrarMensagem('Código enviado ao e-mail cadastrado do comandante.', 'sucesso');
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
        ${resposta.militar.Nome} — RG ${resposta.militar.RG}
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
          <strong>${comandante.Nome_Comandante} — RG ${comandante.RG_Comandante}</strong><br><br>
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
        atualizarTelaComandante();
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
      emailEncerramentoComandante = resposta.email;
      expandirPerfilServico('perfilComandante', true);
      document.getElementById('areaCodigoEncerrarComandante').classList.remove('oculto');
      mostrarStatusAcaoComandante(
        `Código enviado para ${mascararEmailComandante(resposta.email)}. Informe-o abaixo para encerrar.`,
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

  if (!emailEncerramentoComandante || !codigo) {
    mostrarMensagem('Informe o código enviado ao comandante atual.', 'erro');
    return;
  }

  google.script.run
    .withSuccessHandler((resposta) => {
      mostrarMensagem(resposta.mensagem || 'Comandante da Guarda encerrado. Relatório aguardando as 08h.', 'sucesso');
      comandanteAtual = null;
      emailEncerramentoComandante = null;
      limparComandanteLocal();
      limparAreaComandante();
      atualizarTelaComandante();
    })
    .withFailureHandler((erro) => {
      mostrarMensagem('Erro ao encerrar comandante: ' + erro.message, 'erro');
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
  localStorage.setItem('comandante_nome_local', comandante.Nome_Comandante || '');
  localStorage.setItem('comandante_rg_local', comandante.RG_Comandante || '');
  localStorage.setItem('comandante_email_local', comandante.Email_Comandante || '');

  if (comandante.Sessao_Token) {
    localStorage.setItem('comandante_sessao_token', comandante.Sessao_Token);
  }
}

function limparComandanteLocal() {
  localStorage.removeItem('comandante_id_local');
  localStorage.removeItem('comandante_nome_local');
  localStorage.removeItem('comandante_rg_local');
  localStorage.removeItem('comandante_email_local');
  localStorage.removeItem('comandante_sessao_token');
}

function aparelhoAssumiuComandanteAtual() {
  if (!comandanteAtual || !comandanteAtual.ID_ComandanteGuarda) return false;

  const idLocal = localStorage.getItem('comandante_id_local');
  const tokenLocal = localStorage.getItem('comandante_sessao_token');

  return !!(
    idLocal &&
    idLocal === comandanteAtual.ID_ComandanteGuarda &&
    comandanteAtual.Sessao_Valida !== false &&
    (tokenLocal || typeof URL_API === 'undefined')
  );
}

function aparelhoReconheceComandanteAtual() {
  if (!comandanteAtual || !comandanteAtual.ID_ComandanteGuarda) return false;
  return localStorage.getItem('comandante_id_local') === comandanteAtual.ID_ComandanteGuarda;
}


let acaoConfirmadaModal = null;

function abrirModalConfirmacao(titulo, texto, callback, modoPerigo = false) {
  document.getElementById('modalTitulo').textContent = titulo;
  document.getElementById('modalTexto').innerHTML = texto;

  const botaoConfirmar = document.getElementById('btnModalConfirmar');
  botaoConfirmar.classList.toggle('perigo', modoPerigo);
  botaoConfirmar.onclick = () => {
    fecharModalConfirmacao();

    if (typeof callback === 'function') {
      callback();
    }
  };

  document.getElementById('modalConfirmacao').classList.remove('oculto');
}

function fecharModalConfirmacao() {
  document.getElementById('modalConfirmacao').classList.add('oculto');
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
      carregarStatusToqueFogo(true);
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
  localStorage.setItem('guarda_nome_local', guarda.Nome_Guarda || '');
  localStorage.setItem('guarda_rg_local', guarda.RG_Guarda || '');
  localStorage.setItem('guarda_email_local', guarda.Email_Guarda || '');
  localStorage.setItem(
    'guarda_sessao_token',
    guarda.Sessao_Token || (typeof URL_API === 'undefined' ? 'apps-script-local' : '')
  );
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
  return localStorage.getItem('consulta_efetivo_sessao_token') || '';
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
      localStorage.setItem('consulta_efetivo_militar', JSON.stringify(consultaEfetivoAtual || {}));
      atualizarTelaConsultaEfetivo();
      carregarMovimentacoesConsultaEfetivo();
      mostrarMensagem('E-mail validado. Consulta das últimas 48 horas liberada.', 'sucesso');
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
  if (obterSessaoConsultaEfetivo()) carregarMovimentacoesConsultaEfetivo(true);
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
    nome.textContent = (consultaEfetivoAtual.Nome || 'Militar do 1º GBM') + ' • somente leitura';
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
  localStorage.removeItem('consulta_efetivo_militar');
  const codigo = document.getElementById('codigoConsultaEfetivo');
  if (codigo) codigo.value = '';
  atualizarTelaConsultaEfetivo();
  if (exibirMensagem) mostrarMensagem('Consulta encerrada neste aparelho.', 'sucesso');
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
}

function aparelhoAssumiuGuardaAtual() {
  if (!guardaAtual || !guardaAtual.ID_GuardaServico) {
    return false;
  }

  const idLocal = localStorage.getItem('guarda_id_local');
  const tokenLocal = localStorage.getItem('guarda_sessao_token');
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

function carregarStatusToqueFogo(silencioso = false) {
  google.script.run
    .withSuccessHandler((status) => {
      statusToqueFogoAtual = status || null;
      atualizarTelaToqueFogo();
    })
    .withFailureHandler((erro) => {
      if (!silencioso) mostrarMensagem('Erro ao carregar Toque de Fogo: ' + erro.message, 'erro');
    })
    .getStatusToqueFogo();
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

function atualizarTelaToqueFogo() {
  const status = statusToqueFogoAtual || {};
  const periodo = status.periodo || {};
  const toque = status.toque || null;
  const cobertura = status.cobertura || null;
  const statusEl = document.getElementById('statusToqueFogo');
  const periodoEl = document.getElementById('periodoToqueFogo');
  const areaAssumir = document.getElementById('areaAssumirToqueFogo');
  const btnTrocar = document.getElementById('btnTrocarToqueFogo');
  const coberturaEl = document.getElementById('statusCoberturaToque');
  const btnAssumirHora = document.getElementById('btnAssumirHoraToque');
  const btnRetomar = document.getElementById('btnRetomarPosto');

  periodoEl.textContent = (periodo.nome || 'Período atual') + ' • ' + (periodo.faixa || '');
  statusEl.classList.remove('sem-guarda', 'com-guarda');

  if (toque) {
    statusEl.classList.add('com-guarda');
    statusEl.innerHTML = 'Toque de Fogo atual:<br>' + escaparHtml(toque.Nome_Toque) +
      ' — RG ' + escaparHtml(toque.RG_Toque);
    areaAssumir.classList.toggle('oculto', !loginToqueFogoAberto);
    btnTrocar.classList.toggle('oculto', aparelhoAssumiuToqueAtual());
    btnTrocar.textContent = 'Assumir / Trocar';
  } else {
    statusEl.classList.add('sem-guarda');
    statusEl.textContent = 'Nenhum Toque de Fogo assumiu o período ' + (periodo.faixa || 'atual') + '.';
    areaAssumir.classList.toggle('oculto', !loginToqueFogoAberto);
    btnTrocar.classList.remove('oculto');
    btnTrocar.textContent = 'Entrar';
    limparToqueFogoLocal();
  }

  if (cobertura) {
    coberturaEl.classList.remove('oculto');
    coberturaEl.innerHTML = '<strong>Cobertura ativa</strong><br>' +
      escaparHtml(cobertura.Nome_Toque) + ' está no posto por ' +
      escaparHtml(cobertura.Nome_Guarda_Titular) + '.<br>' +
      'Início: ' + escaparHtml(cobertura.DataHora_Inicio || '-');
  } else {
    coberturaEl.classList.add('oculto');
    coberturaEl.innerHTML = '';
  }

  const titularPodeRetomar = !!(
    cobertura && guardaAtual && aparelhoAssumiuGuardaAtual() &&
    cobertura.ID_GuardaServico_Titular === guardaAtual.ID_GuardaServico
  );
  btnRetomar.classList.toggle('oculto', !titularPodeRetomar);

  const toquePodeAssumirHora = !!(
    guardaAtual && toque && !cobertura && aparelhoAssumiuToqueAtual()
  );
  btnAssumirHora.classList.toggle('oculto', !toquePodeAssumirHora);
  atualizarPermissaoLancamento();
}

function mostrarAreaTrocaToqueFogo() {
  loginToqueFogoAberto = true;
  expandirPerfilServico('cardToqueFogo', true);
  document.getElementById('areaAssumirToqueFogo').classList.remove('oculto');
  mostrarMensagem('Valide o e-mail do militar que assumirá o Toque de Fogo neste período.', 'sucesso');
}

function enviarCodigoToqueFogo() {
  const email = document.getElementById('emailToqueFogo').value.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    mostrarMensagem('Informe um e-mail válido.', 'erro');
    return;
  }
  google.script.run
    .withSuccessHandler((resposta) => {
      dadosCodigoToqueFogo = {
        email: resposta.email,
        encontradoNoEfetivo: resposta.encontradoNoEfetivo,
        militar: resposta.militar || null,
        ticketAssuncao: ''
      };
      document.getElementById('areaCodigoToqueFogo').classList.remove('oculto');
      mostrarMensagem('Código enviado para o e-mail do Toque de Fogo.', 'sucesso');
    })
    .withFailureHandler((erro) => mostrarMensagem('Erro ao enviar código: ' + erro.message, 'erro'))
    .enviarCodigoAssumirToqueFogo(email);
}

function validarCodigoToqueFogo() {
  const email = document.getElementById('emailToqueFogo').value.trim().toLowerCase();
  const codigo = document.getElementById('codigoToqueFogo').value.trim();
  if (!email || !codigo) {
    mostrarMensagem('Informe o e-mail e o código.', 'erro');
    return;
  }
  google.script.run
    .withSuccessHandler((resposta) => {
      dadosCodigoToqueFogo = {
        email: resposta.email,
        encontradoNoEfetivo: resposta.encontradoNoEfetivo,
        militar: resposta.militar || null,
        ticketAssuncao: resposta.ticketAssuncao || ''
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
      mostrarMensagem('Código validado com sucesso.', 'sucesso');
    })
    .withFailureHandler((erro) => mostrarMensagem('Erro ao validar código: ' + erro.message, 'erro'))
    .validarCodigoAssumirToqueFogo(email, codigo);
}

function assumirToqueFogo(encerrarAnterior = false) {
  if (!dadosCodigoToqueFogo) {
    mostrarMensagem('Valide o e-mail antes de assumir o Toque de Fogo.', 'erro');
    return;
  }
  const botao = document.getElementById('btnAssumirToqueFogo');
  botao.disabled = true;
  botao.textContent = 'Assumindo...';
  const dados = {
    email: dadosCodigoToqueFogo.email,
    origemIdentificacao: dadosCodigoToqueFogo.encontradoNoEfetivo ? 'Efetivo' : 'Manual',
    militar: dadosCodigoToqueFogo.militar,
    rgManual: document.getElementById('rgToqueFogoManual').value.trim(),
    nomeManual: document.getElementById('nomeToqueFogoManual').value.trim(),
    ticketAssuncao: dadosCodigoToqueFogo.ticketAssuncao || '',
    encerrarAnterior: encerrarAnterior
  };
  google.script.run
    .withSuccessHandler((resposta) => {
      botao.disabled = false;
      botao.textContent = 'Assumir Toque de Fogo';
      if (resposta.requerConfirmacaoTroca && resposta.toqueAtivo) {
        abrirModalConfirmacao(
          'Toque de Fogo já assumido',
          'O período está assumido por <strong>' + escaparHtml(resposta.toqueAtivo.Nome_Toque) +
            '</strong>.<br><br>Deseja realizar a troca?',
          () => assumirToqueFogo(true),
          true
        );
        return;
      }
      if (resposta.toque) salvarToqueFogoLocal(resposta.toque);
      statusToqueFogoAtual = resposta.statusToque || statusToqueFogoAtual;
      limparAreaToqueFogo();
      carregarStatusToqueFogo(true);
      mostrarMensagem(resposta.mensagem || 'Toque de Fogo assumido.', 'sucesso');
    })
    .withFailureHandler((erro) => {
      botao.disabled = false;
      botao.textContent = 'Assumir Toque de Fogo';
      mostrarMensagem('Erro ao assumir Toque de Fogo: ' + erro.message, 'erro');
    })
    .assumirToqueFogoComEmailValidado(dados);
}

function limparAreaToqueFogo() {
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
}

function salvarToqueFogoLocal(toque) {
  if (!toque || !toque.ID_ToqueFogo) return;
  localStorage.setItem('toque_fogo_id_local', toque.ID_ToqueFogo);
  localStorage.setItem('toque_fogo_sessao_token', toque.Sessao_Token || 'apps-script-local');
}

function limparToqueFogoLocal() {
  localStorage.removeItem('toque_fogo_id_local');
  localStorage.removeItem('toque_fogo_sessao_token');
}

function aparelhoAssumiuToqueAtual() {
  const toque = statusToqueFogoAtual && statusToqueFogoAtual.toque;
  if (!toque || !toque.ID_ToqueFogo) return false;
  const idLocal = localStorage.getItem('toque_fogo_id_local');
  const token = localStorage.getItem('toque_fogo_sessao_token');
  const sessaoAceita = toque.Sessao_Valida === undefined || toque.Sessao_Valida === true;
  return !!(idLocal && token && idLocal === toque.ID_ToqueFogo && sessaoAceita);
}

function aparelhoPodeOperarGuardaAtual() {
  const cobertura = statusToqueFogoAtual && statusToqueFogoAtual.cobertura;
  return aparelhoAssumiuGuardaAtual() || !!(cobertura && aparelhoAssumiuToqueAtual());
}

function confirmarRetomadaPosto() {
  abrirModalConfirmacao(
    'Retomar posto',
    'Confirma que o militar da hora retornou e está retomando o posto da Guarda?',
    () => retomarPostoAposSOS()
  );
}

function confirmarAssuncaoHoraToque() {
  abrirModalConfirmacao(
    'Assumir hora',
    'Confirma que o Toque de Fogo está assumindo imediatamente o posto do militar da hora?',
    () => assumirHoraToqueFogo()
  );
}

function assumirHoraToqueFogo() {
  const botao = document.getElementById('btnAssumirHoraToque');
  botao.disabled = true;
  botao.textContent = 'Assumindo...';

  google.script.run
    .withSuccessHandler((resposta) => {
      botao.disabled = false;
      botao.textContent = 'Assumir hora';
      statusToqueFogoAtual = resposta.statusToque || null;
      atualizarTelaToqueFogo();
      mostrarMensagem(resposta.mensagem, 'sucesso');
    })
    .withFailureHandler((erro) => {
      botao.disabled = false;
      botao.textContent = 'Assumir hora';
      mostrarMensagem('Erro ao assumir a hora: ' + erro.message, 'erro');
    })
    .assumirHoraToqueFogo();
}

function retomarPostoAposSOS() {
  google.script.run
    .withSuccessHandler((resposta) => {
      statusToqueFogoAtual = resposta.statusToque || null;
      atualizarTelaToqueFogo();
      mostrarMensagem(resposta.mensagem, 'sucesso');
    })
    .withFailureHandler((erro) => mostrarMensagem('Erro ao retomar o posto: ' + erro.message, 'erro'))
    .retomarPostoAposSOS();
}

function atualizarPermissaoLancamento() {
  const cardMovimentacao = document.getElementById('cardMovimentacao');
  const aviso = document.getElementById('avisoSemPermissaoLancamento');

  if (!cardMovimentacao || !aviso) {
    return;
  }

  const podeLancar = guardaAtual && aparelhoPodeOperarGuardaAtual();

  atualizarVisibilidadePessoasDentroGuarda();
  atualizarVisibilidadeMovimentacoesGuarda();
  atualizarVisibilidadeGuarnicoesServico();

  if (podeLancar) {
    cardMovimentacao.classList.remove('oculto');
    aviso.classList.add('oculto');
  } else {
    cardMovimentacao.classList.add('oculto');

    if (guardaAtual) {
      aviso.classList.remove('oculto');
    } else {
      aviso.classList.add('oculto');
    }
  }
}
