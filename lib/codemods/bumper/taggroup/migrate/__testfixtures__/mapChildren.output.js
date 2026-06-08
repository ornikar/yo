import { Tag, TagGroup } from '@ornikar/bumper';

function TagList({ items, size }) {
  // TODO: TagGroup no longer overlaps tags / forces a white border / strips icons — verify with design
  return (
    <TagGroup>
      {items.map((item) => (
        <Tag key={item.id} label={item.label} color={item.color} size={size === 'medium' ? 'large' : size} />
      ))}
    </TagGroup>
  );
}
