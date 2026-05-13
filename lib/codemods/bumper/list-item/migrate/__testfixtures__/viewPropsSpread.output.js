import { ListItem } from '@ornikar/bumper';

// MANUAL REVIEW: [ListItem migration] ViewProps spread is not supported on bumper `ListItem`. Extract known props manually.
function Example({ rest }) {
  return (
    <ListItem>
      <ListItem.Content>
        <Text>Row</Text>
      </ListItem.Content>
    </ListItem>
  );
}
