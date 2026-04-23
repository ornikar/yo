import { Sticker } from '@ornikar/kitt-universal';

function Ternary({ theme }) {
  return <Sticker label="x" color={theme === 'dark' ? 'darkGreen' : 'green'} />;
}

function LookupTable({ kind, label }) {
  const colorMap = {
    success: 'green',
    warning: 'gold',
    error: 'red',
    paused: 'darkBlue',
    pro: 'promo',
  };
  return <Sticker label={label} color={colorMap[kind]} />;
}
