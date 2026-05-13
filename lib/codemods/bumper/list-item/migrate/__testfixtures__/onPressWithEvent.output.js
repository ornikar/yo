import { ListItem } from '@ornikar/bumper';

// MANUAL REVIEW: [ListItem migration] `onPress` event argument is not available in bumper `ListItem`. Remove or replace event-dependent logic.
function Example() {
  return (
    <ListItem
      onPress={(event) => {
        event.stopPropagation();
        doStuff();
      }}
    >
      <ListItem.Content>
        <Text>Row</Text>
      </ListItem.Content>
    </ListItem>
  );
}
