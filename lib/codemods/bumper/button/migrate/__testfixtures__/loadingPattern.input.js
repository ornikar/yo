import { Button } from '@ornikar/kitt-universal';
import { LoaderIcon } from '@ornikar/kitt-icons';

function LoadingWithFallback() {
  return (
    <Button
      type="primary"
      icon={isLoading ? <LoaderIcon /> : <ArrowRightIcon />}
      disabled={isLoading}
      onPress={handleSubmit}
    >
      <FormattedMessage defaultMessage="Submit" />
    </Button>
  );
}
