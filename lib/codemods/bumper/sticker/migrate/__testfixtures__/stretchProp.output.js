import { Sticker } from '@ornikar/bumper';

// TODO: [Sticker migration] `stretch` has no bumper equivalent. Remove the prop or wrap in <View width='100%' alignItems='center'>.
function Stretched() {
  return <Sticker label="Full" stickerColor="green" stretch />;
}

function NotStretched() {
  return <Sticker label="Narrow" stickerColor="green" />;
}
