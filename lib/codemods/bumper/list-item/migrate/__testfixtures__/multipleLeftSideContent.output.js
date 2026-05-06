import { ListItem } from '@ornikar/bumper';

// MANUAL REVIEW: [ListItem migration] Multiple left-side `ListItem.SideContent` elements were combined inside a single `<ListItem.Left>`. Bumper honors only one left slot — verify the layout.
function Example() {
  return (
    <ListItem>
      <ListItem.Left>
        <Avatar />
        <Badge />
      </ListItem.Left>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
    </ListItem>
  );
}
