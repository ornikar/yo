import { Button } from '@ornikar/bumper';

function SelfClosingWithIcon() {
  return (
    <Button type="primary" onPress={onNext}>
      <Button.Icon icon={<ArrowRightIcon />} />
      <Button.Text>Next</Button.Text>
    </Button>
  );
}
