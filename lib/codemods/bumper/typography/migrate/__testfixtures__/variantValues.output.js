import { Typography } from '@ornikar/bumper';

function Example() {
  return (
    <>
      <Typography.Text variant="heading-2xs">XXS</Typography.Text>
      <Typography.Text variant="heading-2xl">XXL</Typography.Text>
      <Typography.Text variant="label-s">Small label</Typography.Text>
      <Typography.Text variant="label-m">Medium label</Typography.Text>
      <Typography.Text variant="label-l">Large label</Typography.Text>
      <Typography.Text variant="content-caps-2xl">Caps XXL</Typography.Text>
      <Typography.Text variant="content-caps-3xl">Caps XXXL</Typography.Text>
      <Typography.Text variant="body-m">Unchanged</Typography.Text>
      <Typography.Text variant="heading-m">Semibold removed</Typography.Text>
    </>
  );
}
