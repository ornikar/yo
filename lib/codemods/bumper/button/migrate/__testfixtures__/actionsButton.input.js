import { Actions, Button } from '@ornikar/kitt-universal';

function Example() {
  return (
    <Actions>
      <Actions.Button type="primary" onPress={onPress}>
        Confirm
      </Actions.Button>
      <Button type="secondary" onPress={onCancel}>
        Cancel
      </Button>
    </Actions>
  );
}
