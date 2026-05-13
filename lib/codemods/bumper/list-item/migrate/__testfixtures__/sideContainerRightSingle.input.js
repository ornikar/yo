import { ListItem } from '@ornikar/kitt-universal';

function Example() {
  return (
    <ListItem>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
      <ListItem.SideContainer side="right">
        <ChevronIcon />
      </ListItem.SideContainer>
    </ListItem>
  );
}
