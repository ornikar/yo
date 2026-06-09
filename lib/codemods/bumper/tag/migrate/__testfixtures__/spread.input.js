import { Tag } from '@ornikar/kitt-universal';

function Spread({ tagProps }) {
  return <Tag {...tagProps} />;
}

function SpreadWithExplicit({ tagProps }) {
  return <Tag {...tagProps} color="deepPurple" withWhiteBorder size="medium" />;
}
