import { SomeOtherComponent } from '@ornikar/kitt-universal';

import { Button, ButtonProps } from '@ornikar/bumper';

function Example({ stretch, ...rest }) {
  return (
    <Button type="primary" onPress={onPress}>
      <Button.Text>Submit</Button.Text>
    </Button>
  );
}
