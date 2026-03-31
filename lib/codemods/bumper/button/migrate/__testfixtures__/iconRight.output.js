import { Button } from '@ornikar/bumper';

function IconRight() {
  return (
    <Button onPress={onNext}>
      <Button.Text>
        <FormattedMessage defaultMessage="Next" />
      </Button.Text>
      <Button.Icon icon={<ArrowRightIcon />} />
    </Button>
  );
}
