import { Button } from '@ornikar/bumper';

function DefaultVariant() {
  return (
    <Button type="primary" onPress={onPress}>
      <Button.Text>Action</Button.Text>
    </Button>
  );
}

function RevertVariant() {
  return (
    <Button type="primary" isOnContrasted onPress={onClose}>
      <Button.Text>Close</Button.Text>
    </Button>
  );
}

function DynamicVariant() {
  return (
    <Button isOnContrasted={isContrasted} onPress={onPress}>
      <Button.Text>Dynamic</Button.Text>
    </Button>
  );
}
