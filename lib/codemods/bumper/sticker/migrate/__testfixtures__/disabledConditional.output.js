import { Sticker } from '@ornikar/bumper';

function A({ isInactive }) {
  return <Sticker label="Item" disabled={isInactive} stickerColor="green" />;
}

function B({ isActive }) {
  return <Sticker label="Item" disabled={!isActive} stickerColor="greenDark" />;
}
