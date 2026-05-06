import { HStack, ListItem } from '@ornikar/bumper';

// MANUAL REVIEW: [ListItem migration] Multiple right-side elements wrapped in `<HStack gap="$space.4">`. Confirm gap and layout match the original `ListItem.SideContainer side="right"`.
function Example() {
  return (
    <ListItem>
      <ListItem.Content>
        <Text>Name</Text>
      </ListItem.Content>
      <ListItem.Right>
        <HStack gap="$space.4">
          <Badge />
          <ChevronIcon />
        </HStack>
      </ListItem.Right>
    </ListItem>
  );
}
