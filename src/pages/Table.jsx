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

  if (vencedor) {
    return (
      <div className="container" style={{ marginTop: '100px' }}>
        <h1 className="logo-kaos"><div className="carta-k-logo">K</div>AOS</h1>
        <h1 style={{ fontSize: '50px', color: '#f1c40f' }}>🏆 {t.vencedor} 🏆</h1>
        <h2 style={{ fontSize: '40px' }}>{vencedor} {t.acabouCartas}</h2>
        <button className="btn btn-azul" onClick={() => { setVencedor(null); setJogoIniciado(false); setTempoPartida(0); }}>{t.voltarLobby}</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '10px' }}>
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
              
              <div className="oponente-avatar" style={{ 
                position: 'relative', 
                borderColor: ehVezDele ? '#2ecc71' : '#000', 
                boxShadow: ehVezDele ? '0 0 15px #2ecc71' : '4px 4px 0 #000',
                borderWidth: '3px',
                borderStyle: 'solid',
                borderRadius: '50%',
                backgroundColor: op.corEquipe || 'transparent',
                padding: op.corEquipe ? '4px' : '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${op.avatar}`} 
                  style={{
                    width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#fff',
                    border: op.corEquipe ? '2px solid #000' : 'none', boxSizing: 'border-box', display: 'block'
                  }} 
                  alt="Avatar"
                />
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
          ><Smiley size={36} weight="fill" color="#f1c40f" /></button>
          {menuEmoteAberto && (
            <div style={{ position: 'absolute', bottom: '65px', right: '0', background: '#fff', border: '3px solid #000', borderRadius: '15px', padding: '10px', width: '210px', boxShadow: '4px 4px 0 #000' }}>
              <div className="botoes-emotes-menu">
                {arrayEmojis.map(emo => ( <button key={emo} className="btn-emote" onClick={() => enviarEmote(emo)}>{emo}</button> ))}
              </div>
            </div>
          )}
        </div>
        <button className="btn-uno" onClick={() => socket.emit('apertar_uno', props.minhaSala)} style={{ position: 'static' }}>KAOS!</button>
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
                  <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${j.avatar}`} width="30" height="30" style={{ borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #000' }} alt="Avatar" />
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
            <button className="btn btn-azul" style={{ marginTop: '20px' }} onClick={() => { setMaoEspiadaPrevia(null); resolverPasso({}); }}>{t.fechar}</button>
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
          <button onClick={baterNaMesa} disabled={euJaBati} style={{ pointerEvents: 'auto', width: '160px', height: '160px', borderRadius: '50%', border: '8px solid #000', backgroundColor: euJaBati ? '#2ed573' : '#ff4757', boxShadow: '6px 6px 0 #000', cursor: euJaBati ? 'default' : 'pointer', transition: 'all 0.1s', transform: euJaBati ? 'scale(0.9)' : 'scale(1.1)' }}>
            <HandPalm weight="fill" size={96} color="#000" />
          </button>
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
        {turnoAtual === socket.id && cartasSelecionadas.length > 0 && !eventoNoveAtivo && ( <button className="btn btn-verde" onClick={tentarJogarSelecionadas}>{t.jogar} ({cartasSelecionadas.length}) {t.cartas}</button> )}
        {turnoAtual === socket.id && comprasAcumuladas > 0 && !eventoNoveAtivo && ( <button className="btn btn-vermelho" onClick={comprarCarta}>{t.aceitarPunicao} (+{comprasAcumuladas})</button> )}
        {turnoAtual === socket.id && jaComprou && cartasSelecionadas.length === 0 && comprasAcumuladas === 0 && !eventoNoveAtivo && ( <button className="btn btn-cinza" onClick={passarVez}>{t.passarVez}</button> )}
      </div>

    </div>
  );
}