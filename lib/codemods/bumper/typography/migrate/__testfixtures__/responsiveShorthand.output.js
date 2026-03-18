import { Typography } from '@ornikar/bumper';

function Example() {
  return (
    <Typography.Text
      variant="body-s"
      $small={{
        variant: 'body-xs',
      }}
      $medium={{
        variant: 'body-m',
      }}
      $large={{
        variant: 'body-l',
      }}
      $wide={{
        variant: 'body-xl',
      }}
    >
      Responsive
    </Typography.Text>
  );
}
