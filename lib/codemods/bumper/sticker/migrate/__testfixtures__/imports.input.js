import { Sticker, StickerProps, StickerColor, Typography } from '@ornikar/kitt-universal';

function Example({ color }) {
  return <Sticker label="x" color={color} />;
}

export { StickerProps, StickerColor };
