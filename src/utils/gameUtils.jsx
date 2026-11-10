import { PaintBrushIcon, ProhibitIcon, ArrowsLeftRightIcon, EyeIcon, ScalesIcon, HourglassIcon, HashIcon } from '@phosphor-icons/react';

export const getCorCss = (cor) => {
  switch(cor) {
    case 'vermelho': return '#ff4757';
    case 'azul': return '#1e90ff';
    case 'verde': return '#2ed573';
    case 'amarelo': return '#ffa502';
    case 'preto': return '#2f3542';
    default: return '#ffffff';
  }
};

export const renderValorCarta = (valor) => {
  if (valor === 'coringa') return <PaintBrushIcon size="1em" weight="fill" />;
  if (valor === 'bloqueio') return <ProhibitIcon size="1em" weight="bold" />;
  if (valor === 'inverter') return <ArrowsLeftRightIcon size="1em" weight="bold" />;
  if (valor === '+3') return '+3';
  if (valor === '+6') return '+6';
  if (valor === 'espiar') return <EyeIcon size="1em" weight="bold" />;
  if (valor === 'igualar') return <ScalesIcon size="1em" weight="bold" />;
  if (valor === 'reinicio') return <HourglassIcon size="1em" weight="bold" />; 
  if (valor === 'escolher_numero') return <HashIcon size="1em" weight="bold" />;
  return valor;
};

export const gerarSeedAleatoria = () => Math.random().toString(36).substring(7);

export const getPosicaoOponente = (index, totalOponentes) => {
  if (totalOponentes === 1) return { top: '8%', left: '50%' }; 
  if (totalOponentes === 2) return index === 0 ? { top: '15%', left: '10%' } : { top: '15%', left: '90%' };
  if (totalOponentes === 3) return index === 0 ? { top: '40%', left: '0%' } : index === 1 ? { top: '10%', left: '50%' } : { top: '40%', left: '100%' };
  if (totalOponentes === 4) return index === 0 ? { top: '40%', left: '0%' } : index === 1 ? { top: '12%', left: '30%' } : index === 2 ? { top: '12%', left: '70%' } : { top: '40%', left: '100%' };
  return index === 0 ? { top: '50%', left: '0%' } : index === 1 ? { top: '15%', left: '15%' } : index === 2 ? { top: '10%', left: '50%' } : index === 3 ? { top: '15%', left: '85%' } : { top: '50%', left: '100%' };
};

export const arrayEmojis = ['❤️', '💛', '💚', '💙', '🖕', '😴', '😎', '😂', '😡', '👍', '👎', '🤔'];