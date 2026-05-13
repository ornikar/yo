import { ListItem } from '@ornikar/kitt-universal';

function Example() {
  return (
    <ListItem>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
      <ListItem.SideContent align="center">
        <ChevronIcon />
      </ListItem.SideContent>
    </ListItem>
  );
}
