import { Sticker } from '@ornikar/bumper';

function A({ isInactive }) {
  return <Sticker label="Item" disabled={isInactive} color="green" />;
}

function B({ isActive }) {
  return <Sticker label="Item" disabled={!isActive} color="greenDark" />;
}
