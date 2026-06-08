import { GroupTags, Tag } from '@ornikar/kitt-universal';
import type { GroupTagsProps } from '@ornikar/kitt-universal/GroupTags/GroupTags';

export function Group(props: GroupTagsProps) {
  return (
    <GroupTags size="medium">
      <Tag label="A" color="green" />
      <Tag label="B" color="blue" />
    </GroupTags>
  );
}

export type { GroupTagsProps };
