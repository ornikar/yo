import { Button } from '@ornikar/kitt-universal';

function SelfClosingWithIcon() {
  return (
    <Button type="primary" icon={<ArrowRightIcon />} onPress={onNext}>
      Next
    </Button>
  );
}
