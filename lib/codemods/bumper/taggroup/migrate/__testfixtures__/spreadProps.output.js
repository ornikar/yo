import { Tag, TagGroup } from '@ornikar/bumper';

export function Spread({ groupProps }) {
  // TODO: TagGroup no longer overlaps tags / forces a white border / strips icons — verify with design
  // TODO: [TagGroup migration] `size` may arrive through `{...spread}` — bumper TagGroup has no `size`; destructure it out and push it onto the `<Tag>` children manually.
  return (
    <TagGroup {...groupProps}>
      <Tag label="A" color="green" />
      <Tag label="B" color="blue" />
    </TagGroup>
  );
}
