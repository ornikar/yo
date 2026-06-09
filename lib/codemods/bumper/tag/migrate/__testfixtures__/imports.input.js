import { Tag } from '@ornikar/kitt-universal';
import type { TagProps, TagColor, TagSize } from '@ornikar/kitt-universal/Tag/Tag';

export function Example({ color, size }: { color: TagColor, size: TagSize }) {
  return <Tag label="x" color={color} size={size} />;
}

export type { TagProps };
