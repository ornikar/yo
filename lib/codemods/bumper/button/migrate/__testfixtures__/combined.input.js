import { Button, SomeOther } from '@ornikar/kitt-universal';
import { LoaderIcon } from '@ornikar/kitt-icons';
import { FormattedMessage } from 'react-intl';

function PrimaryButton() {
  return (
    <Button type="primary" size="default" onPress={onPress}>
      <FormattedMessage defaultMessage="Continue" />
    </Button>
  );
}

function RevertButton() {
  return (
    <Button type="secondary" variant="revert" onPress={onClose}>
      Close
    </Button>
  );
}

function LoadingButton() {
  return (
    <Button type="primary" icon={isLoading ? <LoaderIcon /> : <SendIcon />} disabled={isLoading} onPress={handleSubmit}>
      Submit
    </Button>
  );
}

function IconRightButton() {
  return (
    <Button type="tertiary-danger" icon={<TrashIcon />} iconPosition="right" onPress={onDelete}>
      Delete
    </Button>
  );
}
