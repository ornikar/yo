import { Typography } from '@ornikar/kitt-universal';

function Example() {
  return (
    <>
      <Typography.Text base="heading-xxs">XXS</Typography.Text>
      <Typography.Text base="heading-xxl">XXL</Typography.Text>
      <Typography.Text base="label-small">Small label</Typography.Text>
      <Typography.Text base="label-medium">Medium label</Typography.Text>
      <Typography.Text base="label-large">Large label</Typography.Text>
      <Typography.Text base="content-caps-xxl">Caps XXL</Typography.Text>
      <Typography.Text base="content-caps-xxxl">Caps XXXL</Typography.Text>
      <Typography.Text base="body-m">Unchanged</Typography.Text>
      <Typography.Text variant="semibold" base="heading-m">
        Semibold removed
      </Typography.Text>
    </>
  );
}
