import { Button } from '@ornikar/kitt-universal';
import { LoaderIcon } from '@ornikar/kitt-icons';

function LoadingWithExtraDisabled() {
  return (
    <Button disabled={isLoading || !isFormValid} icon={isLoading ? <LoaderIcon /> : <CheckIcon />} onPress={onSubmit}>
      Submit
    </Button>
  );
}
