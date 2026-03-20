import { SomeOther } from '@ornikar/kitt-universal';
import { Button } from '@ornikar/bumper';
import { FormattedMessage } from 'react-intl';

function PrimaryButton() {
  return (
    <Button type="primary" onPress={onPress}>
      <Button.Text>
        <FormattedMessage defaultMessage="Continue" />
      </Button.Text>
    </Button>
  );
}

function RevertButton() {
  return (
    <Button type="secondary" isOnContrasted onPress={onClose}>
      <Button.Text>Close</Button.Text>
    </Button>
  );
}

function LoadingButton() {
  return (
    <Button type="primary" isLoading={isLoading} onPress={handleSubmit}>
      <Button.Icon icon={<SendIcon />} />
      <Button.Text>Submit</Button.Text>
    </Button>
  );
}

function IconRightButton() {
  return (
    <Button type="danger" onPress={onDelete}>
      <Button.Text>Delete</Button.Text>
      <Button.Icon icon={<TrashIcon />} />
    </Button>
  );
}
