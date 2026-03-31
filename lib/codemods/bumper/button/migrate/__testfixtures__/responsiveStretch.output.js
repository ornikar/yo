import { Button } from '@ornikar/bumper';

function ResponsiveStretch() {
  return (
    <Button
      stretch
      $small={{
        stretch: false,
      }}
      onPress={onPress}
    >
      <Button.Text>Responsive</Button.Text>
    </Button>
  );
}

function StaticStretchTrue() {
  return (
    <Button stretch onPress={onPress}>
      <Button.Text>Stretched</Button.Text>
    </Button>
  );
}

function StaticStretchExprTrue() {
  return (
    <Button stretch onPress={onPress}>
      <Button.Text>Stretched</Button.Text>
    </Button>
  );
}

function StaticStretchFalse() {
  return (
    <Button onPress={onPress}>
      <Button.Text>Not Stretched</Button.Text>
    </Button>
  );
}

function ResponsiveMultiBreakpoint() {
  return (
    <Button
      stretch
      $medium={{
        stretch: false,
      }}
      onPress={onPress}
    >
      <Button.Text>Medium</Button.Text>
    </Button>
  );
}
