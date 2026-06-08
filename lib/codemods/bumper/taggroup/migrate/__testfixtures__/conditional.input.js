import { GroupTags, Tag } from '@ornikar/kitt-universal';

export function Conditional({ show }) {
  return (
    <GroupTags size="large">
      <Tag label="A" color="green" />
      {show && <Tag label="B" color="blue" />}
    </GroupTags>
  );
}
