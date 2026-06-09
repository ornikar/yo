import { GroupTags, Tag } from '@ornikar/kitt-universal';
import { View } from 'react-native';

export function Mixed() {
  return (
    <GroupTags size="medium">
      <Tag label="A" color="green" />
      <View>
        <Tag label="nested" color="blue" />
      </View>
    </GroupTags>
  );
}
