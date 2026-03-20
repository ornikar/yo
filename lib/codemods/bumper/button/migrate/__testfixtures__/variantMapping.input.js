import { Button } from '@ornikar/kitt-universal';

function DefaultVariant() {
  return (
    <Button type="primary" variant="default" onPress={onPress}>
      Action
    </Button>
  );
}

function RevertVariant() {
  return (
    <Button type="primary" variant="revert" onPress={onClose}>
      Close
    </Button>
  );
}

function DynamicVariant() {
  return (
    <Button variant={isContrasted ? 'revert' : 'default'} onPress={onPress}>
      Dynamic
    </Button>
  );
}
