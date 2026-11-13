import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { dic } from './utils/dictionary';
import { gerarSeedAleatoria } from './utils/gameUtils';
import { DeviceMobile, Skull } from '@phosphor-icons/react';

import Lobby from './pages/Lobby';
import Table from './pages/Table';

import musicaTema from './assets/tema.mp3';
import musicaJogo from './assets/jogo.mp3'; 
import somCarta from './assets/carta.mp3';
import somAlarme from './assets/alarme.mp3';
import somVitoria from './assets/vitoria.mp3'; 

const socket = io('https://kaos-backend-83du.onrender.com');

function App() {
  const [idioma, setIdioma] = useState('pt');
  const t = dic[idioma];

  const [nome, setNome] = useState('');
  const [meuAvatarSeed, setMeuAvatarSeed] = useState(() => gerarSeedAleatoria());
  
  const [codigoSalaInput, setCodigoSalaInput] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sala') || '';
  });
  
  const [minhaSala, setMinhaSala] = useState(null);
  
  const [jogadores, setJogadores] = useState([]);
  const [infoJogadores, setInfoJogadores] = useState([]); 
  
  const [regrasSelecionadas, setRegrasSelecionadas] = useState('kaos'); 
  const [formatoSelecionado, setFormatoSelecionado] = useState('pvp'); 

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const [mostrandoSorteio, setMostrandoSorteio] = useState(false);
  const [jogadorSorteado, setJogadorSorteado] = useState(null);
  const [roletaIndex, setRoletaIndex] = useState(0);

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
  const [posicaoNove, setPosicaoNove] = useState({ top: '50%', left: '50%' }); 
  
  const [eventoAleatorioAtivo, setEventoAleatorioAtivo] = useState(null); 
  
  // NOVOS ESTADOS PARA O TEMPORIZADOR DO EVENTO (50s)
  const [tempoEventoRestante, setTempoEventoRestante] = useState(50);
  const [tempoRefEvento, setTempoRefEvento] = useState(() => Date.now());

  const [filaPassos, setFilaPassos] = useState([]);
  const [payloadJogada, setPayloadJogada] = useState(null);

  const [maoEspiadaPrevia, setMaoEspiadaPrevia] = useState(null);

  const [emotesAtivos, setEmotesAtivos] = useState({});
  const [menuEmoteAberto, setMenuEmoteAberto] = useState(false);

  const [vencedor, setVencedor] = useState(null);
  const [jogadaBossAtiva, setJogadaBossAtiva] = useState(1);

  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalRegrasAberto, setModalRegrasAberto] = useState(false); 
  const [musicaAtiva, setMusicaAtiva] = useState(true);
  const [volumeMusica, setVolumeMusica] = useState(0.4);
  const [efeitosAtivos, setEfeitosAtivos] = useState(true);
  const [volumeEfeitos, setVolumeEfeitos] = useState(0.7);

  const [tempoPartida, setTempoPartida] = useState(0);
  const [tempoTurnoRestante, setTempoTurnoRestante] = useState(25);
  const [tempoReferencia, setTempoReferencia] = useState(() => Date.now());

  const audioMusicaRef = useRef(null);
  const audioJogoRef = useRef(null); 
  const audioEfeitoRef = useRef(null);
  const audioAlarmeRef = useRef(null);
  const audioVitoriaRef = useRef(null); 

  useEffect(() => {
    let interval;
    if (jogoIniciado && !vencedor) {
      interval = setInterval(() => setTempoPartida(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [jogoIniciado, vencedor]);

  useEffect(() => {
    let interval;
    if (jogoIniciado && !vencedor && !eventoNoveAtivo && !eventoAleatorioAtivo) {
      interval = setInterval(() => {
        const passado = Math.floor((Date.now() - tempoReferencia) / 1000);
        setTempoTurnoRestante(Math.max(25 - passado, 0));

        if (regrasSelecionadas === 'kaos_aleatorio') {
          const passadoEvento = Math.floor((Date.now() - tempoRefEvento) / 1000);
          setTempoEventoRestante(Math.max(50 - passadoEvento, 0));
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [jogoIniciado, vencedor, eventoNoveAtivo, eventoAleatorioAtivo, tempoReferencia, tempoRefEvento, regrasSelecionadas]);

  useEffect(() => {
    if (audioMusicaRef.current) audioMusicaRef.current.pause();
    if (audioJogoRef.current) audioJogoRef.current.pause();
    if (audioVitoriaRef.current) audioVitoriaRef.current.pause();

    if (vencedor) {
      if (audioVitoriaRef.current && efeitosAtivos) {
        audioVitoriaRef.current.volume = volumeEfeitos;
        audioVitoriaRef.current.currentTime = 0;
        audioVitoriaRef.current.play().catch(() => {});
      }
    } else {
      const audioAtivo = jogoIniciado ? audioJogoRef.current : audioMusicaRef.current;
      
      if (audioAtivo) {
        audioAtivo.volume = volumeMusica;
        if (musicaAtiva) {
          audioAtivo.play().catch(() => {}); 
        }
      }
    }
  }, [musicaAtiva, volumeMusica, vencedor, jogoIniciado, efeitosAtivos, volumeEfeitos]);

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
    if (mostrandoSorteio && jogadorSorteado && jogadores.length > 0) {
      let tick = 0;
      const interval = setInterval(() => {
        setRoletaIndex(Math.floor(Math.random() * jogadores.length));
        tick++;
        if (tick > 25) { 
          clearInterval(interval);
          const finalIndex = jogadores.findIndex(j => j.id === jogadorSorteado);
          setRoletaIndex(finalIndex !== -1 ? finalIndex : 0);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [mostrandoSorteio, jogadorSorteado, jogadores]);

  useEffect(() => {
    socket.on('sala_criada', (codigo) => { 
      setMinhaSala(codigo); 
      setJogadores([{ id: socket.id, nome: nome, avatar: meuAvatarSeed, vitorias: 0 }]); 
      localStorage.setItem('kaos_sala_ativa', codigo); 
    });
    
    socket.on('entrou_na_sala', (codigo) => { 
      setMinhaSala(codigo); 
      localStorage.setItem('kaos_sala_ativa', codigo); 
    });
    
    socket.on('atualizar_jogadores', (lista) => { 
      setJogadores(lista); 
      setInfoJogadores(lista); 
    });
    
    socket.on('sorteando_primeiro_jogador', (idSorteado) => { 
      setJogadorSorteado(idSorteado); 
      setMostrandoSorteio(true); 
    });

    socket.on('partida_iniciada', (dados) => {
      setMostrandoSorteio(false); 
      setJogadorSorteado(null); 
      setJogoIniciado(true); 
      setMinhaMao(dados.minhaMao); 
      setCartaMesa(dados.cartaMesa); 
      setTurnoAtual(dados.turnoAtual); 
      setJaComprou(dados.comprouNestaRodada); 
      setComprasAcumuladas(dados.comprasAcumuladas); 
      setSentido(dados.sentido || 1);
      setInfoJogadores(dados.infoJogadores || []); 
      setJogadaBossAtiva(dados.jogadaBossAtiva || 1);
      setCartasSelecionadas([]); 
      setVencedor(null); 
      setTempoPartida(0);
      setEventoAleatorioAtivo(null);
      
      setTempoReferencia(Date.now()); 
      setTempoTurnoRestante(25); 
      setTempoRefEvento(Date.now());
      setTempoEventoRestante(50);

      tocarEfeito('carta');
    });
    
    socket.on('estado_atualizado', (dados) => {
      setMinhaMao(dados.minhaMao); 
      setCartaMesa(dados.cartaMesa); 
      setTurnoAtual(dados.turnoAtual); 
      setJaComprou(dados.comprouNestaRodada);
      setComprasAcumuladas(dados.comprasAcumuladas); 
      setSentido(dados.sentido || 1); 
      setInfoJogadores(dados.infoJogadores || []); 
      if (dados.jogadaBossAtiva) setJogadaBossAtiva(dados.jogadaBossAtiva);
      setCartasSelecionadas([]); 
      
      if (dados.resetarTempo) { 
        setTempoReferencia(Date.now()); 
        setTempoTurnoRestante(25); 
      }
      tocarEfeito('carta');
    });

    socket.on('evento_aleatorio_iniciado', (evento) => {
      setEventoAleatorioAtivo(evento);
      tocarEfeito('alarme');
    });
    
    socket.on('evento_aleatorio_concluido', () => {
      setEventoAleatorioAtivo(null);
      setTempoRefEvento(Date.now());
      setTempoEventoRestante(50);
    });

    socket.on('olhar_cartas_lado', (dados) => {
      setMaoEspiadaPrevia(dados); 
    });

    socket.on('mao_espiao_previa', (dados) => { setMaoEspiadaPrevia(dados); });

    socket.on('emote_recebido', ({ id, emote }) => {
      setEmotesAtivos(prev => ({ ...prev, [id]: emote }));
      setTimeout(() => {
        setEmotesAtivos(prev => {
          const next = {...prev};
          delete next[id];
          return next;
        });
      }, 2500);
    });

    socket.on('iniciar_evento_nove', () => { 
      setEventoNoveAtivo(true); setEuJaBati(false); 
      setPosicaoNove({ top: `${Math.floor(Math.random() * 50) + 25}%`, left: `${Math.floor(Math.random() * 70) + 15}%` }); 
      tocarEfeito('alarme'); 
    });

    socket.on('fim_evento_nove', (dados) => { 
      setEventoNoveAtivo(false); 
      setErro(`${dados.perdedor} comprou ${dados.cartasCompradas} cartas no evento do 9!`); 
      setTimeout(() => setErro(''), 6000); 
    });

    socket.on('fim_de_jogo', (nomeGanhador) => { setVencedor(nomeGanhador); });
    
    socket.on('voce_foi_removido', () => {
      setErro(idioma === 'pt' ? 'Você foi expulso da sala pelo anfitrião.' : 'You were kicked from the room.');
      setTimeout(() => setErro(''), 4000);
      
      socket.emit('sair_sala', minhaSala);
      setMinhaSala(null); setJogadores([]); setInfoJogadores([]);
      setJogoIniciado(false); setVencedor(null); setTempoPartida(0); setMostrandoSorteio(false);
      localStorage.removeItem('kaos_sala_ativa');
    });
    
    socket.on('erro', (mensagem) => { setErro(mensagem); setTimeout(() => setErro(''), 4000); });

    socket.on('disconnect', () => { 
      setErro('Aviso: Conexão perdida! O ecrã será atualizado em instantes...'); 
      setTimeout(() => window.location.reload(), 5000); 
    });

    return () => {
      socket.off('sala_criada'); socket.off('entrou_na_sala'); socket.off('atualizar_jogadores'); 
      socket.off('sorteando_primeiro_jogador'); socket.off('partida_iniciada'); socket.off('estado_atualizado'); 
      socket.off('mao_espiao_previa'); socket.off('emote_recebido'); socket.off('erro'); 
      socket.off('iniciar_evento_nove'); socket.off('fim_evento_nove'); socket.off('fim_de_jogo');
      socket.off('evento_aleatorio_iniciado'); socket.off('evento_aleatorio_concluido'); socket.off('olhar_cartas_lado');
      socket.off('voce_foi_removido'); socket.off('disconnect');
    };
  }, [nome, meuAvatarSeed, tocarEfeito, idioma, minhaSala]);

  const roletarAvatar = () => { setMeuAvatarSeed(gerarSeedAleatoria()); };
  const criarSala = () => { if (!nome) return setErro('Digite o seu nome!'); socket.emit('criar_sala', { nomeJogador: nome, avatar: meuAvatarSeed }); };
  const entrarSala = () => { if (!nome || !codigoSalaInput) return setErro('Preencha os campos!'); socket.emit('entrar_sala', { codigoSala: codigoSalaInput, nomeJogador: nome, avatar: meuAvatarSeed }); };
  
  const iniciarPartida = () => { 
    if (formatoSelecionado === 'duplas' && regrasSelecionadas !== 'boss' && (jogadores.length !== 4 && jogadores.length !== 6)) {
      setErro('O modo Duplas requer exatamente 4 ou 6 jogadores!'); setTimeout(() => setErro(''), 4000); return;
    }
    if (regrasSelecionadas === 'boss' && jogadores.length < 3) {
      setErro('O modo Boss requer no mínimo 3 jogadores!'); setTimeout(() => setErro(''), 4000); return;
    }
    socket.emit('iniciar_partida', { codigoSala: minhaSala, regras: regrasSelecionadas, formato: regrasSelecionadas === 'boss' ? 'pvp' : formatoSelecionado }); 
  };
  
  const adicionarBot = () => {
    const nomesDeBots = ['ASA', 'BOTAS', 'VITE', 'LUNA', 'RYSER'];
    const nomesDisponiveis = nomesDeBots.filter((nomeBot) => !jogadores.some((jogador) => jogador.nome === `[BOT] ${nomeBot}`));
    if (nomesDisponiveis.length > 0) { 
      const nomeSorteado = nomesDisponiveis[Math.floor(Math.random() * nomesDisponiveis.length)]; 
      socket.emit('adicionar_bot', { codigoSala: minhaSala, nomeBot: `[BOT] ${nomeSorteado}` }); 
    } else { 
      setErro('Limite de bots únicos atingido!'); setTimeout(() => setErro(''), 3000); 
    }
  };

  const expulsarJogador = (idAlvo) => { socket.emit('remover_jogador', { codigoSala: minhaSala, alvoId: idAlvo }); };

  const handleSort = () => {
    let _jogadores = [...jogadores];
    const draggedItemContent = _jogadores.splice(dragItem.current, 1)[0];
    _jogadores.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setJogadores(_jogadores);
    socket.emit('reordenar_jogadores', { codigoSala: minhaSala, novaOrdem: _jogadores.map(j => j.id) });
  };

  const handleReconectar = () => {
    const salaSalva = localStorage.getItem('kaos_sala_ativa');
    if (salaSalva && nome) socket.emit('entrar_sala', { codigoSala: salaSalva, nomeJogador: nome, avatar: meuAvatarSeed });
    else if (!nome) { setErro('Digite o seu nome antes de reconectar!'); setTimeout(() => setErro(''), 3000); } 
    else { setErro('Nenhuma sessão anterior encontrada!'); setTimeout(() => setErro(''), 3000); }
  };

  const comprarCarta = () => { if (turnoAtual === socket.id && !eventoNoveAtivo && !eventoAleatorioAtivo) socket.emit('comprar_carta', minhaSala); };
  const passarVez = () => { if (turnoAtual === socket.id && !eventoNoveAtivo && !eventoAleatorioAtivo) socket.emit('passar_vez', minhaSala); };
  const baterNaMesa = () => { if (euJaBati) return; setEuJaBati(true); socket.emit('bater_mesa', minhaSala); };
  const enviarEmote = (emote) => { socket.emit('enviar_emote', { codigoSala: minhaSala, emote }); setMenuEmoteAberto(false); };
  
  const sairDaSala = () => { 
    socket.emit('sair_sala', minhaSala); setMinhaSala(null); setJogadores([]); setInfoJogadores([]); 
    setJogoIniciado(false); setVencedor(null); setTempoPartida(0); setMostrandoSorteio(false); localStorage.removeItem('kaos_sala_ativa'); 
  };
  
  const toggleSelecao = (cartaClicada) => { 
    if (turnoAtual !== socket.id || eventoNoveAtivo || eventoAleatorioAtivo) return; 
    tocarEfeito('carta'); 
    setCartasSelecionadas((ant) => ant.find(c => c.id === cartaClicada.id) ? ant.filter(c => c.id !== cartaClicada.id) : [...ant, cartaClicada]); 
  };

  const tentarJogarSelecionadas = () => {
    if (cartasSelecionadas.length === 0 || eventoNoveAtivo || eventoAleatorioAtivo) return;
    const ultimaCarta = cartasSelecionadas[cartasSelecionadas.length - 1];
    let passosMapeados = [];
    if (cartasSelecionadas.some(c => c.valor === '0') && regrasSelecionadas !== 'boss') passosMapeados.push('zero');
    if (cartasSelecionadas.some(c => c.valor === 'espiar')) passosMapeados.push('espiar');
    if (cartasSelecionadas.some(c => c.valor === 'igualar')) passosMapeados.push('igualar');
    if (cartasSelecionadas.some(c => c.valor === 'escolher_numero')) passosMapeados.push('numero');
    if (ultimaCarta.cor === 'preto' && ultimaCarta.valor !== 'escolher_numero') passosMapeados.push('cor');

    if (passosMapeados.length > 0) { 
      setFilaPassos(passosMapeados); setPayloadJogada({ codigoSala: minhaSala, cartas: cartasSelecionadas }); 
    } else { 
      socket.emit('jogar_cartas', { codigoSala: minhaSala, cartas: cartasSelecionadas }); setCartasSelecionadas([]); 
    }
  };

  const resolverPasso = (dadosExtras) => {
    const payloadAtualizado = { ...payloadJogada, ...dadosExtras };
    const novaFila = [...filaPassos]; 
    novaFila.shift(); 
    if (novaFila.length === 0) { 
      socket.emit('jogar_cartas', payloadAtualizado); setPayloadJogada(null); setCartasSelecionadas([]); setFilaPassos([]); 
    } else { 
      setPayloadJogada(payloadAtualizado); setFilaPassos(novaFila); 
    }
  };

  const meuIndexNaSala = infoJogadores.findIndex(j => j.id === socket.id);
  const meuJogadorInfo = infoJogadores[meuIndexNaSala];
  const oponentesOrdenados = [];
  
  if (meuIndexNaSala !== -1) {
    for (let i = 1; i < infoJogadores.length; i++) {
      oponentesOrdenados.push(infoJogadores[(meuIndexNaSala + i) % infoJogadores.length]);
    }
  }

  const jogadorDaVez = infoJogadores.find(j => j.id === turnoAtual);

  const lobbyProps = {
    t, idioma, setIdioma, nome, setNome, meuAvatarSeed, roletarAvatar, codigoSalaInput, setCodigoSalaInput, minhaSala, criarSala, entrarSala,
    handleReconectar, jogadores, socket, regrasSelecionadas, setRegrasSelecionadas, formatoSelecionado, setFormatoSelecionado, iniciarPartida,
    adicionarBot, sairDaSala, expulsarJogador, handleSort, dragItem, dragOverItem, modalRegrasAberto, setModalRegrasAberto, modalConfigAberto,
    setModalConfigAberto, musicaAtiva, setMusicaAtiva, volumeMusica, setVolumeMusica, efeitosAtivos, setEfeitosAtivos, volumeEfeitos, setVolumeEfeitos
  };

  const tableProps = {
    t, idioma, socket, tempoPartida, meuJogadorInfo, turnoAtual, eventoNoveAtivo, tempoTurnoRestante, oponentesOrdenados, emotesAtivos, menuEmoteAberto,
    setMenuEmoteAberto, enviarEmote, minhaSala, baterNaMesa, euJaBati, posicaoNove, minhaMao, cartasSelecionadas, toggleSelecao, tentarJogarSelecionadas,
    comprasAcumuladas, comprarCarta, jaComprou, passarVez, cartaMesa, sentido, filaPassos, resolverPasso, maoEspiadaPrevia, setMaoEspiadaPrevia,
    setPayloadJogada, vencedor, setVencedor, setJogoIniciado, setTempoPartida, jogadorDaVez, jogadaBossAtiva, eventoAleatorioAtivo, regrasSelecionadas, tempoEventoRestante
  };

  return (
    <div>
      <style>{`
        @keyframes flutuarEmote { 0% { opacity: 0; transform: translate(-50%, -20px) scale(0.5); } 15% { opacity: 1; transform: translate(-50%, -20px) scale(1.2); } 30% { opacity: 1; transform: translate(-50%, -20px) scale(1); } 80% { opacity: 1; transform: translate(-50%, -60px) scale(1); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(1.5); } }
        .emote-anim { position: absolute; top: 0px; left: 50%; font-size: 60px; animation: flutuarEmote 2.5s ease-out forwards; z-index: 5000; pointer-events: none; text-shadow: 2px 2px 0 #000; }
        .botoes-emotes-menu { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
        .btn-emote { font-size: 24px; background: transparent; border: none; cursor: pointer; transition: 0.1s; }
        .btn-emote:hover { transform: scale(1.3); }
        .status-turno-box { padding: 10px 30px; border-radius: 20px; font-size: 16px; }
        .status-turno-box .tempo { font-size: 15px; margin-top: 4px; }
        @media (max-width: 600px) { .status-turno-box { min-width: 140px !important; padding: 5px 15px !important; font-size: 13px !important; } .status-turno-box .tempo { font-size: 12px !important; margin-top: 2px !important; } }
        .modo-seletor-botoes { display: flex; gap: 10px; justify-content: center; margin-top: 10px; }
        .btn-modo { flex: 1; padding: 8px !important; font-size: 14px !important; }
        @keyframes pulso-evento { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .pulsar { animation: pulso-evento 1s infinite; }
      `}</style>

      <div className="aviso-rotacao">
        <DeviceMobile size={100} color="#f1c40f" />
        <h1 style={{ fontFamily: 'Fredoka', marginTop: '20px' }}>{idioma === 'pt' ? 'Rode o seu telemóvel!' : 'Rotate your phone!'}</h1>
      </div>

      <audio ref={audioMusicaRef} src={musicaTema} loop />
      <audio ref={audioJogoRef} src={musicaJogo} loop /> 
      <audio ref={audioEfeitoRef} src={somCarta} />
      <audio ref={audioAlarmeRef} src={somAlarme} />
      <audio ref={audioVitoriaRef} src={somVitoria} />

      {mostrandoSorteio && (
        <div className="modal-overlay" style={{ zIndex: 3000, flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <h1 style={{ color: '#fff', fontSize: '30px', marginBottom: '30px', textAlign: 'center' }}>{t.sorteando}</h1>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {jogadores.map((j, i) => (
              <div key={j.id} style={{ transform: roletaIndex === i ? 'scale(1.3)' : 'scale(1)', opacity: roletaIndex === i ? 1 : 0.4, transition: 'all 0.1s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${j.avatar}`} width="80" height="80" style={{ borderRadius: '50%', border: j.isBoss ? '4px solid #e74c3c' : '4px solid #000', backgroundColor: '#fff', boxShadow: roletaIndex === i ? '0 0 20px #f1c40f' : 'none' }} alt="Avatar" />
                <span style={{ color: '#fff', fontWeight: 'bold', marginTop: '10px', textShadow: '2px 2px 0 #000', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {j.isBoss && <Skull size={16} weight="bold" color="#e74c3c" />} {j.nome}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ocultar-no-retrato">
        {erro && <div className="notificacao-topo-esquerdo" style={{ top: jogoIniciado ? '75px' : '20px' }}>{erro}</div>}
        {vencedor || jogoIniciado ? <Table {...tableProps} /> : <Lobby {...lobbyProps} />}
      </div>
    </div>
  );
}

export default App;