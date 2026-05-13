import { ListItem } from '@ornikar/bumper';

function Example() {
  return (
    <ListItem>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
      <ListItem.Trailing>
        <ChevronIcon />
      </ListItem.Trailing>
    </ListItem>
  );
}
