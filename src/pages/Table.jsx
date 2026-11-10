import { useMemo } from 'react';
import { HandPalm, Cards, ArrowsClockwise, ArrowsCounterClockwise, Hourglass, Timer, Eye, Scales, Hash, Smiley } from '@phosphor-icons/react';
import { getCorCss, renderValorCarta, getPosicaoOponente, arrayEmojis } from '../utils/gameUtils';

export default function Table(props) {
  const {
    t, socket, tempoPartida, meuJogadorInfo, turnoAtual, eventoNoveAtivo,
    tempoTurnoRestante, oponentesOrdenados, emotesAtivos, menuEmoteAberto, setMenuEmoteAberto,
    enviarEmote, baterNaMesa, euJaBati, posicaoNove, minhaMao, cartasSelecionadas,
    toggleSelecao, tentarJogarSelecionadas, comprasAcumuladas, comprarCarta, jaComprou,
    passarVez, cartaMesa, sentido, filaPassos, resolverPasso, maoEspiadaPrevia,
    setMaoEspiadaPrevia, vencedor, setVencedor, setJogoIniciado, setTempoPartida, jogadorDaVez
  } = props;

  // ORDENAÇÃO AUTOMÁTICA DAS CARTAS
  const cartasOrdenadas = useMemo(() => {
    const ordemCores = { vermelho: 1, amarelo: 2, azul: 3, verde: 4, preto: 5 };
    
    return [...minhaMao].sort((a, b) => {
      if (ordemCores[a.cor] !== ordemCores[b.cor]) {
        return (ordemCores[a.cor] || 99) - (ordemCores[b.cor] || 99);
      }
      return a.valor.toString().localeCompare(b.valor.toString());
    });
  }, [minhaMao]);

  if (vencedor) {
    return (
      <div className="container" style={{ marginTop: '100px', border: '6px solid #000', borderRadius: '30px', padding: '40px', backgroundColor: '#fff' }}>
        <h1 className="logo-kaos"><div className="carta-k-logo">K</div>AOS</h1>
        <h1 style={{ fontSize: '50px', color: '#f1c40f', textShadow: '2px 2px 0 #000' }}>🏆 {t.vencedor} 🏆</h1>
        <h2 style={{ fontSize: '40px', marginBottom: '30px' }}>{vencedor} {t.acabouCartas}</h2>
        <button className="btn btn-azul" style={{ fontSize: '24px', padding: '15px 40px' }} onClick={() => { setVencedor(null); setJogoIniciado(false); setTempoPartida(0); }}>{t.voltarLobby}</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '10px' }}>
      {/* Top Bar ESQUERDA (Tempo e Equipa) */}
      <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 100, display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div style={{ fontWeight: '900', color: '#fff', backgroundColor: '#2c3e50', padding: '8px 20px', borderRadius: '15px', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={20} weight="bold" /> {t.tempo}: {Math.floor(tempoPartida / 60)}:{(tempoPartida % 60).toString().padStart(2, '0')}
        </div>
        {meuJogadorInfo?.corEquipe && (
          <div style={{ fontWeight: '900', color: '#fff', backgroundColor: '#2c3e50', padding: '8px 20px', borderRadius: '15px', border: '3px solid #000', boxShadow: `4px 4px 0 ${meuJogadorInfo.corEquipe}`, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: meuJogadorInfo.corEquipe, border: '2px solid #fff' }} /> SUA EQUIPE
          </div>
        )}
      </div>

      {/* Top Bar DIREITA (Indicador de Turno - Atualizado para Verde e Vermelho) */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100 }}>
        <div className="status-turno-box" style={{ 
          backgroundColor: '#2ecc71', /* Fixo em Verde */
          color: '#fff', /* Nome em Branco */
          border: '4px solid #000', borderRadius: '20px', padding: '10px 20px', fontWeight: '900',
          boxShadow: '4px 4px 0 #000'
        }}>
          <div style={{ fontSize: '16px', textShadow: '1px 1px 0 #000' }}>
            {turnoAtual === socket.id ? t.suaVez : jogadorDaVez ? `${t.vezDe} ${jogadorDaVez.nome.toUpperCase()}` : t.aguarde}
          </div>
          
          {/* Pílula branca para o temporizador vermelho se destacar */}
          <div style={{ backgroundColor: '#fff', color: '#e74c3c', border: '2px solid #000', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '6px', padding: '2px 10px' }}>
            {eventoNoveAtivo ? <span>PAUSA (BATA!)</span> : <><Hourglass size={16} weight="bold" /> {tempoTurnoRestante}s</>}
          </div>
        </div>
      </div>

      {/* MESA REDONDA DE MADEIRA */}
      <div className="mesa-redonda-moderna">
        {/* OPONENTES */}
        {oponentesOrdenados.map((op, index) => {
          const ehVezDele = turnoAtual === op.id;
          return (
            <div key={op.id} className="oponente-container" style={getPosicaoOponente(index, oponentesOrdenados.length)}>
              {emotesAtivos[op.id] && <div className="emote-anim">{emotesAtivos[op.id]}</div>}
              
              <div className="oponente-corpo-container">
                <div className="oponente-avatar" style={{ 
                  borderColor: ehVezDele ? '#2ecc71' : '#000', 
                  boxShadow: ehVezDele ? '0 0 15px #2ecc71' : 'none',
                  borderWidth: '3px', borderStyle: 'solid', borderRadius: '50%',
                  backgroundColor: op.corEquipe || '#fff', padding: op.corEquipe ? '4px' : '0px',
                  width: '60px', height: '60px', transition: 'all 0.3s'
                }}>
                  <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${op.avatar}`} style={{ width: '100%', height: '100%', borderRadius: '50%', border: op.corEquipe ? '2px solid #000' : 'none', backgroundColor: '#fff', display: 'block' }} alt="Avatar" />
                </div>
                <div className="player-body" style={{ backgroundColor: op.corEquipe || '#34495e' }}></div>
              </div>
              
              {/* Cartas subidas pela metade do corpo (-20px) */}
              <div className="cartas-oponente" style={{ marginTop: '-20px', zIndex: 3 }}>
                {Array.from({ length: Math.min(op.qtdCartas, 8) }).map((_, i) => (
                  <div key={i} className="carta-verso" style={{ width: '20px', height: '30px', fontSize: '12px', marginLeft: i > 0 ? '-10px' : '0' }}>K</div>
                ))}
                {op.qtdCartas > 8 && <span style={{color: 'white', fontWeight: 'bold', marginLeft: '5px', textShadow: '1px 1px 0 #000'}}>+{op.qtdCartas - 8}</span>}
              </div>
              
              {/* Nomes legíveis: Fundo branco e Letra preta */}
              <div className="oponente-nome" style={{ backgroundColor: '#fff', color: '#000', border: '2px solid #000', borderRadius: '10px', padding: '2px 10px', fontSize: '13px', fontWeight: '900', marginTop: '5px', zIndex: 3, boxShadow: ehVezDele ? '0 0 10px #2ecc71' : '2px 2px 0 #000' }}>
                {op.nome}
              </div>
            </div>
          );
        })}

        {/* CENTRO DA MESA */}
        <div className="centro-mesa" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* SETAS MAIORES */}
          <div style={{ position: 'absolute', opacity: 0.25, pointerEvents: 'none', zIndex: 1 }}>
            {sentido === 1 ? <ArrowsClockwise size={260} color="#fff" className="spin-horario" /> : <ArrowsCounterClockwise size={260} color="#fff" className="spin-anti" />}
          </div>

          {/* BARALHO (Afastado do centro, indo para o canto inferior esquerdo) */}
          <div className="coluna-baralho" style={{ position: 'absolute', bottom: '-20px', left: '-45px', zIndex: 3 }}>
            <div className="icone-baralho" onClick={comprarCarta} style={{ cursor: turnoAtual === socket.id && !eventoNoveAtivo ? 'pointer' : 'default', filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.5))', transform: 'scale(0.85)', transition: 'transform 0.1s' }} onMouseOver={(e) => { if(turnoAtual === socket.id) e.currentTarget.style.transform = 'scale(0.95)' }} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(0.85)'}>
              <Cards size={64} weight="duotone" color="#ecf0f1" />
            </div>
            {turnoAtual === socket.id && !jaComprou && comprasAcumuladas === 0 && cartasSelecionadas.length === 0 && !eventoNoveAtivo && (
              <button className="btn btn-roxo btn-pequeno" onClick={comprarCarta} style={{ position: 'absolute', bottom: '-35px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', padding: '5px 10px', fontSize: '12px' }}>{t.comprar}</button>
            )}
          </div>

          {/* CARTA DA MESA */}
          <div key={cartaMesa?.id || 'mesa'} className="carta carta-mesa anim-play" style={{ zIndex: 2, transform: 'scale(0.85)', backgroundColor: getCorCss(cartaMesa.cor), color: cartaMesa.cor === 'amarelo' ? '#000' : '#fff', boxShadow: '6px 6px 15px rgba(0,0,0,0.5)', margin: 0 }}>
            {renderValorCarta(cartaMesa.valor)}
          </div>
        </div>
      </div>

      {/* EVENTO DO 9 (BOTÃO DE BATER) */}
      {eventoNoveAtivo && (
        <div style={{ position: 'fixed', top: posicaoNove.top, left: posicaoNove.left, transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 2000, pointerEvents: 'none' }}>
          <button onClick={baterNaMesa} disabled={euJaBati} style={{ pointerEvents: 'auto', width: '160px', height: '160px', borderRadius: '50%', border: '8px solid #000', backgroundColor: euJaBati ? '#2ed573' : '#ff4757', boxShadow: euJaBati ? 'inset 4px 4px 10px rgba(0,0,0,0.5)' : '6px 6px 0 #000', cursor: euJaBati ? 'default' : 'pointer', transition: 'all 0.1s', transform: euJaBati ? 'scale(0.9)' : 'scale(1.1)' }}>
            <HandPalm weight="fill" size={96} color="#000" />
          </button>
        </div>
      )}

      {/* A MÃO DE CARTAS DO JOGADOR */}
      <div className="mao-container-moderna">
        {cartasOrdenadas.map((carta, i) => {
          const taSelecionada = cartasSelecionadas.find(c => c.id === carta.id);
          let classes = "carta carta-moderna anim-draw";
          if (taSelecionada) classes += " selecionada";
          if (turnoAtual !== socket.id || eventoNoveAtivo) classes += " desabilitada";
          
          return ( 
            <div 
              key={carta.id} 
              onClick={() => toggleSelecao(carta)} 
              className={classes} 
              style={{ 
                backgroundColor: getCorCss(carta.cor), 
                color: carta.cor === 'amarelo' ? '#000' : '#fff',
                animationDelay: `${i * 0.05}s` 
              }}
            > 
              {renderValorCarta(carta.valor)} 
            </div> 
          );
        })}
      </div>

      {/* PAINEL DE AÇÕES INFERIOR */}
      <div className="painel-acoes" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        {turnoAtual === socket.id && cartasSelecionadas.length > 0 && !eventoNoveAtivo && ( <button className="btn btn-verde" onClick={tentarJogarSelecionadas} style={{ fontSize: '20px', padding: '12px 30px' }}>{t.jogar} ({cartasSelecionadas.length})</button> )}
        {turnoAtual === socket.id && comprasAcumuladas > 0 && !eventoNoveAtivo && ( <button className="btn btn-vermelho" onClick={comprarCarta} style={{ fontSize: '20px', padding: '12px 30px' }}>{t.aceitarPunicao} (+{comprasAcumuladas})</button> )}
        {turnoAtual === socket.id && jaComprou && cartasSelecionadas.length === 0 && comprasAcumuladas === 0 && !eventoNoveAtivo && ( <button className="btn btn-cinza" onClick={passarVez} style={{ fontSize: '20px', padding: '12px 30px' }}>{t.passarVez}</button> )}
      </div>

      {/* MENU DE EMOTES E UNO (Reposicionado e Botão Maior) */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative' }}>
          {emotesAtivos[socket.id] && <div className="emote-anim" style={{ zIndex: 1200 }}>{emotesAtivos[socket.id]}</div>}
          <button
            onClick={() => setMenuEmoteAberto(!menuEmoteAberto)}
            style={{ background: '#fff', border: '4px solid #000', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '4px 4px 0 #000', transition: 'transform 0.1s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          ><Smiley size={40} weight="fill" color="#f1c40f" /></button>
          {menuEmoteAberto && (
            <div style={{ position: 'absolute', bottom: '75px', right: '0', background: '#fff', border: '4px solid #000', borderRadius: '20px', padding: '15px', width: '240px', boxShadow: '6px 6px 0 #000' }}>
              <div className="botoes-emotes-menu">
                {arrayEmojis.map(emo => ( <button key={emo} className="btn-emote" onClick={() => enviarEmote(emo)}>{emo}</button> ))}
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => socket.emit('apertar_uno', props.minhaSala)} 
          style={{ 
            background: '#e74c3c', color: '#fff', fontWeight: '900', fontSize: '24px',
            border: '4px solid #000', borderRadius: '50%', width: '110px', height: '110px', 
            cursor: 'pointer', boxShadow: '4px 4px 0 #000',
            display: 'flex', justifyContent: 'center', alignItems: 'center', textShadow: '2px 2px 0 #000'
          }}
        >
          KAOS!
        </button>
      </div>

      {/* --- MODAIS MANTIDOS INTACTOS A PARTIR DAQUI --- */}
      {filaPassos[0] === 'zero' && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="modal-content" style={{ border: '6px solid #000', borderRadius: '25px', boxShadow: '8px 8px 0 #000' }}>
            <h2 style={{margin: '0 0 15px 0'}}>{t.regraZero}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button className="btn btn-cinza" onClick={() => resolverPasso({ alvoTroca: 'ninguem' })}>{t.nada}</button>
              <button className="btn btn-verde" onClick={() => resolverPasso({ alvoTroca: 'todos' })}>{t.rodarTodas}</button>
            </div>
            <h3 style={{margin: '15px 0 10px 0'}}>{t.ouTrocar}</h3>
            <div className="grid-opcoes-zero">
              {oponentesOrdenados.map(j => (
                <button key={j.id} className="btn btn-azul" onClick={() => resolverPasso({ alvoTroca: j.id })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${j.avatar}`} width="30" height="30" style={{ borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #000' }} alt="Avatar" />
                  {j.nome} ({j.qtdCartas})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filaPassos[0] === 'espiar' && !maoEspiadaPrevia && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="modal-content" style={{ border: '6px solid #000', borderRadius: '25px', boxShadow: '8px 8px 0 #000' }}>
            <h2 style={{margin: '0 0 15px 0'}}><Eye size={32} style={{verticalAlign:'middle'}}/> {t.espiarAlvo}</h2>
            <div className="grid-opcoes-zero">
              {oponentesOrdenados.map(j => (
                <button key={j.id} className="btn btn-roxo" onClick={() => { socket.emit('espiar_cartas_alvo', { codigoSala: props.minhaSala, alvoId: j.id }); props.setPayloadJogada(prev => ({ ...prev, alvoTroca: j.id })); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${j.avatar}`} width="30" height="30" style={{ borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #000' }} alt="Avatar" />
                  {j.nome} ({j.qtdCartas})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {maoEspiadaPrevia && (
        <div className="modal-overlay" style={{ zIndex: 1600, backdropFilter: 'blur(5px)' }}>
          <div className="modal-content" style={{ maxWidth: '600px', border: '6px solid #000', borderRadius: '25px', boxShadow: '8px 8px 0 #000' }}>
            <h2 style={{ marginBottom: '15px' }}>Cartas de {maoEspiadaPrevia.nome}:</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {maoEspiadaPrevia.cartas.map(c => ( 
                <div key={c.id} className="carta" style={{ backgroundColor: getCorCss(c.originalCor || c.cor), color: c.cor === 'amarelo' ? '#000' : '#fff', transform: 'scale(0.8)', margin: '-10px' }}> 
                  {renderValorCarta(c.originalValor || c.valor)} 
                </div> 
              ))}
            </div>
            <button className="btn btn-azul" style={{ marginTop: '20px' }} onClick={() => { setMaoEspiadaPrevia(null); resolverPasso({}); }}>{t.fechar}</button>
          </div>
        </div>
      )}

      {filaPassos[0] === 'igualar' && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="modal-content" style={{ border: '6px solid #000', borderRadius: '25px', boxShadow: '8px 8px 0 #000' }}>
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
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="modal-content" style={{ border: '6px solid #000', borderRadius: '25px', boxShadow: '8px 8px 0 #000' }}>
            <h2 style={{margin: '0 0 5px 0'}}><Hash size={32} style={{verticalAlign:'middle'}}/> {t.escolherNumTitulo}</h2>
            <p style={{marginBottom: '15px'}}>{t.escolherNumDesc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
              {['0','1','2','3','4','5','6','7','8','9'].map(num => ( 
                <button key={num} onClick={() => resolverPasso({ alvoNumero: num })} style={{ width: '50px', height: '50px', fontSize: '24px', fontWeight: 'bold', backgroundColor: '#ecf0f1', border: '3px solid #000', borderRadius: '10px', cursor: 'pointer', boxShadow: '3px 3px 0 #000', transition: 'transform 0.1s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}> 
                  {num} 
                </button> 
              ))}
            </div>
          </div>
        </div>
      )}

      {filaPassos[0] === 'cor' && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="modal-content" style={{ border: '6px solid #000', borderRadius: '25px', boxShadow: '8px 8px 0 #000' }}>
            <h2>{t.escolhaCor}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              {['vermelho', 'azul', 'verde', 'amarelo'].map(cor => ( 
                <button key={cor} onClick={() => resolverPasso({ novaCor: cor })} style={{ width: '70px', height: '70px', backgroundColor: getCorCss(cor), border: '4px solid #000', borderRadius: '15px', cursor: 'pointer', boxShadow: '4px 4px 0 #000', transition: 'transform 0.1s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}></button> 
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}