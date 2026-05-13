import { ListItem } from '@ornikar/bumper';

function Example() {
  return (
    <ListItem>
      <ListItem.Content>
        <Text>Row</Text>
      </ListItem.Content>
      <ListItem.Trailing>
        <ChevronIcon />
      </ListItem.Trailing>
    </ListItem>
  );
}
