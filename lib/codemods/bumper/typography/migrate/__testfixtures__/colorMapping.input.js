import { Typography } from '@ornikar/kitt-universal';

function Example() {
  return (
    <>
      <Typography.Text base="body-m" color="black">
        Black
      </Typography.Text>
      <Typography.Text base="body-m" color="black-light">
        Light
      </Typography.Text>
      <Typography.Text base="body-m" color="white">
        White
      </Typography.Text>
      <Typography.Text base="body-m" color="primary">
        Primary
      </Typography.Text>
      <Typography.Text base="body-m" color="danger">
        Danger
      </Typography.Text>
      <Typography.Text base="body-m" color="kitt.bumper.content.base.mid">
        Token
      </Typography.Text>
      <Typography.Text base="body-m" color="kitt.bumper.content.accent">
        Accent
      </Typography.Text>
    </>
  );
}
