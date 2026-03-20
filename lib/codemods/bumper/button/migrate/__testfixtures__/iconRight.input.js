import { Button } from '@ornikar/kitt-universal';

function IconRight() {
  return (
    <Button icon={<ArrowRightIcon />} iconPosition="right" onPress={onNext}>
      <FormattedMessage defaultMessage="Next" />
    </Button>
  );
}
