import { Sticker } from '@ornikar/kitt-universal';

function Stretched() {
  return <Sticker label="Full" color="green" stretch />;
}

function NotStretched() {
  return <Sticker label="Narrow" color="green" stretch={false} />;
}
