import { Typography } from '@ornikar/kitt-universal';

function Example() {
  return (
    <>
      <Typography.Text base="body-m" _web={{ cursor: 'pointer' }}>
        Web
      </Typography.Text>
      <Typography.Text base="body-m" _ios={{ lineHeight: 20 }}>
        iOS
      </Typography.Text>
      <Typography.Text base="body-m" _android={{ lineHeight: 22 }}>
        Android
      </Typography.Text>
    </>
  );
}
