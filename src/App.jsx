import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { 
  HandPalm, Palette, Prohibit, ArrowsLeftRight, Cards, 
  ArrowsClockwise, ArrowsCounterClockwise, Gear, SpeakerHigh, 
  SpeakerSlash, MusicNote, BookBookmark, DeviceMobile, Hourglass, 
  Timer, Eye, Scales, Hash, Smiley 
} from '@phosphor-icons/react';

import musicaTema from './assets/tema.mp3';
import musicaJogo from './assets/jogo.mp3'; // NOVA MÚSICA DA PARTIDA
import somCarta from './assets/carta.mp3';
import somAlarme from './assets/alarme.mp3';
import somVitoria from './assets/vitoria.mp3'; 
import livePixQRCode from './assets/livepix.png';

const socket = io('https://kaos-backend-83du.onrender.com');

const dic = {
  pt: {
    suaVez: "A SUA VEZ!", vezDe: "VEZ DE", aguarde: "Aguarde...", comprar: "COMPRAR",
    jogar: "JOGAR", cartas: "CARTAS", aceitarPunicao: "ACEITAR PUNIÇÃO", passarVez: "PASSAR A VEZ",
    regraZero: "Regra do Zero! O que deseja fazer?", nada: "NADA (Passar)", rodarTodas: "RODAR TODAS AS MÃOS",
    ouTrocar: "Ou trocar com:", escolhaCor: "Escolha a nova cor:", sorteando: "Sorteando quem começa...",
    seuAvatar: "O seu Avatar", seuNome: "Seu Nome", criarSala: "Criar Nova Sala",
    ou: "OU", codigo: "Código...", entrar: "Entrar", apoie: "Pague-me um Cafezinho!",
    ajude: "Ajude a manter o KAOS online e sem anúncios.", doar: "Doar via LivePix", codigoSala: "Código da Sala:",
    jogadores: "Jogadores", voce: "(Você)", host: "- Host", iniciarPartida: "INICIAR PARTIDA",
    aguardandoHost: "A aguardar que o anfitrião inicie...", sairSala: "SAIR DA SALA", 
    config: "Configurações", musica: "Música de Fundo", efeitos: "Efeitos Sonoros", fechar: "Fechar",
    vencedor: "VENCEDOR!", acabouCartas: "acabou com as cartas!", voltarLobby: "Voltar para o Lobby",
    vitorias: "Vitórias", idioma: "Idioma", tempo: "Duração",
    espiarAlvo: "Que bisbilhoteiro! De quem queres ver a mão?",
    igualarTitulo: "Igualar as Cartas", igualarDesc: "Ajustar o tamanho das mãos de toda a gente para a:", 
    igualarMaior: "Maior Quantidade", igualarMenor: "Menor Quantidade",
    escolherNumTitulo: "Escolha o Número", escolherNumDesc: "Selecione o número que a mesa vai passar a ter:",
    regrasTitulo: "Regras do Jogo",
    regrasNovasTitulo: "Mega Atualização (Novas Cartas!)",
    regrasNovasText: "• Espiar (Olho): Veja a mão de qualquer jogador.\n• +3 (Cor): Compra 3 cartas.\n• +6 (Preto): O próximo compra 6.\n• Igualar (Balança): Escolha 'Maior' ou 'Menor' para igualar o número de cartas de todos!\n• Recomeço (Ampulheta): Todos descartam as mãos e compram 7 novas cartas.\n• Escolher Número (#): Muda a mesa para um número específico (cartas de efeito ignoram a cor e anulam esta carta).",
    regrasBasicasTitulo: "Regras Básicas",
    regrasBasicasTexto: "Cada jogador começa com 7 cartas. O objetivo é ser o primeiro a ficar sem cartas. O baralho possui 3 cópias de cada carta numérica (1 ao 9) para criar ainda mais sequências! Deve jogar cartas que combinem com a Cor ou com o Número da mesa.",
    sequenciasTitulo: "Sequências (Múltiplas Cartas)",
    sequenciasTexto: "Pode jogar mais de uma carta ao mesmo tempo se elas tiverem o MESMO VALOR (ex: três cartas '5') OU se formarem uma SEQUÊNCIA DA MESMA COR (ex: 3, 4 e 5 vermelhos, ou 9, 8 e 7 azuis).",
    regraZeroTitulo: "A Regra do Zero (0)",
    regraZeroTexto: "Jogou um 0? Escolha trocar as suas cartas com um oponente específico ou 'Rodar' todas as mãos.",
    regraNoveTitulo: "A Regra do Nove (9)",
    regraNoveTexto: "Sempre que o '9' for jogado, um botão gigante aparecerá. O último a bater compra as cartas de punição!",
    kaosTitulo: "KAOS!",
    kaosTexto: "Quando for ficar com apenas 1 carta, DEVE gritar 'KAOS!'. Pode gritar a qualquer momento se tiver 1 carta, ou APENAS na sua vez se tiver 2 cartas para se proteger. Pode sempre usar o botão para denunciar quem esqueceu!"
  },
  en: {
    suaVez: "YOUR TURN!", vezDe: "TURN:", aguarde: "Wait...", comprar: "DRAW",
    jogar: "PLAY", cartas: "CARDS", aceitarPunicao: "ACCEPT PENALTY", passarVez: "PASS TURN",
    regraZero: "Rule of Zero! What to do?", nada: "NOTHING (Pass)", rodarTodas: "ROTATE ALL HANDS",
    ouTrocar: "Or swap with:", escolhaCor: "Choose new color:", sorteando: "Choosing who starts...",
    seuAvatar: "Your Avatar", seuNome: "Your Name", criarSala: "Create New Room",
    ou: "OR", codigo: "Room Code...", entrar: "Join", apoie: "Buy me a Coffee!",
    ajude: "Help keep KAOS online and ad-free.", doar: "Donate via LivePix", codigoSala: "Room Code:",
    jogadores: "Players", voce: "(You)", host: "- Host", iniciarPartida: "START GAME",
    aguardandoHost: "Waiting for host to start...", sairSala: "LEAVE ROOM", 
    config: "Settings", musica: "Background Music", efeitos: "Sound Effects", fechar: "Close",
    vencedor: "WINNER!", acabouCartas: "finished their cards!", voltarLobby: "Back to Lobby",
    vitorias: "Wins", idioma: "Language", tempo: "Match Time",
    espiarAlvo: "Peeping Tom! Whose hand do you want to see?",
    igualarTitulo: "Equalize Cards", igualarDesc: "Adjust everyone's hand size to match the:", 
    igualarMaior: "Largest Hand", igualarMenor: "Smallest Hand",
    escolherNumTitulo: "Choose a Number", escolherNumDesc: "Select the number the table will change to:",
    regrasTitulo: "Game Rules",
    regrasNovasTitulo: "Mega Update (New Cards!)",
    regrasNovasText: "• Peek (Eye): Look at any player's hand.\n• +3 (Color): Draw 3.\n• +6 (Black): Next player draws 6.\n• Equalizer (Scales): Match everyone's card count to the 'Largest' or 'Smallest' hand!\n• Restart (Hourglass): Everyone discards and draws 7 new cards.\n• Choose Number (#): Change the table to a specific number (effect cards override this rule).",
    regrasBasicasTitulo: "Basic Rules",
    regrasBasicasTexto: "Each player starts with 7 cards. Objective: get rid of all your cards. The deck has 3 copies of each numbered card (1 to 9) for even more sequences! Match the Color or Number of the top card.",
    sequenciasTitulo: "Sequences (Multiple Cards)",
    sequenciasTexto: "Play multiple cards if they have the SAME VALUE (e.g. three '5's) OR form a SEQUENCE IN THE SAME COLOR (ascending 3, 4, 5 or descending 9, 8, 7).",
    regraZeroTitulo: "The Rule of Zero (0)",
    regraZeroTexto: "Played a 0? Swap your cards with an opponent or 'Rotate' all hands.",
    regraNoveTitulo: "The Rule of Nine (9)",
    regraNoveTexto: "When '9' is played, a giant button appears. The last one to slap it draws the penalty!",
    kaosTitulo: "KAOS!",
    kaosTexto: "When you are left with 1 card, you MUST shout 'KAOS!'. You can shout anytime if you have 1 card, or ONLY on your turn if you have 2 cards to protect yourself. You can always use the button to denounce someone!"
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
  if (valor === '+3') return '+3';
  if (valor === '+6') return '+6';
  if (valor === 'espiar') return <Eye size="1em" weight="bold" />;
  if (valor === 'igualar') return <Scales size="1em" weight="bold" />;
  if (valor === 'reinicio') return <Hourglass size="1em" weight="bold" />; 
  if (valor === 'escolher_numero') return <Hash size="1em" weight="bold" />;
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

const arrayEmojis = ['❤️', '💛', '💚', '💙', '🖕', '😴', '😎', '😂', '😡', '👍', '👎', '🤔'];

function App() {
  const [idioma, setIdioma] = useState('pt');
  const t = dic[idioma];

  const [nome, setNome] = useState('');
  const [meuAvatarSeed, setMeuAvatarSeed] = useState(() => gerarSeedAleatoria());
  
  const [codigoSalaInput, setCodigoSalaInput] = useState('');
  const [minhaSala, setMinhaSala] = useState(null);
  
  const [jogadores, setJogadores] = useState([]);
  const [infoJogadores, setInfoJogadores] = useState([]); 
  
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
  
  const [filaPassos, setFilaPassos] = useState([]);
  const [payloadJogada, setPayloadJogada] = useState(null);

  const [maoEspiadaPrevia, setMaoEspiadaPrevia] = useState(null);

  const [emotesAtivos, setEmotesAtivos] = useState({});
  const [menuEmoteAberto, setMenuEmoteAberto] = useState(false);

  const [vencedor, setVencedor] = useState(null);

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
  const audioJogoRef = useRef(null); // Ref para a música do Jogo
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
    if (jogoIniciado && !vencedor && !eventoNoveAtivo) {
      interval = setInterval(() => {
        const passado = Math.floor((Date.now() - tempoReferencia) / 1000);
        setTempoTurnoRestante(Math.max(25 - passado, 0));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [jogoIniciado, vencedor, eventoNoveAtivo, tempoReferencia]);

  // LÓGICA ATUALIZADA DA MÚSICA (Alterna entre Lobby, Jogo e Vitória)
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
    socket.on('sala_criada', (codigo) => { setMinhaSala(codigo); setJogadores([{ id: socket.id, nome: nome, avatar: meuAvatarSeed, vitorias: 0 }]); });
    socket.on('entrou_na_sala', (codigo) => { setMinhaSala(codigo); });
    socket.on('atualizar_jogadores', (lista) => { setJogadores(lista); setInfoJogadores(lista); });
    
    socket.on('sorteando_primeiro_jogador', (idSorteado) => {
      setJogadorSorteado(idSorteado);
      setMostrandoSorteio(true);
    });

    socket.on('partida_iniciada', (dados) => {
      setMostrandoSorteio(false); 
      setJogadorSorteado(null);
      setJogoIniciado(true); setMinhaMao(dados.minhaMao); setCartaMesa(dados.cartaMesa); 
      setTurnoAtual(dados.turnoAtual); setJaComprou(dados.comprouNestaRodada);
      setComprasAcumuladas(dados.comprasAcumuladas); setSentido(dados.sentido || 1);
      setInfoJogadores(dados.infoJogadores || []);
      setCartasSelecionadas([]); setVencedor(null); setTempoPartida(0);
      
      setTempoReferencia(Date.now());
      setTempoTurnoRestante(25);
      tocarEfeito('carta');
    });
    
    socket.on('estado_atualizado', (dados) => {
      setMinhaMao(dados.minhaMao); setCartaMesa(dados.cartaMesa); 
      setTurnoAtual(dados.turnoAtual); setJaComprou(dados.comprouNestaRodada);
      setComprasAcumuladas(dados.comprasAcumuladas); setSentido(dados.sentido || 1);
      setInfoJogadores(dados.infoJogadores || []);
      setCartasSelecionadas([]); 
      
      if (dados.resetarTempo) {
        setTempoReferencia(Date.now());
        setTempoTurnoRestante(25);
      }
      tocarEfeito('carta');
    });

    socket.on('mao_espiao_previa', (dados) => {
      setMaoEspiadaPrevia(dados);
    });

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
      setEventoNoveAtivo(true); 
      setEuJaBati(false); 
      setPosicaoNove({ 
        top: `${Math.floor(Math.random() * 50) + 25}%`, 
        left: `${Math.floor(Math.random() * 70) + 15}%` 
      }); 
      tocarEfeito('alarme'); 
    });

    socket.on('fim_evento_nove', (dados) => { 
      setEventoNoveAtivo(false); 
      setErro(`${dados.perdedor} comprou ${dados.cartasCompradas} cartas no evento do 9!`); 
      setTimeout(() => setErro(''), 6000); 
    });

    socket.on('fim_de_jogo', (nomeGanhador) => { 
      setVencedor(nomeGanhador); 
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
      socket.off('disconnect');
    };
  }, [nome, meuAvatarSeed, tocarEfeito]);

  const roletarAvatar = () => { setMeuAvatarSeed(gerarSeedAleatoria()); };
  
  const criarSala = () => { if (!nome) return setErro('Digite o seu nome!'); socket.emit('criar_sala', { nomeJogador: nome, avatar: meuAvatarSeed }); };
  const entrarSala = () => { if (!nome || !codigoSalaInput) return setErro('Preencha os campos!'); socket.emit('entrar_sala', { codigoSala: codigoSalaInput, nomeJogador: nome, avatar: meuAvatarSeed }); };
  const iniciarPartida = () => { socket.emit('iniciar_partida', minhaSala); };
  
  const comprarCarta = () => { if (turnoAtual === socket.id && !eventoNoveAtivo) socket.emit('comprar_carta', minhaSala); };
  const passarVez = () => { if (turnoAtual === socket.id && !eventoNoveAtivo) socket.emit('passar_vez', minhaSala); };
  
  const baterNaMesa = () => { if (euJaBati) return; setEuJaBati(true); socket.emit('bater_mesa', minhaSala); };

  const enviarEmote = (emote) => {
    socket.emit('enviar_emote', { codigoSala: minhaSala, emote });
    setMenuEmoteAberto(false);
  };

  const sairDaSala = () => {
    socket.emit('sair_sala', minhaSala);
    setMinhaSala(null); setJogadores([]); setInfoJogadores([]);
    setJogoIniciado(false); setVencedor(null); setTempoPartida(0); 
    setMostrandoSorteio(false);
  };

  const toggleSelecao = (cartaClicada) => {
    if (turnoAtual !== socket.id || eventoNoveAtivo) return;
    tocarEfeito('carta');
    setCartasSelecionadas((ant) => ant.find(c => c.id === cartaClicada.id) ? ant.filter(c => c.id !== cartaClicada.id) : [...ant, cartaClicada]);
  };

  const tentarJogarSelecionadas = () => {
    if (cartasSelecionadas.length === 0 || eventoNoveAtivo) return;
    const ultimaCarta = cartasSelecionadas[cartasSelecionadas.length - 1];

    let passosMapeados = [];
    if (cartasSelecionadas.some(c => c.valor === '0')) passosMapeados.push('zero');
    
    if (cartasSelecionadas.some(c => c.valor === 'espiar')) passosMapeados.push('espiar');
    
    if (cartasSelecionadas.some(c => c.valor === 'igualar')) passosMapeados.push('igualar');
    if (cartasSelecionadas.some(c => c.valor === 'escolher_numero')) passosMapeados.push('numero');
    
    if (ultimaCarta.cor === 'preto' && ultimaCarta.valor !== 'escolher_numero') passosMapeados.push('cor');

    if (passosMapeados.length > 0) {
      setFilaPassos(passosMapeados);
      setPayloadJogada({ codigoSala: minhaSala, cartas: cartasSelecionadas });
    } else {
      socket.emit('jogar_cartas', { codigoSala: minhaSala, cartas: cartasSelecionadas });
      setCartasSelecionadas([]);
    }
  };

  const resolverPasso = (dadosExtras) => {
    const payloadAtualizado = { ...payloadJogada, ...dadosExtras };
    const novaFila = [...filaPassos];
    novaFila.shift(); 

    if (novaFila.length === 0) {
      socket.emit('jogar_cartas', payloadAtualizado);
      setPayloadJogada(null);
      setCartasSelecionadas([]);
      setFilaPassos([]);
    } else {
      setPayloadJogada(payloadAtualizado);
      setFilaPassos(novaFila);
    }
  };

  const meuIndexNaSala = infoJogadores.findIndex(j => j.id === socket.id);
  const oponentesOrdenados = [];
  if (meuIndexNaSala !== -1) {
    for (let i = 1; i < infoJogadores.length; i++) {
      oponentesOrdenados.push(infoJogadores[(meuIndexNaSala + i) % infoJogadores.length]);
    }
  }

  const jogadorDaVez = infoJogadores.find(j => j.id === turnoAtual);

  return (
    <div>
      <style>{`
        @keyframes flutuarEmote {
          0% { opacity: 0; transform: translate(-50%, -20px) scale(0.5); }
          15% { opacity: 1; transform: translate(-50%, -20px) scale(1.2); }
          30% { opacity: 1; transform: translate(-50%, -20px) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -60px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -100px) scale(1.5); }
        }
        
        .emote-anim {
          position: absolute;
          top: 0px; 
          left: 50%;
          font-size: 60px;
          animation: flutuarEmote 2.5s ease-out forwards;
          z-index: 5000;
          pointer-events: none;
          text-shadow: 2px 2px 0 #000;
        }

        .botoes-emotes-menu {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 10px;
        }
        
        .btn-emote {
          font-size: 24px; background: transparent; border: none; cursor: pointer; transition: 0.1s;
        }
        .btn-emote:hover { transform: scale(1.3); }

        .status-turno-box {
          min-width: 220px;
          padding: 10px 30px;
          border-radius: 20px;
          font-size: 16px;
        }
        .status-turno-box .tempo {
          font-size: 15px;
          margin-top: 4px;
        }

        @media (max-width: 600px) {
          .status-turno-box {
            min-width: 140px !important;
            padding: 5px 15px !important;
            font-size: 13px !important;
          }
          .status-turno-box .tempo {
            font-size: 12px !important;
            margin-top: 2px !important;
          }
        }
      `}</style>

      <div className="aviso-rotacao">
        <DeviceMobile size={100} color="#f1c40f" />
        <h1 style={{ fontFamily: 'Fredoka', marginTop: '20px' }}>{idioma === 'pt' ? 'Rode o seu telemóvel!' : 'Rotate your phone!'}</h1>
      </div>

      {/* ADICIONADA A TAG AUDIO PARA A MÚSICA DO JOGO */}
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
                <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${j.avatar}`} width="80" height="80" style={{ borderRadius: '50%', border: '4px solid #000', backgroundColor: '#fff', boxShadow: roletaIndex === i ? '0 0 20px #f1c40f' : 'none' }} />
                <span style={{ color: '#fff', fontWeight: 'bold', marginTop: '10px', textShadow: '2px 2px 0 #000' }}>{j.nome}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ocultar-no-retrato">
        {erro && <div className="notificacao-topo-esquerdo" style={{ top: jogoIniciado ? '75px' : '20px' }}>{erro}</div>}

        {vencedor ? (
          <div className="container" style={{ marginTop: '100px' }}>
            <h1 className="logo-kaos"><div className="carta-k-logo">K</div>AOS</h1>
            <h1 style={{ fontSize: '50px', color: '#f1c40f' }}>🏆 {t.vencedor} 🏆</h1>
            <h2 style={{ fontSize: '40px' }}>{vencedor} {t.acabouCartas}</h2>
            <button className="btn btn-azul" onClick={() => { setVencedor(null); setJogoIniciado(false); setTempoPartida(0); }}>{t.voltarLobby}</button>
          </div>
        ) : jogoIniciado ? (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            
            <div style={{ position: 'fixed', top: '20px', left: '20px', fontWeight: '900', color: '#fff', backgroundColor: '#2c3e50', padding: '8px 20px', borderRadius: '15px', border: '3px solid #000', boxShadow: '4px 4px 0 #000', zIndex: 100, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Timer size={20} weight="bold" /> {t.tempo}: {Math.floor(tempoPartida / 60)}:{(tempoPartida % 60).toString().padStart(2, '0')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div className={`status-turno status-turno-box ${turnoAtual === socket.id ? 'minha-vez' : ''}`}>
                <div>{turnoAtual === socket.id ? t.suaVez : jogadorDaVez ? `${t.vezDe} ${jogadorDaVez.nome.toUpperCase()}` : t.aguarde}</div>
                <div className="tempo" style={{ color: turnoAtual === socket.id ? '#000' : '#ff7675', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  {eventoNoveAtivo ? <span style={{fontWeight: 'bold'}}>PAUSA</span> : <><Hourglass size={16} weight="bold" /> {tempoTurnoRestante}s</>}
                </div>
              </div>
            </div>

            <div className="mesa-redonda">
              {oponentesOrdenados.map((op, index) => {
                const ehVezDele = turnoAtual === op.id;
                return (
                  <div key={op.id} className="oponente-container" style={getPosicaoOponente(index, oponentesOrdenados.length)}>
                    
                    {emotesAtivos[op.id] && <div className="emote-anim">{emotesAtivos[op.id]}</div>}
                    
                    <div className="oponente-avatar" style={{ position: 'relative', borderColor: ehVezDele ? '#2ecc71' : '#000', boxShadow: ehVezDele ? '0 0 15px #2ecc71' : '4px 4px 0 #000' }}>
                      <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${op.avatar}`} width="100%" height="100%" />
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
                  <div className="icone-baralho" onClick={comprarCarta} style={{ cursor: turnoAtual === socket.id && !eventoNoveAtivo ? 'pointer' : 'default' }}>
                    <Cards size={48} weight="duotone" color="#ecf0f1" />
                  </div>
                  {turnoAtual === socket.id && !jaComprou && comprasAcumuladas === 0 && cartasSelecionadas.length === 0 && !eventoNoveAtivo && (
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

            <div style={{ position: 'fixed', bottom: '90px', right: '20px', zIndex: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              
              <div style={{ position: 'relative' }}>
                
                {emotesAtivos[socket.id] && <div className="emote-anim" style={{ zIndex: 1200 }}>{emotesAtivos[socket.id]}</div>}

                <button
                  onClick={() => setMenuEmoteAberto(!menuEmoteAberto)}
                  style={{ background: '#fff', border: '3px solid #000', borderRadius: '50%', width: '55px', height: '55px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '3px 3px 0 #000', outline: 'none', transition: 'transform 0.1s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Smiley size={36} weight="fill" color="#f1c40f" />
                </button>

                {menuEmoteAberto && (
                  <div style={{ position: 'absolute', bottom: '65px', right: '0', background: '#fff', border: '3px solid #000', borderRadius: '15px', padding: '10px', width: '210px', boxShadow: '4px 4px 0 #000' }}>
                    <div className="botoes-emotes-menu">
                      {arrayEmojis.map(emo => (
                        <button key={emo} className="btn-emote" onClick={() => enviarEmote(emo)}>{emo}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button className="btn-uno" onClick={() => socket.emit('apertar_uno', minhaSala)} style={{ position: 'static' }}>KAOS!</button>
            
            </div>

            {filaPassos[0] === 'zero' && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2 style={{margin: '0 0 15px 0'}}>{t.regraZero}</h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button className="btn btn-cinza" onClick={() => resolverPasso({ alvoTroca: 'ninguem' })}>{t.nada}</button>
                    <button className="btn btn-verde" onClick={() => resolverPasso({ alvoTroca: 'todos' })}>{t.rodarTodas}</button>
                  </div>
                  <h3 style={{margin: '15px 0 10px 0'}}>{t.ouTrocar}</h3>
                  <div className="grid-opcoes-zero">
                    {oponentesOrdenados.map(j => (
                      <button key={j.id} className="btn btn-azul" onClick={() => resolverPasso({ alvoTroca: j.id })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${j.avatar}`} width="30" height="30" style={{ borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #000' }} />
                        {j.nome} ({j.qtdCartas})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {filaPassos[0] === 'espiar' && !maoEspiadaPrevia && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2 style={{margin: '0 0 15px 0'}}><Eye size={32} style={{verticalAlign:'middle'}}/> {t.espiarAlvo}</h2>
                  <div className="grid-opcoes-zero">
                    {oponentesOrdenados.map(j => (
                      <button key={j.id} className="btn btn-roxo" onClick={() => {
                        socket.emit('espiar_cartas_alvo', { codigoSala: minhaSala, alvoId: j.id });
                        setPayloadJogada(prev => ({ ...prev, alvoTroca: j.id }));
                      }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${j.avatar}`} width="30" height="30" style={{ borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #000' }} />
                        {j.nome} ({j.qtdCartas})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {maoEspiadaPrevia && (
              <div className="modal-overlay" style={{ zIndex: 1600 }}>
                <div className="modal-content" style={{ maxWidth: '600px' }}>
                  <h2 style={{ marginBottom: '15px' }}>Cartas de {maoEspiadaPrevia.nome}:</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                    {maoEspiadaPrevia.cartas.map(c => (
                      <div key={c.id} className="carta" style={{ backgroundColor: getCorCss(c.originalCor || c.cor), color: c.cor === 'amarelo' ? '#000' : '#fff', transform: 'scale(0.8)', margin: '-10px' }}>
                        {renderValorCarta(c.originalValor || c.valor)}
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-azul" style={{ marginTop: '20px' }} onClick={() => {
                    setMaoEspiadaPrevia(null);
                    resolverPasso({}); 
                  }}>{t.fechar}</button>
                </div>
              </div>
            )}

            {filaPassos[0] === 'igualar' && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2 style={{margin: '0 0 5px 0'}}><Scales size={32} style={{verticalAlign:'middle'}}/> {t.igualarTitulo}</h2>
                  <p style={{marginBottom: '20px'}}>{t.igualarDesc}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button className="btn btn-verde" onClick={() => resolverPasso({ alvoOpcao: 'maior' })}>{t.igualarMaior}</button>
                    <button className="btn btn-vermelho" onClick={() => resolverPasso({ alvoOpcao: 'menor' })}>{t.igualarMenor}</button>
                  </div>
                </div>
              </div>
            )}

            {filaPassos[0] === 'numero' && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2 style={{margin: '0 0 5px 0'}}><Hash size={32} style={{verticalAlign:'middle'}}/> {t.escolherNumTitulo}</h2>
                  <p style={{marginBottom: '15px'}}>{t.escolherNumDesc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
                    {['0','1','2','3','4','5','6','7','8','9'].map(num => (
                      <button key={num} onClick={() => resolverPasso({ alvoNumero: num })} style={{ width: '50px', height: '50px', fontSize: '24px', fontWeight: 'bold', backgroundColor: '#ecf0f1', border: '3px solid #000', borderRadius: '10px', cursor: 'pointer', boxShadow: '3px 3px 0 #000' }}>
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {filaPassos[0] === 'cor' && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2>{t.escolhaCor}</h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    {['vermelho', 'azul', 'verde', 'amarelo'].map(cor => (
                      <button key={cor} onClick={() => resolverPasso({ novaCor: cor })} style={{ width: '70px', height: '70px', backgroundColor: getCorCss(cor), border: '4px solid #000', borderRadius: '12px', cursor: 'pointer', boxShadow: '4px 4px 0 #000' }}></button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {eventoNoveAtivo && (
              <div style={{ position: 'fixed', top: posicaoNove.top, left: posicaoNove.left, transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 2000, pointerEvents: 'none' }}>
                <button onClick={baterNaMesa} disabled={euJaBati} style={{ pointerEvents: 'auto', width: '160px', height: '160px', borderRadius: '50%', border: '8px solid #000', backgroundColor: euJaBati ? '#2ed573' : '#ff4757', boxShadow: '6px 6px 0 #000', cursor: euJaBati ? 'default' : 'pointer', transition: 'all 0.1s', transform: euJaBati ? 'scale(0.9)' : 'scale(1.1)' }}><HandPalm weight="fill" size={96} color="#000" /></button>
              </div>
            )}

            <div className="mao-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', padding: '0 10px 10px 10px', maxWidth: '1000px', margin: '15px auto' }}>
              {minhaMao.map((carta) => {
                const taSelecionada = cartasSelecionadas.find(c => c.id === carta.id);
                let classes = "carta";
                if (taSelecionada) classes += " selecionada";
                if (turnoAtual !== socket.id || eventoNoveAtivo) classes += " desabilitada";

                return (
                  <div key={carta.id} onClick={() => toggleSelecao(carta)} className={classes} style={{ backgroundColor: getCorCss(carta.cor), color: carta.cor === 'amarelo' ? '#000' : '#fff' }}>
                    {renderValorCarta(carta.valor)}
                  </div>
                );
              })}
            </div>

            <div className="painel-acoes" style={{ marginBottom: '20px' }}>
              {turnoAtual === socket.id && cartasSelecionadas.length > 0 && !eventoNoveAtivo && (
                <button className="btn btn-verde" onClick={tentarJogarSelecionadas}>{t.jogar} ({cartasSelecionadas.length}) {t.cartas}</button>
              )}
              {turnoAtual === socket.id && comprasAcumuladas > 0 && !eventoNoveAtivo && (
                <button className="btn btn-vermelho" onClick={comprarCarta}>{t.aceitarPunicao} (+{comprasAcumuladas})</button>
              )}
              {turnoAtual === socket.id && jaComprou && cartasSelecionadas.length === 0 && comprasAcumuladas === 0 && !eventoNoveAtivo && (
                <button className="btn btn-cinza" onClick={passarVez}>{t.passarVez}</button>
              )}
            </div>

          </div>
        ) : (
          <div className="container" style={{ position: 'relative' }}>
            
            <button 
              onClick={() => setModalRegrasAberto(true)} 
              style={{ position: 'absolute', top: '20px', left: '20px', background: '#3498db', border: '3px solid #000', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '3px 3px 0 #000' }}
              title={t.regrasTitulo}
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
                    <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${meuAvatarSeed}`} width="100%" height="100%" />
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
                        <span style={{fontSize: '16px', color: '#f39c12'}}>{t.vitorias}: {jogador.vitorias || 0}</span>
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
                <div className="modal-content" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', textAlign: 'left', padding: '25px' }}>
                  <h2 style={{ textAlign: 'center', marginTop: 0 }}>{t.regrasTitulo}</h2>
                  
                  <h3 style={{ color: '#9b59b6', margin: '15px 0 5px 0' }}>🚀 {t.regrasNovasTitulo}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', whiteSpace: 'pre-line' }}>{t.regrasNovasText}</p>

                  <h3 style={{ color: '#2ecc71', margin: '15px 0 5px 0' }}>{t.regrasBasicasTitulo}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>{t.regrasBasicasTexto}</p>

                  <h3 style={{ color: '#f39c12', margin: '15px 0 5px 0' }}>{t.sequenciasTitulo}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>{t.sequenciasTexto}</p>

                  <h3 style={{ color: '#3498db', margin: '15px 0 5px 0' }}>{t.regraZeroTitulo}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>{t.regraZeroTexto}</p>

                  <h3 style={{ color: '#e74c3c', margin: '15px 0 5px 0' }}>{t.regraNoveTitulo}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>{t.regraNoveTexto}</p>

                  <h3 style={{ color: '#ff4757', margin: '15px 0 5px 0' }}>{t.kaosTitulo}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>{t.kaosTexto}</p>

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
                  
                  <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                      <span style={{ fontSize: '24px' }}>{idioma === 'pt' ? '🇧🇷' : '🇺🇸'}</span> {t.idioma}
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