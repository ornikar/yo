import { Button } from '@ornikar/kitt-universal';

function ResponsiveStretch() {
  return (
    <Button stretch={{ base: true, small: false }} onPress={onPress}>
      Responsive
    </Button>
  );
}

function StaticStretchTrue() {
  return (
    <Button stretch onPress={onPress}>
      Stretched
    </Button>
  );
}

function StaticStretchExprTrue() {
  return (
    <Button stretch={true} onPress={onPress}>
      Stretched
    </Button>
  );
}

function StaticStretchFalse() {
  return (
    <Button stretch={false} onPress={onPress}>
      Not Stretched
    </Button>
  );
}

function ResponsiveMultiBreakpoint() {
  return (
    <Button stretch={{ base: true, medium: false }} onPress={onPress}>
      Medium
    </Button>
  );
}
