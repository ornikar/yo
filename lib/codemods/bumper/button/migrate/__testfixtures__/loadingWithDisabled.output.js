import { Button } from '@ornikar/bumper';

function LoadingWithExtraDisabled() {
  return (
    <Button disabled={!isFormValid} isLoading={isLoading} onPress={onSubmit}>
      <Button.Icon icon={<CheckIcon />} />
      <Button.Text>Submit</Button.Text>
    </Button>
  );
}
