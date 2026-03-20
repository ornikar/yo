import { Button, ButtonProps, SomeOtherComponent } from '@ornikar/kitt-universal';

function Example({ stretch, ...rest }) {
  return (
    <Button type="primary" onPress={onPress}>
      Submit
    </Button>
  );
}
