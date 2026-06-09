import { GroupTags, Tag } from '@ornikar/kitt-universal';

export function Fragmented() {
  return (
    <GroupTags size="large">
      <>
        <Tag label="A" color="green" />
        <Tag label="B" color="blue" />
      </>
    </GroupTags>
  );
}
