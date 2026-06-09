import { Tag, TagGroup } from '@ornikar/bumper';

export function Conditional({ show }) {
  // TODO: TagGroup no longer overlaps tags / forces a white border / strips icons — verify with design
  return (
    <TagGroup>
      <Tag label="A" color="green" size="large" />
      {show ? <Tag label="B" color="blue" size="large" /> : null}
    </TagGroup>
  );
}
