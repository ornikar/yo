import { Button } from '@ornikar/bumper';

function WithTimer() {
  // TODO: [Button migration] timerAttrs has no bumper equivalent. Manual conversion required.
  return (
    <Button type="primary" onPress={onPress}>
      <Button.Text>Start</Button.Text>
    </Button>
  );
}
