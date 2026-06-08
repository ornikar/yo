import { GroupTags, Tag } from '@ornikar/kitt-universal';

export function Spread({ groupProps }) {
  return (
    <GroupTags {...groupProps}>
      <Tag label="A" color="green" />
      <Tag label="B" color="blue" />
    </GroupTags>
  );
}
