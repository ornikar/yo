import { Sticker } from '@ornikar/bumper';

function Ternary({ theme }) {
  return <Sticker label="x" stickerColor={theme === 'dark' ? 'greenDark' : 'green'} />;
}

function LookupTable({ kind, label }) {
  const colorMap = {
    success: 'green',
    warning: 'gold',
    error: 'red',
    paused: 'darkBlue',
    pro: 'promo',
  };
  return <Sticker label={label} stickerColor={colorMap[kind]} />;
}
