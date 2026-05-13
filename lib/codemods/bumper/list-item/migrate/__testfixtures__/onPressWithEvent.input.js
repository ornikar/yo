import { ListItem } from '@ornikar/kitt-universal';

function Example() {
  return (
    <ListItem
      onPress={(event) => {
        event.stopPropagation();
        doStuff();
      }}
    >
      <Text>Row</Text>
    </ListItem>
  );
}
