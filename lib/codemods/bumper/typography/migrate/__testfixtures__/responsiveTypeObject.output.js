import { Typography } from '@ornikar/bumper';

function Example() {
  return (
    <Typography.Text
      variant="body-s"
      $medium={{
        variant: 'body-m',
      }}
      $large={{
        variant: 'body-l',
      }}
    >
      Responsive
    </Typography.Text>
  );
}
