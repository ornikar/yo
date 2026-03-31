import { Button } from '@ornikar/bumper';
import { FormattedMessage } from 'react-intl';

function Example() {
  return (
    <Button type="primary" onPress={onPress}>
      <Button.Text>
        <FormattedMessage defaultMessage="Continue" />
      </Button.Text>
    </Button>
  );
}

function WithStringChild() {
  return (
    <Button type="secondary" onPress={onPress}>
      <Button.Text>{label}</Button.Text>
    </Button>
  );
}
