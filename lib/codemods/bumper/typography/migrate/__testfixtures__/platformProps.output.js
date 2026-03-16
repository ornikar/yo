import { Typography } from '@ornikar/bumper';

function Example() {
  return (
    <>
      <Typography.Text variant="body-m" $platform-web={{ cursor: 'pointer' }}>
        Web
      </Typography.Text>
      <Typography.Text variant="body-m" $platform-native={{ lineHeight: 20 }}>
        iOS
      </Typography.Text>
      <Typography.Text variant="body-m" $platform-native={{ lineHeight: 22 }}>
        Android
      </Typography.Text>
    </>
  );
}
