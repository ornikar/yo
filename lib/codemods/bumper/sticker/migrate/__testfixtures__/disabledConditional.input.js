import { Sticker } from '@ornikar/kitt-universal';

function A({ isInactive }) {
  return <Sticker label="Item" color={isInactive ? 'disabled' : 'green'} />;
}

function B({ isActive }) {
  return <Sticker label="Item" color={isActive ? 'darkGreen' : 'disabled'} />;
}
