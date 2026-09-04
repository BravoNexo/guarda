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
      return { sessaoToken: sessaoOficialToken };
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
    'getStatusToqueFogo',
    'getPainelComandante',
    'consultarHistoricoMovimentacoes',
    'getPessoasDentroGuarda',
    'getMovimentacoesRecentesGuarda',
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
  let emailEncerramentoOficial = null;
  let pessoasDentroGuardaCarregadas = false;
  let movimentacoesGuardaCarregadas = false;
  let statusToqueFogoAtual = null;
  let dadosCodigoToqueFogo = null;
  let loginToqueFogoAberto = false;


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
    aplicarCodigoDoLink();
    inicializarFiltrosHistorico();
    inicializarSecoesPainelComandante();

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
    document.getE…23013 tokens truncated…e || '');
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
      if (resumo) resumo.textContent = total === 1 ? '1 registro no ciclo' : total + ' registros no ciclo';

      const ciclo = document.getElementById('cicloMovimentacoesGuarda');
      if (ciclo && resposta && resposta.cicloInicio && resposta.cicloFim) {
        ciclo.textContent = 'Ciclo: ' + resposta.cicloInicio + ' até ' + resposta.cicloFim + '. Exibindo os 30 registros mais recentes.';
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

