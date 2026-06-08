import { Tag } from '@ornikar/kitt-universal';

export function Bordered() {
  return (
    <>
      <Tag label="a" color="green" size="small" withWhiteBorder />
      <Tag label="b" color="blue" size="medium" withWhiteBorder={isOverlapping} />
    </>
  );
}
