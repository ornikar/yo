import { GroupTags, Tag } from '@ornikar/kitt-universal';

function TagList({ items, size }) {
  return (
    <GroupTags size={size}>
      {items.map((item) => (
        <Tag key={item.id} label={item.label} color={item.color} />
      ))}
    </GroupTags>
  );
}
