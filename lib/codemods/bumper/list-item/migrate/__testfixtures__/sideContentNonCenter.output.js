import { ListItem } from '@ornikar/bumper';

// MANUAL REVIEW: [ListItem migration] `ListItem.SideContent` `align` prop with non-center value has no bumper equivalent. Bumper applies `alignItems` at the row level only.
function Example() {
  return (
    <ListItem>
      <ListItem.Leading>
        <Avatar />
      </ListItem.Leading>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
    </ListItem>
  );
}
