import { ListItem } from '@ornikar/bumper';

// MANUAL REVIEW: [ListItem migration] Multiple left-side `ListItem.SideContent` elements were combined inside a single `<ListItem.Leading>`. Bumper honors only one leading slot — verify the layout.
function Example() {
  return (
    <ListItem>
      <ListItem.Leading>
        <Avatar />
        <Badge />
      </ListItem.Leading>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
    </ListItem>
  );
}
