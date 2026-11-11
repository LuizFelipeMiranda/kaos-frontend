import { useMemo } from 'react';
import { HandPalm, ArrowsClockwise, ArrowsCounterClockwise, Hourglass, Timer, Eye, Scales, Hash, Smiley } from '@phosphor-icons/react';
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
      if (ordemCores[a.cor] !== ordemCores[b.cor]) return (ordemCores[a.cor] || 99) - (ordemCores[b.cor] || 99);
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
    <div style={{ textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Top Bar ESQUERDA (Tempo e Equipa) */}
      <div style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 100, display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ fontWeight: '900', color: '#fff', backgroundColor: '#2c3e50', padding: '6px 15px', borderRadius: '15px', border: '3px solid #000', boxShadow: '3px 3px 0 #000', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Timer size={16} weight="bold" /> {Math.floor(tempoPartida / 60)}:{(tempoPartida % 60).toString().padStart(2, '0')}
        </div>
        {meuJogadorInfo?.corEquipe && (
          <div style={{ fontWeight: '900', color: '#fff', backgroundColor: '#2c3e50', padding: '6px 15px', borderRadius: '15px', border: '3px solid #000', boxShadow: `3px 3px 0 ${meuJogadorInfo.corEquipe}`, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: meuJogadorInfo.corEquipe, border: '2px solid #fff' }} /> EQUIPE
          </div>
        )}
      </div>

      {/* Top Bar DIREITA (Indicador de Turno - Sem fundo branco no temporizador) */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 100 }}>
        <div className="status-turno-box" style={{ 
          backgroundColor: '#2ecc71', color: '#fff', border: '4px solid #000', borderRadius: '15px', 
          padding: '8px 15px', fontWeight: '900', boxShadow: '3px 3px 0 #000', textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', textShadow: '1px 1px 0 #000' }}>
            {turnoAtual === socket.id ? t.suaVez : jogadorDaVez ? `${t.vezDe} ${jogadorDaVez.nome.toUpperCase()}` : t.aguarde}
          </div>
          
          <div style={{ color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px', textShadow: '1px 1px 0 #000' }}>
            {eventoNoveAtivo ? <span>PAUSA!</span> : <><Hourglass size={14} weight="bold" /> {tempoTurnoRestante}s</>}
          </div>
        </div>
      </div>

      {/* ÁREA CENTRAL - MESA DE MADEIRA (Ajustada para não haver scroll) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <div className="mesa-redonda-moderna">
          {oponentesOrdenados.map((op, index) => {
            const ehVezDele = turnoAtual === op.id;
            return (
              <div key={op.id} className="oponente-container" style={getPosicaoOponente(index, oponentesOrdenados.length)}>
                {emotesAtivos[op.id] && <div className="emote-anim">{emotesAtivos[op.id]}</div>}
                
                <div className="oponente-corpo-container">
                  <div className="oponente-avatar" style={{ 
                    borderColor: ehVezDele ? '#2ecc71' : '#000', boxShadow: ehVezDele ? '0 0 15px #2ecc71' : 'none',
                    borderWidth: '3px', borderStyle: 'solid', borderRadius: '50%', backgroundColor: op.corEquipe || '#fff', 
                    padding: op.corEquipe ? '4px' : '0px', width: '50px', height: '50px', transition: 'all 0.3s'
                  }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${op.avatar}`} style={{ width: '100%', height: '100%', borderRadius: '50%', border: op.corEquipe ? '2px solid #000' : 'none', backgroundColor: '#fff', display: 'block' }} alt="Avatar" />
                  </div>
                  <div className="player-body" style={{ backgroundColor: op.corEquipe || '#34495e', width: '60px', height: '35px' }}></div>
                </div>
                
                <div className="cartas-oponente" style={{ marginTop: '-15px', zIndex: 3 }}>
                  {Array.from({ length: Math.min(op.qtdCartas, 8) }).map((_, i) => (
                    <div key={i} className="carta-verso" style={{ width: '16px', height: '24px', fontSize: '10px', marginLeft: i > 0 ? '-8px' : '0' }}>K</div>
                  ))}
                  {op.qtdCartas > 8 && <span style={{color: 'white', fontWeight: 'bold', marginLeft: '5px', fontSize: '12px', textShadow: '1px 1px 0 #000'}}>+{op.qtdCartas - 8}</span>}
                </div>
                
                <div className="oponente-nome" style={{ backgroundColor: '#fff', color: '#000', border: '2px solid #000', borderRadius: '10px', padding: '2px 8px', fontSize: '11px', fontWeight: '900', marginTop: '3px', zIndex: 3, boxShadow: ehVezDele ? '0 0 8px #2ecc71' : '2px 2px 0 #000' }}>
                  {op.nome}
                </div>
              </div>
            );
          })}

          {/* CENTRO DA MESA */}
          <div className="centro-mesa" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            
            {/* SETAS DE DIREÇÃO */}
            <div style={{ position: 'absolute', opacity: 0.25, pointerEvents: 'none', zIndex: 1 }}>
              {sentido === 1 ? <ArrowsClockwise size={220} color="#fff" className="spin-horario" /> : <ArrowsCounterClockwise size={220} color="#fff" className="spin-anti" />}
            </div>

            {/* CARTA DA MESA (Centralizada) */}
            <div key={cartaMesa?.id || 'mesa'} className="carta carta-mesa" style={{ zIndex: 2, transform: 'scale(0.9)', backgroundColor: getCorCss(cartaMesa.cor), color: cartaMesa.cor === 'amarelo' ? '#000' : '#fff', boxShadow: '6px 6px 15px rgba(0,0,0,0.5)', margin: 0 }}>
              {renderValorCarta(cartaMesa.valor)}
            </div>

            {/* MONTE DE COMPRA (Canto inferior esquerdo e visual Kaos) */}
            <div style={{ position: 'absolute', bottom: '15%', left: '20%', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                className="baralho-kaos" 
                onClick={comprarCarta} 
                style={{ cursor: turnoAtual === socket.id && !eventoNoveAtivo ? 'pointer' : 'default' }}
              >
                <span className="k-logo">K</span>
              </div>
              
              {turnoAtual === socket.id && !jaComprou && comprasAcumuladas === 0 && cartasSelecionadas.length === 0 && !eventoNoveAtivo && (
                <button className="btn btn-roxo btn-pequeno" onClick={comprarCarta} style={{ position: 'absolute', bottom: '-30px', whiteSpace: 'nowrap', padding: '4px 8px', fontSize: '11px', margin: 0 }}>{t.comprar}</button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ÁREA INFERIOR (Apenas Cartas e Botões - Sem causar overflow) */}
      <div style={{ paddingBottom: '10px' }}>
        
        {/* A MÃO DE CARTAS DO JOGADOR */}
        <div className="mao-container-moderna">
          {cartasOrdenadas.map((carta) => {
            const taSelecionada = cartasSelecionadas.find(c => c.id === carta.id);
            let classes = "carta carta-moderna";
            if (taSelecionada) classes += " selecionada";
            if (turnoAtual !== socket.id || eventoNoveAtivo) classes += " desabilitada";
            
            return ( 
              <div 
                key={carta.id} 
                onClick={() => toggleSelecao(carta)} 
                className={classes} 
                style={{ 
                  backgroundColor: getCorCss(carta.cor), 
                  color: carta.cor === 'amarelo' ? '#000' : '#fff'
                }}
              > 
                {renderValorCarta(carta.valor)} 
              </div> 
            );
          })}
        </div>

        {/* PAINEL DE AÇÕES INFERIOR */}
        <div className="painel-acoes" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
          {turnoAtual === socket.id && cartasSelecionadas.length > 0 && !eventoNoveAtivo && ( <button className="btn btn-verde" onClick={tentarJogarSelecionadas} style={{ fontSize: '16px', padding: '10px 20px' }}>{t.jogar} ({cartasSelecionadas.length})</button> )}
          {turnoAtual === socket.id && comprasAcumuladas > 0 && !eventoNoveAtivo && ( <button className="btn btn-vermelho" onClick={comprarCarta} style={{ fontSize: '16px', padding: '10px 20px' }}>{t.aceitarPunicao} (+{comprasAcumuladas})</button> )}
          {turnoAtual === socket.id && jaComprou && cartasSelecionadas.length === 0 && comprasAcumuladas === 0 && !eventoNoveAtivo && ( <button className="btn btn-cinza" onClick={passarVez} style={{ fontSize: '16px', padding: '10px 20px' }}>{t.passarVez}</button> )}
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

      {/* MENU DE EMOTES E UNO (Fixos no canto) */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <div style={{ position: 'relative' }}>
          {emotesAtivos[socket.id] && <div className="emote-anim" style={{ zIndex: 1200 }}>{emotesAtivos[socket.id]}</div>}
          <button
            onClick={() => setMenuEmoteAberto(!menuEmoteAberto)}
            style={{ background: '#fff', border: '3px solid #000', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '3px 3px 0 #000', transition: 'transform 0.1s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          ><Smiley size={32} weight="fill" color="#f1c40f" /></button>
          {menuEmoteAberto && (
            <div style={{ position: 'absolute', bottom: '65px', right: '0', background: '#fff', border: '4px solid #000', borderRadius: '15px', padding: '10px', width: '200px', boxShadow: '6px 6px 0 #000' }}>
              <div className="botoes-emotes-menu" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
                {arrayEmojis.map(emo => ( <button key={emo} className="btn-emote" onClick={() => enviarEmote(emo)} style={{ fontSize: '20px' }}>{emo}</button> ))}
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => socket.emit('apertar_uno', props.minhaSala)} 
          style={{ 
            background: '#e74c3c', color: '#fff', fontWeight: '900', fontSize: '20px',
            border: '4px solid #000', borderRadius: '50%', width: '90px', height: '90px', 
            cursor: 'pointer', boxShadow: '4px 4px 0 #000', display: 'flex', justifyContent: 'center', alignItems: 'center', textShadow: '2px 2px 0 #000'
          }}
        >
          KAOS!
        </button>
      </div>

      {/* --- MODAIS DE AÇÃO --- */}
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