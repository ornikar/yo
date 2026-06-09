import { GroupTags, Tag } from '@ornikar/kitt-universal';

export function NoSize() {
  return (
    <GroupTags>
      <Tag label="A" color="green" size="small" />
      <Tag label="B" color="blue" size="large" />
    </GroupTags>
  );
}
