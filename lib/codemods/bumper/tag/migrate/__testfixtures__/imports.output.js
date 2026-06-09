// TODO: [Tag migration] `TagColor` / `TagSize` are not exported by bumper — use the runtime constants `TAG_COLORS_LIST` / `TAG_SIZES_LIST` instead and update the value sets manually (the kitt and bumper sets differ).
import type { TagColor, TagSize } from '@ornikar/kitt-universal/Tag/Tag';

import { Tag } from '@ornikar/bumper';
import type { TagProps } from '@ornikar/bumper';

export function Example({ color, size }: { color: TagColor, size: TagSize }) {
  return <Tag label="x" color={color} size={size === 'medium' ? 'large' : size} />;
}

export type { TagProps };
