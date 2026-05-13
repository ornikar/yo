import { ListItem } from '@ornikar/bumper';

// MANUAL REVIEW: [ListItem migration] `borders="top"` has no exact bumper equivalent. `hasDivider` only renders a divider at the bottom of the row.
function Example() {
  return (
    <ListItem hasDivider>
      <ListItem.Content>
        <Text>Row</Text>
      </ListItem.Content>
    </ListItem>
  );
}
