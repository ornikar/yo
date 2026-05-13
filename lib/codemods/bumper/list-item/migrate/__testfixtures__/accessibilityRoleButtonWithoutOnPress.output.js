import { ListItem } from '@ornikar/bumper';

// MANUAL REVIEW: [ListItem migration] `accessibilityRole="button"` was set without an `onPress`. Bumper applies `role="button"` only when `onPress` is provided — re-implement the interactive semantic if needed.
function Example() {
  return (
    <ListItem>
      <ListItem.Content>
        <Text>Row</Text>
      </ListItem.Content>
    </ListItem>
  );
}
