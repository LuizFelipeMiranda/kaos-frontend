import { useMemo } from 'react';
import { HandPalm, ArrowsClockwise, ArrowsCounterClockwise, Hourglass, Timer, Eye, Scales, Hash, Smiley } from '@phosphor-icons/react';
import { getCorCss, renderValorCarta, getPosicaoOponente, arrayEmojis } from '../utils/gameUtils';

export default function Table(props) {
  const {
    t, socket, tempoPartida, turnoAtual, eventoNoveAtivo,
    tempoTurnoRestante, oponentesOrdenados, emotesAtivos, menuEmoteAberto, setMenuEmoteAberto,
    enviarEmote, baterNaMesa, euJaBati, posicaoNove, minhaMao, cartasSelecionadas,
    toggleSelecao, tentarJogarSelecionadas, comprasAcumuladas, comprarCarta, jaComprou,
    passarVez, cartaMesa, sentido, filaPassos, resolverPasso, maoEspiadaPrevia,
    setMaoEspiadaPrevia, vencedor, setVencedor, setJogoIniciado, setTempoPartida, jogadorDaVez
  } = props;

  // ORDENAÇÃO AUTOMÁTICA DAS CARTAS POR COR
  const cartasOrdenadas = useMemo(() => {
    const ordemCores = { vermelho: 1, amarelo: 2, azul: 3, verde: 4, preto: 5 };
    return [...minhaMao].sort((a, b) => {
      if (ordemCores[a.cor] !== ordemCores[b.cor]) return (ordemCores[a.cor] || 99) - (ordemCores[b.cor] || 99);
      return a.valor.toString().localeCompare(b.valor.toString());
    });
  }, [minhaMao]);

  if (vencedor) {
    return (
      <div className="container" style={{ marginTop: '100px' }}>
        <h1 className="logo-kaos"><div className="carta-k-logo">K</div>AOS</h1>
        <h1 style={{ fontSize: '40px', color: '#f1c40f' }}>🏆 {t.vencedor} 🏆</h1>
        <h2>{vencedor} {t.acabouCartas}</h2>
        <button className="btn btn-azul" onClick={() => { setVencedor(null); setJogoIniciado(false); setTempoPartida(0); }}>{t.voltarLobby}</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '10px auto' }}>
      
      {/* Topo: Relógio e Turno */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Timer size={20} /> {Math.floor(tempoPartida / 60)}:{(tempoPartida % 60).toString().padStart(2, '0')}
        </div>
        
        <div className={`status-turno ${turnoAtual === socket.id ? 'minha-vez' : ''}`}>
          {turnoAtual === socket.id ? t.suaVez : jogadorDaVez ? `${t.vezDe} ${jogadorDaVez.nome.toUpperCase()}` : t.aguarde}
          {!eventoNoveAtivo && <span style={{ marginLeft: '10px' }}><Hourglass size={16} style={{ verticalAlign: 'middle' }} /> {tempoTurnoRestante}s</span>}
        </div>
      </div>

      {/* MESA DE JOGO ORIGINAL */}
      <div className="mesa-redonda">
        {oponentesOrdenados.map((op, index) => {
          const ehVezDele = turnoAtual === op.id;
          return (
            <div key={op.id} className="oponente-container" style={getPosicaoOponente(index, oponentesOrdenados.length)}>
              {emotesAtivos[op.id] && <div className="emote-anim">{emotesAtivos[op.id]}</div>}
              
              <div className="oponente-avatar" style={{ borderColor: ehVezDele ? '#2ecc71' : '#000', boxShadow: ehVezDele ? '0 0 10px #2ecc71' : '4px 4px 0 #000' }}>
                <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${op.avatar}`} width="60" height="60" alt="Avatar" />
              </div>
              
              <div className="cartas-oponente">
                {Array.from({ length: Math.min(op.qtdCartas, 8) }).map((_, i) => (
                  <div key={i} className="carta-verso">K</div>
                ))}
                {op.qtdCartas > 8 && <span style={{ color: 'white', fontWeight: 'bold', fontSize: '11px', marginLeft: '4px' }}>+{op.qtdCartas - 8}</span>}
              </div>
              
              <div className="oponente-nome">{op.nome}</div>
            </div>
          );
        })}

        {/* CENTRO DA MESA ORIGINAL */}
        <div className="centro-mesa">
          <div className="direcao-indicador" style={{ position: 'absolute' }}>
            {sentido === 1 ? <ArrowsClockwise size={280} className="spin-horario" /> : <ArrowsCounterClockwise size={280} className="spin-anti" />}
          </div>

          <div className="coluna-baralho" onClick={comprarCarta} style={{ cursor: turnoAtual === socket.id && !eventoNoveAtivo ? 'pointer' : 'default', zIndex: 2 }}>
            <div className="icone-baralho">
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#bdc3c7' }}>K</span>
            </div>
            {turnoAtual === socket.id && !jaComprou && comprasAcumuladas === 0 && cartasSelecionadas.length === 0 && !eventoNoveAtivo && (
              <button className="btn btn-roxo btn-pequeno">{t.comprar}</button>
            )}
          </div>

          <div key={cartaMesa?.id || 'mesa'} className="carta carta-mesa animate-drop" style={{ backgroundColor: getCorCss(cartaMesa.cor), color: cartaMesa.cor === 'amarelo' ? '#000' : '#fff', zIndex: 2 }}>
            {renderValorCarta(cartaMesa.valor)}
          </div>
        </div>
      </div>

      {/* EVENTO DO 9 */}
      {eventoNoveAtivo && (
        <div style={{ position: 'fixed', top: posicaoNove.top, left: posicaoNove.left, transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 2000, pointerEvents: 'none' }}>
          <button onClick={baterNaMesa} disabled={euJaBati} style={{ pointerEvents: 'auto', width: '160px', height: '160px', borderRadius: '50%', border: '8px solid #000', backgroundColor: euJaBati ? '#2ed573' : '#ff4757', boxShadow: euJaBati ? 'inset 4px 4px 10px rgba(0,0,0,0.5)' : '6px 6px 0 #000', cursor: euJaBati ? 'default' : 'pointer' }}>
            <HandPalm weight="fill" size={96} color="#000" />
          </button>
        </div>
      )}

      {/* MÃO DE CARTAS DO JOGADOR (ORDENADA POR CORES) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '20px', minHeight: '130px', alignItems: 'flex-end' }}>
        {cartasOrdenadas.map((carta) => {
          const taSelecionada = cartasSelecionadas.find(c => c.id === carta.id);
          let classes = "carta";
          if (taSelecionada) classes += " selecionada";
          if (turnoAtual !== socket.id || eventoNoveAtivo) classes += " desabilitada";

          return (
            <div 
              key={carta.id} 
              onClick={() => toggleSelecao(carta)} 
              className={classes} 
              style={{ backgroundColor: getCorCss(carta.cor), color: carta.cor === 'amarelo' ? '#000' : '#fff' }}
            >
              {renderValorCarta(carta.valor)}
            </div>
          );
        })}
      </div>

      {/* PAINEL DE AÇÕES */}
      <div className="painel-acoes">
        {turnoAtual === socket.id && cartasSelecionadas.length > 0 && !eventoNoveAtivo && (
          <button className="btn btn-verde" onClick={tentarJogarSelecionadas}>{t.jogar} ({cartasSelecionadas.length})</button>
        )}
        {turnoAtual === socket.id && comprasAcumuladas > 0 && !eventoNoveAtivo && (
          <button className="btn btn-vermelho" onClick={comprarCarta}>{t.aceitarPunicao} (+{comprasAcumuladas})</button>
        )}
        {turnoAtual === socket.id && jaComprou && cartasSelecionadas.length === 0 && comprasAcumuladas === 0 && !eventoNoveAtivo && (
          <button className="btn btn-cinza" onClick={passarVez}>{t.passarVez}</button>
        )}
      </div>

      {/* BOTÃO KAOS E EMOTES */}
      <button className="btn-uno" onClick={() => socket.emit('apertar_uno', props.minhaSala)}>KAOS!</button>
      
      <div style={{ position: 'fixed', bottom: '120px', right: '20px', zIndex: 1000 }}>
        <button className="btn btn-pequeno" onClick={() => setMenuEmoteAberto(!menuEmoteAberto)} style={{ borderRadius: '50%', width: '50px', height: '50px', background: '#fff' }}>
          <Smiley size={30} color="#f1c40f" weight="fill" />
        </button>
        {menuEmoteAberto && (
          <div style={{ position: 'absolute', bottom: '60px', right: '0', background: '#fff', border: '3px solid #000', borderRadius: '15px', padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', boxShadow: '4px 4px 0 #000' }}>
            {arrayEmojis.map(emo => (
              <button key={emo} onClick={() => enviarEmote(emo)} style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>{emo}</button>
            ))}
          </div>
        )}
      </div>

      {/* MODAIS (Regra Zero, Espiar, Igualar, etc.) */}
      {filaPassos[0] === 'zero' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{t.regraZero}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '15px 0' }}>
              <button className="btn btn-cinza" onClick={() => resolverPasso({ alvoTroca: 'ninguem' })}>{t.nada}</button>
              <button className="btn btn-verde" onClick={() => resolverPasso({ alvoTroca: 'todos' })}>{t.rodarTodas}</button>
            </div>
            <h3>{t.ouTrocar}</h3>
            <div className="grid-opcoes-zero">
              {oponentesOrdenados.map(j => (
                <button key={j.id} className="btn btn-azul" onClick={() => resolverPasso({ alvoTroca: j.id })}>{j.nome} ({j.qtdCartas})</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filaPassos[0] === 'espiar' && !maoEspiadaPrevia && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2><Eye size={32} style={{ verticalAlign: 'middle' }} /> {t.espiarAlvo}</h2>
            <div className="grid-opcoes-zero">
              {oponentesOrdenados.map(j => (
                <button key={j.id} className="btn btn-roxo" onClick={() => { socket.emit('espiar_cartas_alvo', { codigoSala: props.minhaSala, alvoId: j.id }); props.setPayloadJogada(prev => ({ ...prev, alvoTroca: j.id })); }}>{j.nome}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {maoEspiadaPrevia && (
        <div className="modal-overlay" style={{ zIndex: 1600 }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2>Cartas de {maoEspiadaPrevia.nome}:</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
              {maoEspiadaPrevia.cartas.map(c => (
                <div key={c.id} className="carta" style={{ backgroundColor: getCorCss(c.originalCor || c.cor), color: c.cor === 'amarelo' ? '#000' : '#fff', transform: 'scale(0.8)' }}>
                  {renderValorCarta(c.originalValor || c.valor)}
                </div>
              ))}
            </div>
            <button className="btn btn-azul" onClick={() => { setMaoEspiadaPrevia(null); resolverPasso({}); }}>{t.fechar}</button>
          </div>
        </div>
      )}

      {filaPassos[0] === 'igualar' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2><Scales size={32} style={{ verticalAlign: 'middle' }} /> {t.igualarTitulo}</h2>
            <p>{t.igualarDesc}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
              <button className="btn btn-verde" onClick={() => resolverPasso({ alvoOpcao: 'maior' })}>{t.igualarMaior}</button>
              <button className="btn btn-vermelho" onClick={() => resolverPasso({ alvoOpcao: 'menor' })}>{t.igualarMenor}</button>
            </div>
          </div>
        </div>
      )}

      {filaPassos[0] === 'numero' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2><Hash size={32} style={{ verticalAlign: 'middle' }} /> {t.escolherNumTitulo}</h2>
            <p>{t.escolherNumDesc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', maxWidth: '300px', margin: '15px auto' }}>
              {['0','1','2','3','4','5','6','7','8','9'].map(num => (
                <button key={num} onClick={() => resolverPasso({ alvoNumero: num })} style={{ width: '45px', height: '45px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#ecf0f1', border: '3px solid #000', borderRadius: '10px', cursor: 'pointer' }}>{num}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filaPassos[0] === 'cor' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{t.escolhaCor}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
              {['vermelho', 'azul', 'verde', 'amarelo'].map(cor => (
                <button key={cor} onClick={() => resolverPasso({ novaCor: cor })} style={{ width: '60px', height: '60px', backgroundColor: getCorCss(cor), border: '3px solid #000', borderRadius: '12px', cursor: 'pointer' }}></button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}