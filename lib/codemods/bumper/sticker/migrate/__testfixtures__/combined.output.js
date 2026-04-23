import { Typography } from '@ornikar/kitt-universal';

import { Sticker, StickerColor } from '@ornikar/bumper';

function A({ state }) {
  return <Sticker label="x" disabled={state === 'off'} color="greenDark" size="medium" />;
}

// TODO: [Sticker migration] `stretch` has no bumper equivalent. Remove the prop or wrap in <View width='100%' alignItems='center'>.
function B() {
  return <Sticker label="y" color="lightning" stretch />;
}

function C({ c }) {
  return <Sticker label="z" color={c} />;
}

export { StickerColor };
