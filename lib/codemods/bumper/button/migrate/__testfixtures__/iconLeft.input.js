import { Button } from '@ornikar/kitt-universal';

function IconWithText() {
  return (
    <Button type="primary" icon={<ArrowRightIcon />} onPress={onNext}>
      <FormattedMessage defaultMessage="Next" />
    </Button>
  );
}

function IconLeftExplicit() {
  return (
    <Button icon={<CheckIcon />} iconPosition="left" onPress={onPress}>
      Confirm
    </Button>
  );
}
