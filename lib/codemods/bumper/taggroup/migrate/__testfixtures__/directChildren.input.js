import { GroupTags, Tag } from '@ornikar/kitt-universal';

export function Group() {
  return (
    <GroupTags size="medium">
      <Tag label="A" color="green" />
      <Tag label="B" color="blue" size="small" />
    </GroupTags>
  );
}
