import { ListItem } from '@ornikar/kitt-universal';

function Example() {
  return (
    <ListItem accessibilityRole="link" onPress={handlePress}>
      <Text>Row</Text>
    </ListItem>
  );
}
