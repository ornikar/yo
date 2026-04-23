import { Sticker, StickerColor, Typography } from '@ornikar/kitt-universal';

function A({ state }) {
  return <Sticker label="x" color={state === 'off' ? 'disabled' : 'darkGreen'} size="medium" />;
}

function B() {
  return <Sticker label="y" color="promo" stretch />;
}

function C({ c }) {
  return <Sticker label="z" color={c} />;
}

export { StickerColor };
