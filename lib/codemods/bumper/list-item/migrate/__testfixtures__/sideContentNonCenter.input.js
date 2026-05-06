import { ListItem } from '@ornikar/kitt-universal';

function Example() {
  return (
    <ListItem>
      <ListItem.SideContent align="flex-start">
        <Avatar />
      </ListItem.SideContent>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
    </ListItem>
  );
}
