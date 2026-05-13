import { HStack, ListItem } from '@ornikar/bumper';

function Example() {
  return (
    <ListItem>
      <ListItem.Leading>
        <HStack gap="$space.4">
          <Avatar />
          <Badge />
        </HStack>
      </ListItem.Leading>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
    </ListItem>
  );
}
