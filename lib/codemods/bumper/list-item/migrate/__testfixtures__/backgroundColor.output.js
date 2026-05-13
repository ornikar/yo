import { ListItem } from '@ornikar/bumper';

// MANUAL REVIEW: [ListItem migration] `backgroundColor` / `borderColor` are not supported on bumper `ListItem`.
function Example() {
  return (
    <ListItem>
      <ListItem.Content>
        <Text>Row</Text>
      </ListItem.Content>
    </ListItem>
  );
}
