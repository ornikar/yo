import { Button } from '@ornikar/kitt-universal';
import { LoaderIcon } from '@ornikar/kitt-icons';

function LoadingNoFallback() {
  return (
    <Button icon={isLoading ? <LoaderIcon /> : undefined} disabled={isLoading} onPress={onPress}>
      <FormattedMessage defaultMessage="Action" />
    </Button>
  );
}
