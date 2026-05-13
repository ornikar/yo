import { ListItem } from '@ornikar/kitt-universal';

function Example() {
  return (
    <ListItem>
      <ListItem.SideContainer side="left">
        <Avatar />
      </ListItem.SideContainer>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
    </ListItem>
  );
}
