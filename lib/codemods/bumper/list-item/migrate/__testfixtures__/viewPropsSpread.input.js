import { ListItem } from '@ornikar/kitt-universal';

function Example({ rest }) {
  return (
    <ListItem {...rest}>
      <Text>Row</Text>
    </ListItem>
  );
}
