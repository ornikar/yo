import { Sticker } from '@ornikar/bumper';

function Ternary({ theme }) {
  return <Sticker label="x" color={theme === 'dark' ? 'greenDark' : 'green'} />;
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
