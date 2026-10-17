import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { HandPalm, Palette, Prohibit, ArrowsLeftRight, Cards, ArrowsClockwise, ArrowsCounterClockwise, Gear, SpeakerHigh, SpeakerSlash, MusicNote, BookBookmark, DeviceMobile, Translate } from '@phosphor-icons/react';

import musicaTema from './assets/tema.mp3';
import somCarta from './assets/carta.mp3';
import somAlarme from './assets/alarme.mp3';
import somVitoria from './assets/vitoria.mp3'; 
import livePixQRCode from './assets/livepix.png';

const socket = io('https://kaos-backend-83du.onrender.com');

// === DICIONÁRIO DE IDIOMAS ===
const dic = {
  pt: {
    suaVez: "A SUA VEZ!", vezDe: "VEZ DE", aguarde: "Aguarde...", comprar: "COMPRAR",
    jogar: "JOGAR", cartas: "CARTAS", aceitarPunicao: "ACEITAR PUNIÇÃO", passarVez: "PASSAR A VEZ",
    regraZero: "Regra do Zero! O que deseja fazer?", nada: "NADA (Passar)", rodarTodas: "RODAR TODAS AS MÃOS",
    ouTrocar: "Ou trocar com:", escolhaCor: "Escolha a nova cor:", bataMesa: "BATA NA MESA!",
    seuAvatar: "O seu Avatar (Clique para mudar)", seuNome: "Seu Nome", criarSala: "Criar Nova Sala",
    ou: "OU", codigo: "Código...", entrar: "Entrar", apoie: "Pague-me um Cafezinho!",
    ajude: "Ajude a manter o KAOS online e sem anúncios.", doar: "Doar via LivePix", codigoSala: "Código da Sala:",
    jogadores: "Jogadores", voce: "(Você)", host: "- Host", iniciarPartida: "INICIAR PARTIDA",
    aguardandoHost: "A aguardar que o anfitrião inicie...", sairSala: "SAIR DA SALA", regrasJogo: "Regras do Jogo",
    config: "Configurações", musica: "Música de Fundo", efeitos: "Efeitos Sonoros", fechar: "Fechar",
    vencedor: "VENCEDOR!", acabouCartas: "acabou com as cartas!", voltarLobby: "Voltar para o Lobby",
    vitorias: "Vitórias", idioma: "Idioma / Language"
  },
  en: {
    suaVez: "YOUR TURN!", vezDe: "TURN:", aguarde: "Wait...", comprar: "DRAW",
    jogar: "PLAY", cartas: "CARDS", aceitarPunicao: "ACCEPT PENALTY", passarVez: "PASS TURN",
    regraZero: "Rule of Zero! What to do?", nada: "NOTHING (Pass)", rodarTodas: "ROTATE ALL HANDS",
    ouTrocar: "Or swap with:", escolhaCor: "Choose new color:", bataMesa: "SLAP THE TABLE!",
    seuAvatar: "Your Avatar (Click to change)", seuNome: "Your Name", criarSala: "Create New Room",
    ou: "OR", codigo: "Room Code...", entrar: "Join", apoie: "Buy me a Coffee!",
    ajude: "Help keep KAOS online and ad-free.", doar: "Donate via LivePix", codigoSala: "Room Code:",
    jogadores: "Players", voce: "(You)", host: "- Host", iniciarPartida: "START GAME",
    aguardandoHost: "Waiting for host to start...", sairSala: "LEAVE ROOM", regrasJogo: "Game Rules",
    config: "Settings", musica: "Background Music", efeitos: "Sound Effects", fechar: "Close",
    vencedor: "WINNER!", acabouCartas: "finished their cards!", voltarLobby: "Back to Lobby",
    vitorias: "Wins", idioma: "Language / Idioma"
  }
};

const getCorCss = (cor) => {
  switch(cor) {
    case 'vermelho': return '#ff4757';
    case 'azul': return '#1e90ff';
    case 'verde': return '#2ed573';
    case 'amarelo': return '#ffa502';
    case 'preto': return '#2f3542';
    default: return '#ffffff';
  }
};

const renderValorCarta = (valor) => {
  if (valor === 'coringa') return <Palette size="1em" weight="fill" />;
  if (valor === 'bloqueio') return <Prohibit size="1em" weight="bold" />;
  if (valor === 'inverter') return <ArrowsLeftRight size="1em" weight="bold" />;
  return valor;
};

