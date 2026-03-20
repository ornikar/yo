import { Button } from '@ornikar/kitt-universal';

function WithTimer() {
  return (
    <Button type="primary" timerAttrs={timerConfig} onPress={onPress}>
      Start
    </Button>
  );
}
