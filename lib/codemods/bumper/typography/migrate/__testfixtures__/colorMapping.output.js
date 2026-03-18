import { Typography } from '@ornikar/bumper';

function Example() {
  return (
    <>
      <Typography.Text variant="body-m" color="$content.base.hi">
        Black
      </Typography.Text>
      <Typography.Text variant="body-m" color="$content.base.mid">
        Light
      </Typography.Text>
      <Typography.Text variant="body-m" color="$content.base.onContrasted.hi">
        White
      </Typography.Text>
      <Typography.Text variant="body-m" color="$content.accent">
        Primary
      </Typography.Text>
      <Typography.Text variant="body-m" color="$content.danger">
        Danger
      </Typography.Text>
      <Typography.Text variant="body-m" color="$content.base.mid">
        Token
      </Typography.Text>
      <Typography.Text variant="body-m" color="$content.accent">
        Accent
      </Typography.Text>
    </>
  );
}
