import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { HandPalm, Palette, Prohibit, ArrowsLeftRight, Cards, ArrowsClockwise, ArrowsCounterClockwise, Gear, SpeakerHigh, SpeakerSlash, MusicNote } from '@phosphor-icons/react';

// Importando os áudios da pasta assets
import musicaTema from './assets/tema.mp3';
import somCarta from './assets/carta.mp3';
import somAlarme from './assets/alarme.mp3';

const socket = io('https://kaos-backend-83du.onrender.com');

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
  const [musicaAtiva, setMusicaAtiva] = useState(true);
  const [volumeMusica, setVolumeMusica] = useState(0.4);
  const [efeitosAtivos, setEfeitosAtivos] = useState(true);
  const [volumeEfeitos, setVolumeEfeitos] = useState(0.7);

  const audioMusicaRef = useRef(null);
  const audioEfeitoRef = useRef(null);
  const audioAlarmeRef = useRef(null);

  useEffect(() => {
    if (audioMusicaRef.current) {
      audioMusicaRef.current.volume = volumeMusica;
      if (musicaAtiva) {
        audioMusicaRef.current.play().catch(() => {}); 
      } else {
        audioMusicaRef.current.pause();
      }
    }
  }, [musicaAtiva, volumeMusica]);

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
    socket.on('sala_criada', (codigo) => { setMinhaSala(codigo); setJogadores([{ id: socket.id, nome: nome, avatar: meuAvatarSeed }]); });
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
      setErro(`🚨 ${dados.perdedor} comprou ${dados.cartasCompradas} cartas no evento do 9!`); 
      setTimeout(() => setErro(''), 6000); 
    });

    socket.on('fim_de_jogo', (nomeGanhador) => { setVencedor(nomeGanhador); });
    
    socket.on('erro', (mensagem) => { setErro(mensagem); setTimeout(() => setErro(''), 4000); });

    // === PROTEÇÃO DE TELA CONGELADA ===
    // Se a conexão cair ou o servidor reiniciar, ele avisa e reseta o jogo para evitar bugs de "tela fantasma"
    socket.on('disconnect', () => {
      setErro('🔴 Conexão perdida com o servidor! A tela será atualizada em instantes...');
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
  
  const criarSala = () => { if (!nome) return setErro('Digite seu nome!'); socket.emit('criar_sala', { nomeJogador: nome, avatar: meuAvatarSeed }); };
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
      <audio ref={audioMusicaRef} src={musicaTema} loop />
      <audio ref={audioEfeitoRef} src={somCarta} />
      <audio ref={audioAlarmeRef} src={somAlarme} />

      {vencedor ? (
        <div className="container" style={{ marginTop: '100px' }}>
          <h1 className="logo-kaos"><div className="carta-k-logo">K</div>AOS</h1>
          <h1 style={{ fontSize: '50px', color: '#f1c40f' }}>🏆 VENCEDOR! 🏆</h1>
          <h2 style={{ fontSize: '40px' }}>{vencedor} acabou com as cartas!</h2>
          <button className="btn btn-azul" onClick={() => { setVencedor(null); setJogoIniciado(false); }}>Voltar para o Lobby</button>
        </div>
      ) : jogoIniciado ? (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          
          <div className={`status-turno ${turnoAtual === socket.id ? 'minha-vez' : ''}`}>
            {turnoAtual === socket.id ? 'SUA VEZ!' : jogadorDaVez ? `VEZ DE ${jogadorDaVez.nome.toUpperCase()}` : 'Aguarde...'}
          </div>
          
          {erro && <div style={{ backgroundColor: '#ff7675', color: '#fff', padding: '10px 15px', borderRadius: '10px', border: '3px solid #000', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px', zIndex: 1100, position: 'relative' }}>{erro}</div>}

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
                  <button className="btn btn-roxo btn-pequeno" onClick={comprarCarta} style={{margin: 0}}>COMPRAR</button>
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
                <h2 style={{margin: '0 0 15px 0'}}>Regra do Zero! O que deseja fazer?</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button className="btn btn-cinza" onClick={() => confirmarAlvoZero('ninguem')}>NADA (Passar)</button>
                  <button className="btn btn-verde" onClick={() => confirmarAlvoZero('todos')}>GIRAR TODAS AS MÃOS</button>
                </div>
                <h3 style={{margin: '15px 0 10px 0'}}>Ou trocar com:</h3>
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
            <div className="modal-overlay"><div className="modal-content"><h2>Escolha a nova cor:</h2><div style={{ display: 'flex', gap: '15px' }}>{['vermelho', 'azul', 'verde', 'amarelo'].map(cor => (<button key={cor} onClick={() => confirmarCorCoringa(cor)} style={{ width: '70px', height: '70px', backgroundColor: getCorCss(cor), border: '4px solid #000', borderRadius: '12px', cursor: 'pointer', boxShadow: '4px 4px 0 #000' }}></button>))}</div></div></div>
          )}

          {eventoNoveAtivo && (
            <div className="modal-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}><div style={{ textAlign: 'center' }}><h1 style={{ color: '#ff4757', fontSize: '60px', fontFamily: 'Fredoka', WebkitTextStroke: '3px #000' }}>BATA NA MESA!</h1><button onClick={baterNaMesa} disabled={euJaBati} style={{ width: '250px', height: '250px', borderRadius: '50%', border: '10px solid #000', backgroundColor: euJaBati ? '#2ed573' : '#ff4757', boxShadow: '8px 8px 0 #000', cursor: euJaBati ? 'default' : 'pointer', transition: 'all 0.1s', transform: euJaBati ? 'scale(0.9)' : 'scale(1.1)' }}><HandPalm weight="fill" size={140} color="#000" /></button></div></div>
          )}

          <button className="btn-uno" onClick={() => socket.emit('apertar_uno', minhaSala)}>KAOS!</button>

          <div className="painel-acoes">
            {turnoAtual === socket.id && cartasSelecionadas.length > 0 && (
              <button className="btn btn-verde" onClick={tentarJogarSelecionadas}>JOGAR ({cartasSelecionadas.length}) CARTAS</button>
            )}
            {turnoAtual === socket.id && comprasAcumuladas > 0 && (
              <button className="btn btn-vermelho" onClick={comprarCarta}>ACEITAR PUNIÇÃO (+{comprasAcumuladas})</button>
            )}
            {turnoAtual === socket.id && jaComprou && cartasSelecionadas.length === 0 && comprasAcumuladas === 0 && (
              <button className="btn btn-cinza" onClick={passarVez}>⏭ PASSAR A VEZ</button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', padding: '0 10px 10px 10px', maxWidth: '1000px', margin: '0 auto' }}>
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
        </div>
      ) : (
        <div className="container" style={{ position: 'relative' }}>
          
          <button 
            onClick={() => setModalConfigAberto(true)} 
            style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1c40f', border: '3px solid #000', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '3px 3px 0 #000' }}
            title="Configurações de Áudio"
          >
            <Gear size={26} weight="bold" color="#000" />
          </button>

          <div className="logo-kaos"><div className="carta-k-logo">K</div>AOS</div>
          
          {!minhaSala ? (
            <>
              <div className="avatar-seletor-container">
                <h3>Seu Avatar (Clique para mudar)</h3>
                <div className="avatar-display" onClick={roletarAvatar}>
                  <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${meuAvatarSeed}`} alt="Avatar" width="100%" height="100%" />
                </div>
              </div>
              <div>
                <input type="text" placeholder="Seu apelido..." maxLength={12} value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div style={{ marginTop: '20px' }}>
                <button className="btn btn-verde" onClick={criarSala}>Criar Nova Sala</button>
                <h3 style={{ margin: '15px 0' }}>OU</h3>
                <input type="text" placeholder="Código..." value={codigoSalaInput} onChange={(e) => setCodigoSalaInput(e.target.value)} style={{ width: '120px' }} />
                <button className="btn btn-azul" onClick={entrarSala}>Entrar</button>
              </div>
            </>
          ) : (
            <>
              <h2>Código da Sala: <span style={{fontSize: '40px', color: '#ff4757'}}>{minhaSala}</span></h2>
              <h3>Jogadores ({jogadores.length}/6):</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                {jogadores.map((jogador, index) => (
                  <li key={index} style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${jogador.avatar}`} width="50" height="50" style={{ borderRadius: '50%', backgroundColor: '#ecf0f1', border: '3px solid #000' }} />
                    {jogador.nome} {jogador.id === socket.id ? '(Você)' : ''} {index === 0 && '- Host'}
                  </li>
                ))}
              </ul>
              {jogadores[0]?.id === socket.id ? (
                <button className="btn btn-vermelho" onClick={iniciarPartida} style={{ marginTop: '20px', fontSize: '24px' }}>▶ INICIAR PARTIDA</button>
              ) : (
                <p style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '20px' }}>Aguardando o dono da sala iniciar...</p>
              )}
              <br/>
              <button className="btn btn-cinza" onClick={sairDaSala} style={{ marginTop: '10px' }}>🚪 SAIR DA SALA</button>
            </>
          )}

          {modalConfigAberto && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: '320px' }}>
                <h2>🔊 Configurações</h2>
                
                <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                    <MusicNote size={24} /> Música de Fundo
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
                    <SpeakerHigh size={24} /> Efeitos Sonoros
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
                  Fechar
                </button>
              </div>
            </div>
          )}

          {erro && <p style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '20px', marginTop: '20px', zIndex: 1100, position: 'relative' }}>{erro}</p>}
        </div>
      )}
    </div>
  );
}

export default App;