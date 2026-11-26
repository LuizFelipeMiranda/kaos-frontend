import { useMemo } from 'react';
import { HandPalm, ArrowsClockwise, ArrowsCounterClockwise, Hourglass, Timer, Eye, Scales, Hash, Smiley, Skull, Medal, Trophy } from '@phosphor-icons/react';
import { getCorCss, renderValorCarta, getPosicaoOponente, arrayEmojis } from '../utils/gameUtils';

export default function Table(props) {
  const {
    t, socket, minhaSala, tempoPartida, meuJogadorInfo, turnoAtual, eventoNoveAtivo,
    tempoTurnoRestante, oponentesOrdenados, emotesAtivos, menuEmoteAberto, setMenuEmoteAberto,
    enviarEmote, baterNaMesa, euJaBati, posicaoNove, minhaMao, cartasSelecionadas,
    toggleSelecao, tentarJogarSelecionadas, comprasAcumuladas, comprarCarta, jaComprou,
    passarVez, cartaMesa, sentido, filaPassos, resolverPasso, maoEspiadaPrevia,
    setMaoEspiadaPrevia, vencedor, setVencedor, setJogoIniciado, setTempoPartida, jogadorDaVez, 
    jogadaBossAtiva, eventoAleatorioAtivo, regrasSelecionadas, tempoEventoRestante,
    modoLiga, nomeLiga, totalPartidas, partidaAtual, emDesempate, campeoesLiga, setCampeoesLiga
  } = props;

  const cartasOrdenadas = useMemo(() => {
    const ordemCores = { vermelho: 1, amarelo: 2, azul: 3, verde: 4, preto: 5 };
    return [...minhaMao].sort((a, b) => {
      if (ordemCores[a.cor] !== ordemCores[b.cor]) return (ordemCores[a.cor] || 99) - (ordemCores[b.cor] || 99);
      return a.valor.toString().localeCompare(b.valor.toString());
    });
  }, [minhaMao]);

  const renderMedalhaPodio = (posicao) => {
    if (!posicao) return null;
    const cores = { 1: '#f1c40f', 2: '#bdc3c7', 3: '#cd7f32' };
    const titulos = { 1: '1º Lugar (Ouro)', 2: '2º Lugar (Prata)', 3: '3º Lugar (Bronze)' };
    return (
      <div
        className="medalha-podio"
        title={titulos[posicao]}
        style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          backgroundColor: cores[posicao] || '#95a5a6',
          border: '3px solid #000',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '2px 2px 0 #000',
          zIndex: 20
        }}
      >
        <Medal size={17} weight="fill" color="#000" />
      </div>
    );
  };

  // TELA ESPECIAL DE VITÓRIA FINAL DA LIGA DO KAOS
  if (campeoesLiga) {
    const textoParabens = campeoesLiga.formato === 'duplas'
      ? `Parabéns à dupla de "${campeoesLiga.campeoes[0]}" e "${campeoesLiga.campeoes[1]}", vocês venceram a "${campeoesLiga.nomeLiga}"!`
      : `Parabéns jogador "${campeoesLiga.campeoes[0]}", você venceu a "${campeoesLiga.nomeLiga}"!`;

    return (
      <div className="container" style={{ marginTop: '30px', maxWidth: '620px', border: '6px solid #000', backgroundColor: '#fffdf0', boxShadow: '10px 10px 0 #000' }}>
        <h1 className="logo-kaos" style={{ marginBottom: '10px', fontSize: '65px' }}><div className="carta-k-logo k-animado">K</div>AOS</h1>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1c40f', border: '3px solid #000', borderRadius: '15px', padding: '8px 20px', fontWeight: '900', fontSize: '18px', boxShadow: '4px 4px 0 #000', marginBottom: '15px' }}>
          <Trophy size={24} weight="fill" /> CAMPEÕES DA LIGA <Trophy size={24} weight="fill" />
        </div>

        <h2 style={{ fontSize: '24px', color: '#2c3e50', lineHeight: '1.35', margin: '10px 0 20px 0', padding: '0 10px' }}>
          {textoParabens}
        </h2>

        <div style={{ backgroundColor: '#fff', border: '4px solid #000', borderRadius: '18px', padding: '15px', marginBottom: '25px', textAlign: 'left', boxShadow: '4px 4px 0 #000' }}>
          <h3 style={{ margin: '0 0 12px 0', textAlign: 'center', fontSize: '18px' }}>Classificação Final — {campeoesLiga.nomeLiga}</h3>
          {campeoesLiga.ranking.map((item) => (
            <div key={item.pos} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '2px dashed #ecf0f1', fontWeight: item.pos === 1 ? '900' : 'bold', fontSize: item.pos === 1 ? '18px' : '15px', color: item.pos === 1 ? '#d35400' : '#2c3e50' }}>
              <span>{item.pos === 1 ? '🥇' : item.pos === 2 ? '🥈' : item.pos === 3 ? '🥉' : `${item.pos}º`} {item.nome}</span>
              <span>{item.pontos} pts</span>
            </div>
          ))}
        </div>

        <button
          className="btn btn-azul"
          style={{ fontSize: '18px', padding: '12px 28px' }}
          onClick={() => {
            setCampeoesLiga(null);
            setVencedor(null);
            setJogoIniciado(false);
            setTempoPartida(0);
          }}
        >
          {t.voltarLobby}
        </button>
      </div>
    );
  }

  if (vencedor) {
    return (
      <div className="container" style={{ marginTop: '100px' }}>
        <h1 className="logo-kaos"><div className="carta-k-logo">K</div>AOS</h1>
        <h1 style={{ fontSize: '40px', color: '#f1c40f' }}>
          🏆 {modoLiga ? (emDesempate ? 'EMPATE NA LIGA!' : `FIM DA PARTIDA ${partidaAtual - 1}/${totalPartidas}`) : 'VENCEDOR'} 🏆
        </h1>
        <h2 style={{ fontSize: '26px', lineHeight: '1.3' }}>{vencedor}</h2>
        <button className="btn btn-azul" onClick={() => { setVencedor(null); setJogoIniciado(false); setTempoPartida(0); }}>{t.voltarLobby}</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '10px' }}>
      
      {eventoAleatorioAtivo && (
        <div className="modal-overlay" style={{ zIndex: 5000, backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="modal-content pulsar" style={{ border: '8px solid #9b59b6', backgroundColor: '#fffdf0', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '36px', margin: '0 0 15px 0', color: '#9b59b6' }}>{eventoAleatorioAtivo.titulo}</h1>
            <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{eventoAleatorioAtivo.descricao}</p>
            <div style={{ fontSize: '60px', marginTop: '20px' }}>⏳</div>
          </div>
        </div>
      )}

      {/* Container Topo Esquerda */}
      <div className="hud-topo-esquerdo" style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 100, display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="hud-badge" style={{ fontWeight: '900', color: '#fff', backgroundColor: '#2c3e50', padding: '8px 20px', borderRadius: '15px', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={20} weight="bold" /> {t.tempo}: {Math.floor(tempoPartida / 60)}:{(tempoPartida % 60).toString().padStart(2, '0')}
        </div>

        {regrasSelecionadas === 'kaos_aleatorio' && (
          <div className="hud-badge" style={{ backgroundColor: '#9b59b6', color: '#fff', padding: '8px 20px', borderRadius: '15px', border: '3px solid #000', fontWeight: 'bold', fontSize: '16px', boxShadow: '4px 4px 0 #000', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Próximo Kaos: {eventoAleatorioAtivo ? 'AGORA!' : `${tempoEventoRestante}s`}
          </div>
        )}

        {meuJogadorInfo?.isBoss && (
          <div className="hud-badge" style={{ fontWeight: '900', color: '#fff', backgroundColor: '#e74c3c', padding: '8px 20px', borderRadius: '15px', border: '3px solid #000', boxShadow: `4px 4px 0 #000`, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Skull size={20} weight="bold" /> VOCÊ É O CHEFÃO
          </div>
        )}

        {meuJogadorInfo?.posicaoPodio && (
          <div className="hud-badge" style={{ fontWeight: '900', color: '#fff', backgroundColor: '#27ae60', padding: '8px 18px', borderRadius: '15px', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Medal size={18} weight="fill" /> {meuJogadorInfo.posicaoPodio}º Lugar! Aguardando pódio...
          </div>
        )}
      </div>

      {/* Container Inferior Esquerda - Nome da Liga (acima) e Código da Sala (abaixo) */}
      {(minhaSala || modoLiga) && (
        <div className="hud-inferior-esquerdo" style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
          {modoLiga && (
            <div className="hud-badge" style={{ fontWeight: '900', color: '#000', backgroundColor: '#f1c40f', padding: '7px 16px', borderRadius: '14px', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={17} weight="fill" /> {nomeLiga} {emDesempate ? '(Desempate)' : `(${partidaAtual}/${totalPartidas})`}
            </div>
          )}

          {minhaSala && (
            <div className="hud-badge" style={{ fontWeight: '900', color: '#fff', backgroundColor: '#2c3e50', padding: '8px 20px', borderRadius: '15px', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Sala: <span style={{ color: '#f1c40f' }}>{minhaSala}</span>
            </div>
          )}
        </div>
      )}

      {/* Container Topo Direita - Aviso de Vez */}
      <div className="hud-topo-direito" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
        <div className={`status-turno status-turno-box ${turnoAtual === socket.id ? 'minha-vez' : ''}`} style={{ margin: 0 }}>
          <div>
            {turnoAtual === socket.id ? 
              (meuJogadorInfo?.isBoss ? `SUA VEZ (JOGADA ${jogadaBossAtiva}/2)` : t.suaVez) 
              : jogadorDaVez ? `${t.vezDe} ${jogadorDaVez.nome.toUpperCase()} ${jogadorDaVez.isBoss ? `(JOGADA ${jogadaBossAtiva}/2)` : ''}` : t.aguarde}
          </div>
          <div className="tempo" style={{ color: turnoAtual === socket.id ? '#000' : '#ff7675', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            {eventoNoveAtivo || eventoAleatorioAtivo ? <span style={{fontWeight: 'bold'}}>PAUSA</span> : <><Hourglass size={16} weight="bold" /> {tempoTurnoRestante}s</>}
          </div>
        </div>
      </div>

      <div className="mesa-redonda" style={{ marginTop: '60px' }}>
        {oponentesOrdenados.map((op, index) => {
          const ehVezDele = turnoAtual === op.id;
          const jaBateu = Boolean(op.posicaoPodio);
          return (
            <div key={op.id} className="oponente-container" style={getPosicaoOponente(index, oponentesOrdenados.length)}>
              {emotesAtivos[op.id] && <div className="emote-anim">{emotesAtivos[op.id]}</div>}
              
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                {renderMedalhaPodio(op.posicaoPodio)}

                <div className="oponente-avatar" style={{ 
                  position: 'relative', 
                  borderColor: op.isBoss ? '#e74c3c' : (ehVezDele ? '#2ecc71' : '#000'), 
                  boxShadow: ehVezDele ? '0 0 15px #2ecc71' : (op.isBoss ? '0 0 15px #e74c3c' : '4px 4px 0 #000'),
                  borderWidth: '3px', borderStyle: 'solid', borderRadius: '50%',
                  backgroundColor: op.corEquipe || 'transparent', padding: op.corEquipe ? '4px' : '0px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: jaBateu ? 0.45 : 1,
                  filter: jaBateu ? 'grayscale(65%)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  <img 
                    src={`https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=${op.avatar}`} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#fff', border: op.corEquipe ? '2px solid #000' : 'none', boxSizing: 'border-box', display: 'block' }} 
                    alt="Avatar"
                  />
                </div>
              </div>
              
              {op.isBoss && (
                <div style={{ backgroundColor: '#e74c3c', color: '#fff', fontWeight: 'bold', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', border: '2px solid #000', marginTop: '-5px', zIndex: 10, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                  <Skull size={12} weight="bold" /> CHEFÃO
                </div>
              )}

              <div className="cartas-oponente" style={{ opacity: jaBateu ? 0.5 : 1 }}>
                {Array.from({ length: Math.min(op.qtdCartas, 15) }).map((_, i) => (
                  <div key={i} className="carta-verso">K</div>
                ))}
                {op.qtdCartas > 15 && <span style={{color: 'white', fontWeight: 'bold', marginLeft: '5px'}}>+{op.qtdCartas - 15}</span>}
              </div>
              <div className="oponente-nome" style={{ color: ehVezDele ? '#2ecc71' : '#000', opacity: jaBateu ? 0.65 : 1 }}>{op.nome}</div>
            </div>
          );
        })}

        <div className="centro-mesa">
          <div className="coluna-baralho" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              className="carta-baralho-monte"
              onClick={comprarCarta} 
              style={{ 
                cursor: turnoAtual === socket.id && !eventoNoveAtivo && !eventoAleatorioAtivo ? 'pointer' : 'default',
                width: '70px', height: '100px', 
                backgroundColor: 'rgb(189, 195, 199)', 
                border: '4px solid #000', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'rgb(44, 62, 80)', 
                fontSize: '40px', 
                fontWeight: '900', 
                fontFamily: 'Fredoka, sans-serif', 
                boxShadow: '4px 4px 0 #000', 
                userSelect: 'none' 
              }}>
              K
            </div>

            {turnoAtual === socket.id && !jaComprou && comprasAcumuladas === 0 && cartasSelecionadas.length === 0 && !eventoNoveAtivo && !eventoAleatorioAtivo && (
              <button className="btn btn-roxo btn-pequeno btn-comprar-monte" onClick={comprarCarta} style={{margin: 0, marginTop: '10px'}}>{t.comprar}</button>
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

      {/* Controles Inferiores Direita (Emote e Botão KAOS) */}
      <div className="hud-controles-direita" style={{ position: 'fixed', bottom: '90px', right: '20px', zIndex: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <div style={{ position: 'relative' }}>
          {emotesAtivos[socket.id] && <div className="emote-anim" style={{ zIndex: 1200 }}>{emotesAtivos[socket.id]}</div>}
          <button
            className="btn-emote-toggle"
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
        {!meuJogadorInfo?.posicaoPodio && (
          <button className="btn-uno" onClick={() => socket.emit('apertar_uno', minhaSala)} style={{ position: 'static' }}>KAOS!</button>
        )}
      </div>

      {filaPassos[0] === 'zero' && !eventoAleatorioAtivo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{margin: '0 0 15px 0'}}>{t.regraZero}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button className="btn btn-cinza" onClick={() => resolverPasso({ alvoTroca: 'ninguem' })}>{t.nada}</button>
              <button className="btn btn-verde" onClick={() => resolverPasso({ alvoTroca: 'todos' })}>{t.rodarTodas}</button>
            </div>
            <h3 style={{margin: '15px 0 10px 0'}}>{t.ouTrocar}</h3>
            <div className="grid-opcoes-zero">
              {oponentesOrdenados.filter(j => !j.posicaoPodio).map(j => (
                <button key={j.id} className="btn btn-azul" onClick={() => resolverPasso({ alvoTroca: j.id })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <img src={`https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=${j.avatar}`} width="30" height="30" style={{ borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #000' }} alt="Avatar" />
                  {j.nome} ({j.qtdCartas})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filaPassos[0] === 'espiar' && !maoEspiadaPrevia && !eventoAleatorioAtivo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{margin: '0 0 15px 0'}}><Eye size={32} style={{verticalAlign:'middle'}}/> {t.espiarAlvo}</h2>
            <div className="grid-opcoes-zero">
              {oponentesOrdenados.filter(j => !j.posicaoPodio).map(j => (
                <button key={j.id} className="btn btn-roxo" onClick={() => { socket.emit('espiar_cartas_alvo', { codigoSala: minhaSala, alvoId: j.id }); props.setPayloadJogada(prev => ({ ...prev, alvoTroca: j.id })); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <img src={`https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=${j.avatar}`} width="30" height="30" style={{ borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #000' }} alt="Avatar" />
                  {j.nome} ({j.qtdCartas})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {maoEspiadaPrevia && !eventoAleatorioAtivo && (
        <div className="modal-overlay" style={{ zIndex: 1600 }}>
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '15px' }}>Cartas de {maoEspiadaPrevia.nome}:</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {maoEspiadaPrevia.cartas.map(c => ( 
                <div key={c.id} className="carta" style={{ backgroundColor: getCorCss(c.originalCor || c.cor), color: c.cor === 'amarelo' ? '#000' : '#fff', transform: 'scale(0.8)', margin: '-10px' }}> 
                  {renderValorCarta(c.originalCor ? c.originalValor : c.valor)} 
                </div> 
              ))}
            </div>
            <button className="btn btn-azul" style={{ marginTop: '20px' }} onClick={() => { setMaoEspiadaPrevia(null); resolverPasso({}); }}>{t.fechar}</button>
          </div>
        </div>
      )}

      {filaPassos[0] === 'igualar' && !eventoAleatorioAtivo && (
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

      {filaPassos[0] === 'numero' && !eventoAleatorioAtivo && (
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

      {filaPassos[0] === 'cor' && !eventoAleatorioAtivo && (
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

      {eventoNoveAtivo && !eventoAleatorioAtivo && !meuJogadorInfo?.posicaoPodio && (
        <div style={{ position: 'fixed', top: posicaoNove.top, left: posicaoNove.left, transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 2000, pointerEvents: 'none' }}>
          <button onClick={baterNaMesa} disabled={euJaBati} style={{ pointerEvents: 'auto', width: '160px', height: '160px', borderRadius: '50%', border: '8px solid #000', backgroundColor: euJaBati ? '#2ed573' : '#ff4757', boxShadow: '6px 6px 0 #000', cursor: euJaBati ? 'default' : 'pointer', transition: 'all 0.1s', transform: euJaBati ? 'scale(0.9)' : 'scale(1.1)' }}>
            <HandPalm weight="fill" size={96} color="#000" />
          </button>
        </div>
      )}

      <div className="mao-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', padding: '0 10px 10px 10px', maxWidth: '1000px', margin: '15px auto' }}>
        {cartasOrdenadas.map((carta) => {
          const taSelecionada = cartasSelecionadas.find(c => c.id === carta.id);
          let classes = "carta";
          if (taSelecionada) classes += " selecionada";
          if (turnoAtual !== socket.id || eventoNoveAtivo || eventoAleatorioAtivo) classes += " desabilitada";
          return ( 
            <div key={carta.id} onClick={() => toggleSelecao(carta)} className={classes} style={{ backgroundColor: getCorCss(carta.cor), color: carta.cor === 'amarelo' ? '#000' : '#fff' }}> 
              {renderValorCarta(carta.valor)} 
            </div> 
          );
        })}
      </div>

      <div className="painel-acoes" style={{ marginBottom: '20px' }}>
        {turnoAtual === socket.id && cartasSelecionadas.length > 0 && !eventoNoveAtivo && !eventoAleatorioAtivo && ( <button className="btn btn-verde" onClick={tentarJogarSelecionadas}>{t.jogar} ({cartasSelecionadas.length}) {t.cartas}</button> )}
        {turnoAtual === socket.id && comprasAcumuladas > 0 && !eventoNoveAtivo && !eventoAleatorioAtivo && ( <button className="btn btn-vermelho" onClick={comprarCarta}>{t.aceitarPunicao} (+{comprasAcumuladas})</button> )}
        {turnoAtual === socket.id && jaComprou && cartasSelecionadas.length === 0 && comprasAcumuladas === 0 && !eventoNoveAtivo && !eventoAleatorioAtivo && ( <button className="btn btn-cinza" onClick={passarVez}>{t.passarVez}</button> )}
      </div>

    </div>
  );
}