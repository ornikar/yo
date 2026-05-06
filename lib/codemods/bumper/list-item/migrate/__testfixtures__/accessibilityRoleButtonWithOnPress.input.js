import { ListItem } from '@ornikar/kitt-universal';

function Example() {
  return (
    <ListItem accessibilityRole="button" onPress={handlePress}>
      <Text>Row</Text>
    </ListItem>
  );
}