const gerarSeedAleatoria = () => Math.random().toString(36).substring(7);

const getPosicaoOponente = (index, totalOponentes) => {
  if (totalOponentes === 1) return { top: '8%', left: '50%' }; 
  if (totalOponentes === 2) return index === 0 ? { top: '15%', left: '10%' } : { top: '15%', left: '90%' };
  if (totalOponentes === 3) return index === 0 ? { top: '40%', left: '0%' } : index === 1 ? { top: '10%', left: '50%' } : { top: '40%', left: '100%' };
  if (totalOponentes === 4) return index === 0 ? { top: '40%', left: '0%' } : index === 1 ? { top: '12%', left: '30%' } : index === 2 ? { top: '12%', left: '70%' } : { top: '40%', left: '100%' };
  return index === 0 ? { top: '50%', left: '0%' } : index === 1 ? { top: '15%', left: '15%' } : index === 2 ? { top: '10%', left: '50%' } : index === 3 ? { top: '15%', left: '85%' } : { top: '50%', left: '100%' };
};

function App() {
  const [idioma, setIdioma] = useState('pt');
  const t = dic[idioma];

  const [nome, setNome] = useState('');
  const [meuAvatarSeed, setMeuAvatarSeed] = useState(gerarSeedAleatoria());
  const [codigoSalaInput, setCodigoSalaInput] = useState('');
  const [minhaSala, setMinhaSala] = useState(null);
  
  const [jogadores, setJogadores] = useState([]);
  const [infoJogadores, setInfoJogadores] = useState([]); 
  
  const [erro, setErro] = useState('');
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [minhaMao, setMinhaMao] = useState([]);
  const [cartaMesa, setCartaMesa] = useState(null);
  const [turnoAtual, setTurnoAtual] = useState('');
  const [sentido, setSentido] = useState(1); 
  const [jaComprou, setJaComprou] = useState(false);
  const [comprasAcumuladas, setComprasAcumuladas] = useState(0);
  const [cartasSelecionadas, setCartasSelecionadas] = useState([]);
  
  const [eventoNoveAtivo, setEventoNoveAtivo] = useState(false);
  const [euJaBati, setEuJaBati] = useState(false);
  const [escolhendoCorPara, setEscolhendoCorPara] = useState(null);
  const [escolhendoAlvoZero, setEscolhendoAlvoZero] = useState(null);
  const [alvoSelecionado, setAlvoSelecionado] = useState(null);
  const [vencedor, setVencedor] = useState(null);

  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalRegrasAberto, setModalRegrasAberto] = useState(false); 
  const [musicaAtiva, setMusicaAtiva] = useState(true);
  const [volumeMusica, setVolumeMusica] = useState(0.4);
  const [efeitosAtivos, setEfeitosAtivos] = useState(true);
  const [volumeEfeitos, setVolumeEfeitos] = useState(0.7);

  const audioMusicaRef = useRef(null);
  const audioEfeitoRef = useRef(null);
  const audioAlarmeRef = useRef(null);
  const audioVitoriaRef = useRef(null); 

  // === LÓGICA ATUALIZADA DE MÚSICA (FUNDO VS VITÓRIA) ===
  useEffect(() => {
    if (vencedor) {
      if (audioMusicaRef.current) audioMusicaRef.current.pause(); // Pára a música de fundo
      if (audioVitoriaRef.current && efeitosAtivos) {
        audioVitoriaRef.current.volume = volumeEfeitos;
        audioVitoriaRef.current.currentTime = 0;
        audioVitoriaRef.current.play().catch(() => {});
      }
    } else {
      if (audioMusicaRef.current) {
        audioMusicaRef.current.volume = volumeMusica;
        if (musicaAtiva) {
          audioMusicaRef.current.play().catch(() => {}); 
        } else {
          audioMusicaRef.current.pause();
        }
      }
      if (audioVitoriaRef.current) audioVitoriaRef.current.pause(); // Pára a de vitória se recomeçar
    }
  }, [musicaAtiva, volumeMusica, vencedor, efeitosAtivos, volumeEfeitos]);

  const tocarEfeito = useCallback((tipo = 'carta') => {
    if (!efeitosAtivos) return;
    if (tipo === 'carta' && audioEfeitoRef.current) {
      audioEfeitoRef.current.volume = volumeEfeitos;
      audioEfeitoRef.current.currentTime = 0;
      audioEfeitoRef.current.play().catch(() => {});
    } else if (tipo === 'alarme' && audioAlarmeRef.current) {
      audioAlarmeRef.current.volume = volumeEfeitos;
      audioAlarmeRef.current.currentTime = 0;
      audioAlarmeRef.current.play().catch(() => {});
    }
  }, [efeitosAtivos, volumeEfeitos]);

  useEffect(() => {
    socket.on('sala_criada', (codigo) => { setMinhaSala(codigo); setJogadores([{ id: socket.id, nome: nome, avatar: meuAvatarSeed, vitorias: 0 }]); });
    socket.on('entrou_na_sala', (codigo) => { setMinhaSala(codigo); });
    socket.on('atualizar_jogadores', (lista) => { setJogadores(lista); setInfoJogadores(lista); });
    
    socket.on('partida_iniciada', (dados) => {
      setJogoIniciado(true); setMinhaMao(dados.minhaMao); setCartaMesa(dados.cartaMesa); 
      setTurnoAtual(dados.turnoAtual); setJaComprou(dados.comprouNestaRodada);
      setComprasAcumuladas(dados.comprasAcumuladas); setSentido(dados.sentido || 1);
      setInfoJogadores(dados.infoJogadores || []);
      setCartasSelecionadas([]); setVencedor(null); 
      tocarEfeito('carta');
    });
    
    socket.on('estado_atualizado', (dados) => {
      setMinhaMao(dados.minhaMao); setCartaMesa(dados.cartaMesa); 
      setTurnoAtual(dados.turnoAtual); setJaComprou(dados.comprouNestaRodada);
      setComprasAcumuladas(dados.comprasAcumuladas); setSentido(dados.sentido || 1);
      setInfoJogadores(dados.infoJogadores || []);
      setCartasSelecionadas([]); 
      tocarEfeito('carta');
    });

    socket.on('iniciar_evento_nove', () => { 
      setEventoNoveAtivo(true); 
      setEuJaBati(false); 
      tocarEfeito('alarme'); 
    });

    socket.on('fim_evento_nove', (dados) => { 
      setEventoNoveAtivo(false); 
      setErro(`Aviso: ${dados.perdedor} comprou ${dados.cartasCompradas} cartas no evento do 9!`); 
      setTimeout(() => setErro(''), 6000); 
    });

    socket.on('fim_de_jogo', (nomeGanhador) => { 
      setVencedor(nomeGanhador); 
    });
    
    socket.on('erro', (mensagem) => { setErro(mensagem); setTimeout(() => setErro(''), 4000); });

    socket.on('disconnect', () => {
      setErro('Aviso: Conexão perdida! O ecrã será atualizado em instantes...');
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    });

    return () => {
      socket.off('sala_criada'); socket.off('entrou_na_sala'); socket.off('atualizar_jogadores');
      socket.off('partida_iniciada'); socket.off('estado_atualizado'); socket.off('erro');
      socket.off('iniciar_evento_nove'); socket.off('fim_evento_nove'); socket.off('fim_de_jogo');
      socket.off('disconnect');
    };
  }, [nome, meuAvatarSeed, tocarEfeito]);

  const roletarAvatar = () => { setMeuAvatarSeed(gerarSeedAleatoria()); };
  
  const criarSala = () => { if (!nome) return setErro('Digite o seu nome!'); socket.emit('criar_sala', { nomeJogador: nome, avatar: meuAvatarSeed }); };
  const entrarSala = () => { if (!nome || !codigoSalaInput) return setErro('Preencha os campos!'); socket.emit('entrar_sala', { codigoSala: codigoSalaInput, nomeJogador: nome, avatar: meuAvatarSeed }); };
  const iniciarPartida = () => { socket.emit('iniciar_partida', minhaSala); };
  const comprarCarta = () => { if (turnoAtual === socket.id) socket.emit('comprar_carta', minhaSala); };
  const passarVez = () => { if (turnoAtual === socket.id) socket.emit('passar_vez', minhaSala); };
  const baterNaMesa = () => { if (euJaBati) return; setEuJaBati(true); socket.emit('bater_mesa', minhaSala); };

  const sairDaSala = () => {
    socket.emit('sair_sala', minhaSala);
    setMinhaSala(null);
    setJogadores([]);
    setInfoJogadores([]);
    setJogoIniciado(false);
    setVencedor(null);
  };

  const toggleSelecao = (cartaClicada) => {
    if (turnoAtual !== socket.id) return;
    tocarEfeito('carta');
    setCartasSelecionadas((ant) => ant.find(c => c.id === cartaClicada.id) ? ant.filter(c => c.id !== cartaClicada.id) : [...ant, cartaClicada]);
  };

  const tentarJogarSelecionadas = () => {
    if (cartasSelecionadas.length === 0) return;
    const ultimaCarta = cartasSelecionadas[cartasSelecionadas.length - 1];
    const temZero = cartasSelecionadas.some(c => c.valor === '0');
    
    if (temZero) return setEscolhendoAlvoZero(cartasSelecionadas); 
    if (ultimaCarta.cor === 'preto') return setEscolhendoCorPara(cartasSelecionadas); 
    socket.emit('jogar_cartas', { codigoSala: minhaSala, cartas: cartasSelecionadas });
  };

  const confirmarAlvoZero = (idAlvo) => {
    const ultimaCarta = escolhendoAlvoZero[escolhendoAlvoZero.length - 1];
    if (ultimaCarta.cor === 'preto') { setAlvoSelecionado(idAlvo); setEscolhendoCorPara(escolhendoAlvoZero); } 
    else { socket.emit('jogar_cartas', { codigoSala: minhaSala, cartas: escolhendoAlvoZero, alvoTroca: idAlvo }); }
    setEscolhendoAlvoZero(null);
  };

  const confirmarCorCoringa = (corEscolhida) => {
    socket.emit('jogar_cartas', { codigoSala: minhaSala, cartas: escolhendoCorPara, novaCor: corEscolhida, alvoTroca: alvoSelecionado });
    setEscolhendoCorPara(null); setAlvoSelecionado(null);
  };

  const oponentes = infoJogadores.filter(j => j.id !== socket.id);
  const jogadorDaVez = infoJogadores.find(j => j.id === turnoAtual);

  return (
    <div>
      <div className="aviso-rotacao">
        <DeviceMobile size={100} color="#f1c40f" />
        <h1 style={{ fontFamily: 'Fredoka', marginTop: '20px' }}>{idioma === 'pt' ? 'Rode o seu telemóvel!' : 'Rotate your phone!'}</h1>
        <p style={{ fontSize: '18px', maxWidth: '300px', lineHeight: '1.5' }}>
          {idioma === 'pt' ? 'O KAOS foi desenhado para ser jogado na horizontal.' : 'KAOS was designed to be played in landscape mode.'}
        </p>
      </div>

      <audio ref={audioMusicaRef} src={musicaTema} loop />
      <audio ref={audioEfeitoRef} src={somCarta} />
      <audio ref={audioAlarmeRef} src={somAlarme} />
      <audio ref={audioVitoriaRef} src={somVitoria} />

      <div className="ocultar-no-retrato">
        
        {erro && <div className="notificacao-topo-esquerdo">{erro}</div>}

        {vencedor ? (
          <div className="container" style={{ marginTop: '100px' }}>
            <h1 className="logo-kaos"><div className="carta-k-logo">K</div>AOS</h1>
            <h1 style={{ fontSize: '50px', color: '#f1c40f' }}>🏆 {t.vencedor} 🏆</h1>
            <h2 style={{ fontSize: '40px' }}>{vencedor} {t.acabouCartas}</h2>
            <button className="btn btn-azul" onClick={() => { setVencedor(null); setJogoIniciado(false); }}>{t.voltarLobby}</button>
          </div>
        ) : jogoIniciado ? (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            
            <div className={`status-turno ${turnoAtual === socket.id ? 'minha-vez' : ''}`}>
              {turnoAtual === socket.id ? t.suaVez : jogadorDaVez ? `${t.vezDe} ${jogadorDaVez.nome.toUpperCase()}` : t.aguarde}
            </div>

            <div className="mesa-redonda">
              {oponentes.map((op, index) => {
                const ehVezDele = turnoAtual === op.id;
                return (
                  <div key={op.id} className="oponente-container" style={getPosicaoOponente(index, oponentes.length)}>
                    <div className="oponente-avatar" style={{ borderColor: ehVezDele ? '#2ecc71' : '#000', boxShadow: ehVezDele ? '0 0 15px #2ecc71' : '4px 4px 0 #000' }}>
                      <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${op.avatar}`} alt="Avatar" width="100%" height="100%" />
                    </div>
                    
                    <div className="cartas-oponente">
                      {Array.from({ length: Math.min(op.qtdCartas, 15) }).map((_, i) => (
                        <div key={i} className="carta-verso">K</div>
                      ))}
                      {op.qtdCartas > 15 && <span style={{color: 'white', fontWeight: 'bold', marginLeft: '5px'}}>+{op.qtdCartas - 15}</span>}
                    </div>

                    <div className="oponente-nome" style={{ color: ehVezDele ? '#2ecc71' : '#000' }}>{op.nome}</div>
                  </div>
                );
              })}

              <div className="centro-mesa">
                <div className="coluna-baralho">
                  <div className="icone-baralho" onClick={comprarCarta} style={{ cursor: turnoAtual === socket.id ? 'pointer' : 'default' }}>
                    <Cards size={48} weight="duotone" color="#ecf0f1" />
                  </div>
                  {turnoAtual === socket.id && !jaComprou && comprasAcumuladas === 0 && cartasSelecionadas.length === 0 && (
                    <button className="btn btn-roxo btn-pequeno" onClick={comprarCarta} style={{margin: 0}}>{t.comprar}</button>
                  )}
                </div>

                <div key={cartaMesa.id} className="carta carta-mesa animate-drop" style={{ backgroundColor: getCorCss(cartaMesa.cor), color: cartaMesa.cor === 'amarelo' ? '#000' : '#fff' }}>
                  {renderValorCarta(cartaMesa.valor)}
                </div>

                <div className="direcao-indicador">
                  {sentido === 1 ? <ArrowsClockwise size={50} className="spin-horario" /> : <ArrowsCounterClockwise size={50} className="spin-anti" />}
                </div>
              </div>
            </div>

            {escolhendoAlvoZero && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2 style={{margin: '0 0 15px 0'}}>{t.regraZero}</h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button className="btn btn-cinza" onClick={() => confirmarAlvoZero('ninguem')}>{t.nada}</button>
                    <button className="btn btn-verde" onClick={() => confirmarAlvoZero('todos')}>{t.rodarTodas}</button>
                  </div>
                  <h3 style={{margin: '15px 0 10px 0'}}>{t.ouTrocar}</h3>
                  <div className="grid-opcoes-zero">
                    {oponentes.map(j => (
                      <button key={j.id} className="btn btn-azul" onClick={() => confirmarAlvoZero(j.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${j.avatar}`} width="30" height="30" style={{ borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #000' }} />
                        {j.nome} ({j.qtdCartas})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {escolhendoCorPara && (
              <div className="modal-overlay"><div className="modal-content"><h2>{t.escolhaCor}</h2><div style={{ display: 'flex', gap: '15px' }}>{['vermelho', 'azul', 'verde', 'amarelo'].map(cor => (<button key={cor} onClick={() => confirmarCorCoringa(cor)} style={{ width: '70px', height: '70px', backgroundColor: getCorCss(cor), border: '4px solid #000', borderRadius: '12px', cursor: 'pointer', boxShadow: '4px 4px 0 #000' }}></button>))}</div></div></div>
            )}

            {eventoNoveAtivo && (
              <div className="modal-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}><div style={{ textAlign: 'center' }}><h1 style={{ color: '#ff4757', fontSize: '60px', fontFamily: 'Fredoka', WebkitTextStroke: '3px #000' }}>{t.bataMesa}</h1><button onClick={baterNaMesa} disabled={euJaBati} style={{ width: '250px', height: '250px', borderRadius: '50%', border: '10px solid #000', backgroundColor: euJaBati ? '#2ed573' : '#ff4757', boxShadow: '8px 8px 0 #000', cursor: euJaBati ? 'default' : 'pointer', transition: 'all 0.1s', transform: euJaBati ? 'scale(0.9)' : 'scale(1.1)' }}><HandPalm weight="fill" size={140} color="#000" /></button></div></div>
            )}

            <button className="btn-uno" onClick={() => socket.emit('apertar_uno', minhaSala)}>KAOS!</button>

            <div className="mao-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', padding: '0 10px 10px 10px', maxWidth: '1000px', margin: '15px auto' }}>
              {minhaMao.map((carta) => {
                const taSelecionada = cartasSelecionadas.find(c => c.id === carta.id);
                let classes = "carta";
                if (taSelecionada) classes += " selecionada";
                if (turnoAtual !== socket.id) classes += " desabilitada";

                return (
                  <div key={carta.id} onClick={() => toggleSelecao(carta)} className={classes} style={{ backgroundColor: getCorCss(carta.cor), color: carta.cor === 'amarelo' ? '#000' : '#fff' }}>
                    {renderValorCarta(carta.valor)}
                  </div>
                );
              })}
            </div>

            <div className="painel-acoes" style={{ marginBottom: '20px' }}>
              {turnoAtual === socket.id && cartasSelecionadas.length > 0 && (
                <button className="btn btn-verde" onClick={tentarJogarSelecionadas}>{t.jogar} ({cartasSelecionadas.length}) {t.cartas}</button>
              )}
              {turnoAtual === socket.id && comprasAcumuladas > 0 && (
                <button className="btn btn-vermelho" onClick={comprarCarta}>{t.aceitarPunicao} (+{comprasAcumuladas})</button>
              )}
              {turnoAtual === socket.id && jaComprou && cartasSelecionadas.length === 0 && comprasAcumuladas === 0 && (
                <button className="btn btn-cinza" onClick={passarVez}>{t.passarVez}</button>
              )}
            </div>

          </div>
        ) : (
          <div className="container" style={{ position: 'relative' }}>
            
            <button 
              onClick={() => setModalRegrasAberto(true)} 
              style={{ position: 'absolute', top: '20px', left: '20px', background: '#3498db', border: '3px solid #000', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '3px 3px 0 #000' }}
              title={t.regrasJogo}
            >
              <BookBookmark size={26} weight="bold" color="#fff" />
            </button>

            <button 
              onClick={() => setModalConfigAberto(true)} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1c40f', border: '3px solid #000', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '3px 3px 0 #000' }}
              title={t.config}
            >
              <Gear size={26} weight="bold" color="#000" />
            </button>

            <div className="logo-kaos"><div className="carta-k-logo">K</div>AOS</div>
            
            {!minhaSala ? (
              <>
                <div className="avatar-seletor-container">
                  <h3>{t.seuAvatar}</h3>
                  <div className="avatar-display" onClick={roletarAvatar}>
                    <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${meuAvatarSeed}`} alt="Avatar" width="100%" height="100%" />
                  </div>
                </div>
                <div>
                  <input type="text" placeholder={t.seuNome} maxLength={12} value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <button className="btn btn-verde" onClick={criarSala}>{t.criarSala}</button>
                  <h3 style={{ margin: '15px 0' }}>{t.ou}</h3>
                  <input type="text" placeholder={t.codigo} value={codigoSalaInput} onChange={(e) => setCodigoSalaInput(e.target.value)} style={{ width: '120px' }} />
                  <button className="btn btn-azul" onClick={entrarSala}>{t.entrar}</button>
                </div>

                <div style={{ marginTop: '40px', padding: '15px', border: '3px dashed #f1c40f', borderRadius: '15px', backgroundColor: '#fffdf0', maxWidth: '400px', margin: '40px auto 0 auto' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#f39c12' }}>{t.apoie}</h3>
                  <p style={{ fontSize: '14px', margin: '0 0 15px 0', fontWeight: 'bold' }}>{t.ajude}</p>
                  <img src={livePixQRCode} alt="QR Code LivePix" style={{ width: '120px', borderRadius: '10px', border: '3px solid #000', boxShadow: '2px 2px 0 #000' }} />
                  <br/>
                  <a href="https://livepix.gg/" target="_blank" rel="noreferrer" className="btn btn-roxo btn-pequeno" style={{ display: 'inline-block', marginTop: '15px', textDecoration: 'none' }}>
                    {t.doar}
                  </a>
                </div>
              </>
            ) : (
              <>
                <h2>{t.codigoSala} <span style={{fontSize: '40px', color: '#ff4757'}}>{minhaSala}</span></h2>
                <h3>{t.jogadores} ({jogadores.length}/6):</h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {jogadores.map((jogador, index) => (
                    <li key={index} style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${jogador.avatar}`} width="50" height="50" style={{ borderRadius: '50%', backgroundColor: '#ecf0f1', border: '3px solid #000' }} />
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2'}}>
                        <span>{jogador.nome} {jogador.id === socket.id ? t.voce : ''} {index === 0 && t.host}</span>
                        {/* === PLACAR DE VITÓRIAS NA SALA AQUI === */}
                        <span style={{fontSize: '16px', color: '#f39c12'}}>👑 {jogador.vitorias || 0} {t.vitorias}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {jogadores[0]?.id === socket.id ? (
                  <button className="btn btn-vermelho" onClick={iniciarPartida} style={{ marginTop: '20px', fontSize: '24px' }}>{t.iniciarPartida}</button>
                ) : (
                  <p style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '20px' }}>{t.aguardandoHost}</p>
                )}
                <br/>
                <button className="btn btn-cinza" onClick={sairDaSala} style={{ marginTop: '10px' }}>{t.sairSala}</button>
              </>
            )}

            {modalRegrasAberto && (
              <div className="modal-overlay" style={{ zIndex: 1200 }}>
                <div className="modal-content" style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', textAlign: 'left', padding: '25px' }}>
                  <h2 style={{ textAlign: 'center', marginTop: 0 }}>{t.regrasJogo}</h2>
                  {/* Substituí o texto pelo fechamento simples para poupar espaço. Opcionalmente adicione suas regras aqui de novo */}
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className="btn btn-vermelho" onClick={() => setModalRegrasAberto(false)} style={{ width: '100%' }}>{t.fechar}</button>
                  </div>
                </div>
              </div>
            )}

            {modalConfigAberto && (
              <div className="modal-overlay" style={{ zIndex: 1200 }}>
                <div className="modal-content" style={{ width: '320px' }}>
                  <h2>{t.config}</h2>
                  
                  {/* === SELETOR DE IDIOMA AQUI === */}
                  <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                      <Translate size={24} /> {t.idioma}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className={`btn btn-pequeno ${idioma === 'pt' ? 'btn-azul' : 'btn-cinza'}`} onClick={() => setIdioma('pt')}>Português</button>
                      <button className={`btn btn-pequeno ${idioma === 'en' ? 'btn-azul' : 'btn-cinza'}`} onClick={() => setIdioma('en')}>English</button>
                    </div>
                  </div>

                  <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                      <MusicNote size={24} /> {t.musica}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <button className="btn btn-pequeno" onClick={() => setMusicaAtiva(!musicaAtiva)} style={{ backgroundColor: musicaAtiva ? '#2ecc71' : '#e74c3c' }}>
                        {musicaAtiva ? <SpeakerHigh size={20}/> : <SpeakerSlash size={20}/>}
                      </button>
                      <input 
                        type="range" min="0" max="1" step="0.05" 
                        value={volumeMusica} 
                        onChange={(e) => setVolumeMusica(parseFloat(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer', margin: 0, padding: 0 }} 
                      />
                    </div>
                  </div>

                  <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                      <SpeakerHigh size={24} /> {t.efeitos}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <button className="btn btn-pequeno" onClick={() => setEfeitosAtivos(!efeitosAtivos)} style={{ backgroundColor: efeitosAtivos ? '#2ecc71' : '#e74c3c' }}>
                        {efeitosAtivos ? <SpeakerHigh size={20}/> : <SpeakerSlash size={20}/>}
                      </button>
                      <input 
                        type="range" min="0" max="1" step="0.05" 
                        value={volumeEfeitos} 
                        onChange={(e) => setVolumeEfeitos(parseFloat(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer', margin: 0, padding: 0 }} 
                      />
                    </div>
                  </div>

                  <button className="btn btn-azul" onClick={() => setModalConfigAberto(false)} style={{ marginTop: '10px', width: '100%' }}>
                    {t.fechar}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default App;