import { Button } from '@ornikar/kitt-universal';
import { FormattedMessage } from 'react-intl';

function Example() {
  return (
    <Button type="primary" onPress={onPress}>
      <FormattedMessage defaultMessage="Continue" />
    </Button>
  );
}

function WithStringChild() {
  return (
    <Button type="secondary" onPress={onPress}>
      {label}
    </Button>
  );
}
