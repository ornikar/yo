import { Button } from '@ornikar/bumper';

function Example() {
  return (
    <Button type="primary" onPress={onPress}>
      <Button.Text>Submit</Button.Text>
    </Button>
  );
}

function WithMediumSize() {
  return (
    <Button type="secondary" onPress={onPress}>
      <Button.Text>Cancel</Button.Text>
    </Button>
  );
}
