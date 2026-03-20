import { Button } from '@ornikar/bumper';

function TertiaryDanger() {
  return (
    <Button type="danger" onPress={onDelete}>
      <Button.Text>Delete</Button.Text>
    </Button>
  );
}

function RegularTypes() {
  return (
    <>
      <Button type="primary" onPress={onPress}>
        <Button.Text>Primary</Button.Text>
      </Button>
      <Button type="tertiary" onPress={onPress}>
        <Button.Text>Tertiary</Button.Text>
      </Button>
    </>
  );
}
