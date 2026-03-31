import { Button } from '@ornikar/bumper';

function LoadingNoFallback() {
  return (
    <Button isLoading={isLoading} onPress={onPress}>
      <Button.Text>
        <FormattedMessage defaultMessage="Action" />
      </Button.Text>
    </Button>
  );
}
