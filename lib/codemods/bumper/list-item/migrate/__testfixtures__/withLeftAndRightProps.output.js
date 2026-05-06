import { ListItem } from '@ornikar/bumper';

function Example() {
  return (
    <ListItem>
      <ListItem.Left>
        <Icon />
      </ListItem.Left>
      <ListItem.Content>
        <Text>Row</Text>
      </ListItem.Content>
      <ListItem.Right>
        <ChevronIcon />
      </ListItem.Right>
    </ListItem>
  );
}
