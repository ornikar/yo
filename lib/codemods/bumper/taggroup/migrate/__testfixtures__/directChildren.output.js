import { Tag, TagGroup } from '@ornikar/bumper';

export function Group() {
  // TODO: TagGroup no longer overlaps tags / forces a white border / strips icons — verify with design
  return (
    <TagGroup>
      <Tag label="A" color="green" size="large" />
      <Tag label="B" color="blue" size="large" />
    </TagGroup>
  );
}
