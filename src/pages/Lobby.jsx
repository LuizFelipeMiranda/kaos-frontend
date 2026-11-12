import { useState } from 'react';
import { BookBookmark, Gear, MusicNote, SpeakerHigh, SpeakerSlash, Copy, Check, Crown, UserPlus, Skull } from '@phosphor-icons/react';
import livePixQRCode from '../assets/livepix.png';

export default function Lobby(props) {
  const {
    t, idioma, setIdioma, nome, setNome, meuAvatarSeed, roletarAvatar,
    codigoSalaInput, setCodigoSalaInput, minhaSala, criarSala, entrarSala,
    handleReconectar, jogadores, socket, regrasSelecionadas, setRegrasSelecionadas,
    formatoSelecionado, setFormatoSelecionado, iniciarPartida, adicionarBot,
    sairDaSala, expulsarJogador, handleSort, dragItem, dragOverItem,
    modalRegrasAberto, setModalRegrasAberto, modalConfigAberto, setModalConfigAberto,
    musicaAtiva, setMusicaAtiva, volumeMusica, setVolumeMusica, efeitosAtivos,
    setEfeitosAtivos, volumeEfeitos, setVolumeEfeitos
  } = props;

  const [linkCopiado, setLinkCopiado] = useState(false);

  const copiarLinkSala = () => {
    const url = `${window.location.origin}/?sala=${minhaSala}`;
    navigator.clipboard.writeText(url);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

  const getDescricaoFormato = () => {
    if (regrasSelecionadas === 'boss') return "MODO CHEFÃO: 1 vs Todos! O Chefão joga com 20 cartas e tem 2 jogadas seguidas por turno. A aliança tem de o derrotar! (Mínimo 3 jogadores, usa cartas Casuais).";
    if (regrasSelecionadas === 'kaos_aleatorio') return "KAOS ALEATÓRIO: Eventos aleatórios disparados a cada 50 segundos! O temporizador para e o caos acontece! (Usa cartas Casuais).";
    if (formatoSelecionado === 'duplas') return t.descDuplasReq;
    return regrasSelecionadas === 'casual' ? t.descCasual : t.descKaos;
  };

  return (
    <div className="container" style={{ position: 'relative', maxWidth: '650px', padding: '30px' }}>
      
      <button 
        onClick={() => setModalRegrasAberto(true)} 
        style={{ position: 'absolute', top: '15px', left: '15px', background: '#3498db', border: '3px solid #000', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '3px 3px 0 #000', zIndex: 10 }}
        title={t.regrasTitulo}
      ><BookBookmark size={28} weight="bold" color="#fff" /></button>

      <button 
        onClick={() => setModalConfigAberto(true)} 
        style={{ position: 'absolute', top: '15px', right: '15px', background: '#f1c40f', border: '3px solid #000', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '3px 3px 0 #000', zIndex: 10 }}
        title={t.config}
      ><Gear size={28} weight="bold" color="#000" /></button>

      <h1 className="logo-kaos" style={{ marginTop: '20px' }}>
        <div className="carta-k-logo k-animado">K</div>AOS
      </h1>
      
      {!minhaSala ? (
        <>
          <div className="avatar-seletor-container">
            <h3 style={{ margin: '0 0 10px 0' }}>{t.seuAvatar}</h3>
            <div className="avatar-display" onClick={roletarAvatar} style={{ border: '4px solid #000', boxShadow: '4px 4px 0 #000', cursor: 'pointer' }}>
              <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${meuAvatarSeed}`} width="100%" height="100%" alt="Avatar" />
            </div>
            <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>Clique para alterar</p>
          </div>
          
          <div style={{ margin: '20px 0' }}>
            <input type="text" placeholder={t.seuNome} maxLength={12} value={nome} onChange={(e) => setNome(e.target.value)} style={{ padding: '12px', borderRadius: '15px', border: '4px solid #000', fontSize: '18px', textAlign: 'center', fontWeight: 'bold', width: '80%', maxWidth: '250px', boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.1)' }} />
          </div>

          <button className="btn btn-verde" onClick={criarSala} style={{ fontSize: '22px', padding: '12px 30px' }}>{t.criarSala}</button>
          
          <h3 style={{ margin: '20px 0', color: '#000', fontSize: '20px' }}>{t.ou}</h3>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <input type="text" placeholder={t.codigo} value={codigoSalaInput} onChange={(e) => setCodigoSalaInput(e.target.value)} style={{ width: '130px', padding: '10px', borderRadius: '15px', border: '4px solid #000', fontSize: '18px', textAlign: 'center', fontWeight: 'bold' }} />
            <button className="btn btn-azul" onClick={entrarSala}>{t.entrar}</button>
          </div>

          {localStorage.getItem('kaos_sala_ativa') && (
            <div style={{ marginTop: '25px' }}><button className="btn btn-roxo" onClick={handleReconectar}>Voltar para partida em andamento</button></div>
          )}
          
          <div style={{ marginTop: '40px', padding: '15px', border: '4px dashed #f1c40f', borderRadius: '20px', backgroundColor: '#fffdf0' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#f39c12' }}>{t.apoie} ☕</h3>
            <p style={{ fontSize: '13px', margin: '0 0 10px 0', fontWeight: 'bold', color: '#7f8c8d' }}>{t.ajude}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <img src={livePixQRCode} alt="QR Code LivePix" style={{ width: '90px', borderRadius: '10px', border: '3px solid #000' }} />
              <a href="https://livepix.gg/" target="_blank" rel="noreferrer" className="btn btn-amarelo btn-pequeno" style={{ textDecoration: 'none', color: '#000' }}>{t.doar}</a>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>{t.codigoSala} <span style={{ fontSize: '45px', color: '#ff4757', display: 'block' }}>{minhaSala}</span></h2>
            
            <button 
              onClick={copiarLinkSala}
              className={`btn ${linkCopiado ? 'btn-verde' : 'btn-azul'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', fontSize: '16px' }}
            >
              {linkCopiado ? <Check size={20} weight="bold" /> : <Copy size={20} weight="bold" />}
              {linkCopiado ? 'Link Copiado!' : 'Convidar via Link'}
            </button>
          </div>
          
          {jogadores[0]?.id === socket.id && (
            <div style={{ padding: '20px', border: '4px dashed #000', borderRadius: '20px', margin: '0 auto 25px auto', backgroundColor: '#f9f9f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Modo de Jogo:</h3>
                  <div className="modo-seletor-botoes" style={{ marginBottom: '5px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className={`btn btn-modo ${regrasSelecionadas === 'casual' ? 'btn-azul' : 'btn-cinza'}`} onClick={() => setRegrasSelecionadas('casual')}>{t.casual}</button>
                      <button className={`btn btn-modo ${regrasSelecionadas === 'kaos' ? 'btn-roxo' : 'btn-cinza'}`} onClick={() => setRegrasSelecionadas('kaos')}>{t.kaos}</button>
                      
                      {/* Botão Aleatório atualizado para Verde quando selecionado */}
                      <button 
                        className={`btn btn-modo ${regrasSelecionadas === 'kaos_aleatorio' ? 'btn-verde' : 'btn-cinza'}`} 
                        onClick={() => setRegrasSelecionadas('kaos_aleatorio')}
                        style={{ color: '#fff' }}
                      >
                        Kaos Aleatório
                      </button>

                    </div>

                    <button 
                      className={`btn btn-modo ${regrasSelecionadas === 'boss' ? 'btn-vermelho' : 'btn-cinza'}`} 
                      onClick={() => setRegrasSelecionadas('boss')} 
                      style={{ width: '100%', marginTop: '5px', backgroundColor: regrasSelecionadas === 'boss' ? '#e74c3c' : '', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Skull size={20} weight="bold" /> CHEFÃO (1 vs Todos)
                    </button>
                    
                  </div>
                </div>
                <div style={{ width: '4px', height: '90px', backgroundColor: '#000', margin: '0 15px', borderRadius: '2px' }}></div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Formato:</h3>
                  <div className="modo-seletor-botoes" style={{ marginBottom: '5px', flexDirection: 'column', gap: '5px' }}>
                    <button disabled={regrasSelecionadas === 'boss'} className={`btn btn-modo ${formatoSelecionado === 'pvp' || regrasSelecionadas === 'boss' ? 'btn-amarelo' : 'btn-cinza'}`} style={{ backgroundColor: (formatoSelecionado === 'pvp' || regrasSelecionadas === 'boss') ? '#f1c40f' : '', color: (formatoSelecionado === 'pvp' || regrasSelecionadas === 'boss') ? '#000' : '#fff', opacity: regrasSelecionadas === 'boss' ? 0.6 : 1 }} onClick={() => setFormatoSelecionado('pvp')}>{t.pvp}</button>
                    <button disabled={regrasSelecionadas === 'boss'} className={`btn btn-modo ${formatoSelecionado === 'duplas' && regrasSelecionadas !== 'boss' ? 'btn-verde' : 'btn-cinza'}`} style={{ opacity: regrasSelecionadas === 'boss' ? 0.6 : 1 }} onClick={() => setFormatoSelecionado('duplas')}>{t.duplas}</button>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '13px', margin: '15px 0 0 0', fontWeight: 'bold', color: '#7f8c8d' }}>
                {getDescricaoFormato()}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>{t.jogadores} ({jogadores.length}/6)</h3>
            {jogadores[0]?.id === socket.id && jogadores.length < 6 && (
              <button className="btn btn-roxo btn-pequeno" onClick={adicionarBot} style={{ margin: 0, display: 'flex', gap: '5px', alignItems: 'center' }}>
                <UserPlus size={18} weight="bold" /> Adicionar Bot
              </button>
            )}
          </div>

          <div className="grid-jogadores">
            {jogadores.map((jogador, index) => {
              const ehHost = index === 0;
              const euSouHost = jogadores[0]?.id === socket.id;
              let corEquipeLobby = 'transparent';
              
              if (formatoSelecionado === 'duplas' && regrasSelecionadas !== 'boss' && jogadores.length >= 4) {
                const deslocamento = Math.floor(jogadores.length / 2);
                const cores = ['#ff4757', '#f1c40f', '#3498db']; 
                corEquipeLobby = cores[index % deslocamento];
              }

              return (
                <div 
                  key={jogador.id}
                  className="card-jogador"
                  draggable={euSouHost}
                  onDragStart={() => (dragItem.current = index)}
                  onDragEnter={() => (dragOverItem.current = index)}
                  onDragEnd={handleSort}
                  onDragOver={(e) => e.preventDefault()}
                  style={{ 
                    cursor: euSouHost ? 'grab' : 'default',
                    backgroundColor: (formatoSelecionado === 'duplas' && regrasSelecionadas !== 'boss') ? `${corEquipeLobby}22` : '#fff'
                  }}
                >
                  {ehHost && (
                    <div className="host-badge" title="Host da Sala">
                      <Crown size={24} weight="fill" color="#fff" />
                    </div>
                  )}
                  
                  <div style={{ padding: '4px', borderRadius: '50%', backgroundColor: corEquipeLobby !== 'transparent' ? corEquipeLobby : '#ecf0f1', marginBottom: '10px' }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${jogador.avatar}`} width="70" height="70" style={{ borderRadius: '50%', backgroundColor: '#fff', border: '3px solid #000', display: 'block' }} alt="Avatar" />
                  </div>
                  
                  <span style={{ fontSize: '18px', fontWeight: '900', textAlign: 'center', lineHeight: '1.1' }}>
                    {jogador.nome} {jogador.id === socket.id && <span style={{ color: '#3498db', display: 'block', fontSize: '14px' }}>{t.voce}</span>}
                  </span>
                  
                  <span style={{ fontSize: '14px', color: '#f39c12', fontWeight: 'bold', marginTop: '5px', marginBottom: (euSouHost && !ehHost) ? '15px' : '0' }}>🏆 {jogador.vitorias || 0}</span>
                  
                  {euSouHost && !ehHost && (
                    <button onClick={() => expulsarJogador(jogador.id)} style={{ position: 'absolute', bottom: '-10px', background: '#e74c3c', border: '3px solid #000', borderRadius: '10px', color: '#fff', padding: '2px 15px', cursor: 'pointer', fontWeight: '900', boxShadow: '2px 2px 0 #000' }} title="Expulsar">
                      EXPULSAR
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '35px', alignItems: 'center' }}>
            {jogadores[0]?.id === socket.id ? (
              <button className="btn btn-vermelho" onClick={iniciarPartida} style={{ fontSize: '26px', padding: '15px 40px', width: '100%', maxWidth: '350px' }}>{t.iniciarPartida}</button>
            ) : (
              <div style={{ padding: '15px', border: '4px solid #000', borderRadius: '15px', backgroundColor: '#ecf0f1', width: '100%', maxWidth: '350px', fontWeight: 'bold' }}>
                ⏳ {t.aguardandoHost}
              </div>
            )}
            <button className="btn btn-cinza" onClick={sairDaSala} style={{ marginTop: '10px' }}>{t.sairSala}</button>
          </div>
        </>
      )}

      {modalRegrasAberto && (
        <div className="modal-overlay" style={{ zIndex: 1200, backdropFilter: 'blur(5px)' }}>
          <div className="modal-content" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', textAlign: 'left', padding: '30px', border: '6px solid #000', borderRadius: '25px', boxShadow: '8px 8px 0 #000' }}>
            <h2 style={{ textAlign: 'center', marginTop: 0 }}>{t.regrasTitulo}</h2>
            <h3 style={{ color: '#9b59b6', margin: '15px 0 5px 0' }}>🚀 {t.regrasNovasTitulo}</h3>
            <p style={{ margin: '0 0 10px 0', fontSize: '15px', whiteSpace: 'pre-line' }}>{t.regrasNovasText}</p>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button className="btn btn-vermelho" onClick={() => setModalRegrasAberto(false)} style={{ width: '100%' }}>{t.fechar}</button>
            </div>
          </div>
        </div>
      )}

      {modalConfigAberto && (
        <div className="modal-overlay" style={{ zIndex: 1200, backdropFilter: 'blur(5px)' }}>
          <div className="modal-content" style={{ width: '320px', border: '6px solid #000', borderRadius: '25px', boxShadow: '8px 8px 0 #000' }}>
            <h2>{t.config}</h2>
            <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}><span style={{ fontSize: '24px' }}>{idioma === 'pt' ? '🇧🇷' : '🇺🇸'}</span> {t.idioma}</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className={`btn btn-pequeno ${idioma === 'pt' ? 'btn-azul' : 'btn-cinza'}`} onClick={() => setIdioma('pt')}>Português</button>
                <button className={`btn btn-pequeno ${idioma === 'en' ? 'btn-azul' : 'btn-cinza'}`} onClick={() => setIdioma('en')}>English</button>
              </div>
            </div>
            <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}><MusicNote size={24} /> {t.musica}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                <button className="btn btn-pequeno" onClick={() => setMusicaAtiva(!musicaAtiva)} style={{ backgroundColor: musicaAtiva ? '#2ecc71' : '#e74c3c' }}>{musicaAtiva ? <SpeakerHigh size={20}/> : <SpeakerSlash size={20}/>}</button>
                <input type="range" min="0" max="1" step="0.05" value={volumeMusica} onChange={(e) => setVolumeMusica(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', margin: 0, padding: 0 }} />
              </div>
            </div>
            <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}><SpeakerHigh size={24} /> {t.efeitos}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                <button className="btn btn-pequeno" onClick={() => setEfeitosAtivos(!efeitosAtivos)} style={{ backgroundColor: efeitosAtivos ? '#2ecc71' : '#e74c3c' }}>{efeitosAtivos ? <SpeakerHigh size={20}/> : <SpeakerSlash size={20}/>}</button>
                <input type="range" min="0" max="1" step="0.05" value={volumeEfeitos} onChange={(e) => setVolumeEfeitos(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', margin: 0, padding: 0 }} />
              </div>
            </div>
            <button className="btn btn-azul" onClick={() => setModalConfigAberto(false)} style={{ marginTop: '10px', width: '100%' }}>{t.fechar}</button>
          </div>
        </div>
      )}
    </div>
  );
}