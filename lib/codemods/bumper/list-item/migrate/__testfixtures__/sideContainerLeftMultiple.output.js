import { HStack, ListItem } from '@ornikar/bumper';

function Example() {
  return (
    <ListItem>
      <ListItem.Left>
        <HStack gap="$space.4">
          <Avatar />
          <Badge />
        </HStack>
      </ListItem.Left>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
    </ListItem>
  );
}
