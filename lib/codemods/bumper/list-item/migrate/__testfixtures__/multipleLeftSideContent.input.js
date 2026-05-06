import { ListItem } from '@ornikar/kitt-universal';

function Example() {
  return (
    <ListItem>
      <ListItem.SideContent align="center">
        <Avatar />
      </ListItem.SideContent>
      <ListItem.SideContent align="center">
        <Badge />
      </ListItem.SideContent>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
    </ListItem>
  );
}
