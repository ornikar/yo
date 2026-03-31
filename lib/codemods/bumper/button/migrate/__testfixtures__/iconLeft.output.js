import { Button } from '@ornikar/bumper';

function IconWithText() {
  return (
    <Button type="primary" onPress={onNext}>
      <Button.Icon icon={<ArrowRightIcon />} />
      <Button.Text>
        <FormattedMessage defaultMessage="Next" />
      </Button.Text>
    </Button>
  );
}

function IconLeftExplicit() {
  return (
    <Button onPress={onPress}>
      <Button.Icon icon={<CheckIcon />} />
      <Button.Text>Confirm</Button.Text>
    </Button>
  );
}
