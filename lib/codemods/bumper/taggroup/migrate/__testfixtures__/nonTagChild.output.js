import { Tag, TagGroup } from '@ornikar/bumper';
import { View } from 'react-native';

export function Mixed() {
  // TODO: TagGroup no longer overlaps tags / forces a white border / strips icons — verify with design
  // TODO: [TagGroup migration] non-Tag children are not supported by bumper TagGroup (only `<Tag>` elements) — migrate or remove them manually.
  return (
    <TagGroup>
      <Tag label="A" color="green" size="large" />
      <View>
        <Tag label="nested" color="blue" />
      </View>
    </TagGroup>
  );
}
