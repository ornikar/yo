import { Button } from '@ornikar/bumper';

function LoadingWithFallback() {
  return (
    <Button type="primary" isLoading={isLoading} onPress={handleSubmit}>
      <Button.Icon icon={<ArrowRightIcon />} />
      <Button.Text>
        <FormattedMessage defaultMessage="Submit" />
      </Button.Text>
    </Button>
  );
}
