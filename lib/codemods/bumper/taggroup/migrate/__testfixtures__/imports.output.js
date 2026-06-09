import { Tag, TagGroup } from '@ornikar/bumper';
import type { TagGroupProps } from '@ornikar/bumper';

export function Group(props: TagGroupProps) {
  // TODO: TagGroup no longer overlaps tags / forces a white border / strips icons — verify with design
  return (
    <TagGroup>
      <Tag label="A" color="green" size="large" />
      <Tag label="B" color="blue" size="large" />
    </TagGroup>
  );
}

export type { TagGroupProps };
