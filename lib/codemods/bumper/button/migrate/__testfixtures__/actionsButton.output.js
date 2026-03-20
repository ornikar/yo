import { Actions } from '@ornikar/kitt-universal';

import { Button } from '@ornikar/bumper';

function Example() {
  return (
    <Actions>
      <Actions.Button type="primary" onPress={onPress}>
        Confirm
      </Actions.Button>
      <Button type="secondary" onPress={onCancel}>
        <Button.Text>Cancel</Button.Text>
      </Button>
    </Actions>
  );
}
