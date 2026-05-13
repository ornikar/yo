import { ListItem } from '@ornikar/bumper';

function Example() {
  return (
    <ListItem onPress={handlePress}>
      <ListItem.Content>
        <Text>Row</Text>
      </ListItem.Content>
    </ListItem>
  );
}
