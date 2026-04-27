import { Typography } from '@ornikar/kitt-universal';

import { Sticker, StickerProps, StickerColor } from '@ornikar/bumper';

function Example({ color }) {
  return <Sticker label="x" stickerColor={color} />;
}

export { StickerProps, StickerColor };
