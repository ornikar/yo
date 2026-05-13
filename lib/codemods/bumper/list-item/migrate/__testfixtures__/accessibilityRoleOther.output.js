import { ListItem } from '@ornikar/bumper';

// MANUAL REVIEW: [ListItem migration] `accessibilityRole` other than `"button"` is not supported on bumper `ListItem`. The prop has been dropped — re-implement accessibility manually if needed.
function Example() {
  return (
    <ListItem onPress={handlePress}>
      <ListItem.Content>
        <Text>Row</Text>
      </ListItem.Content>
    </ListItem>
  );
}
