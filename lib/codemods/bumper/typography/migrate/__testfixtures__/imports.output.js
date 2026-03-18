import { SomeOtherComponent } from '@ornikar/kitt-universal';
import { Typography } from '@ornikar/bumper';

function Example() {
  return (
    <>
      <Typography.Text variant="body-m">Text</Typography.Text>
      <Typography.Link variant="body-s" weight="bold">
        Link
      </Typography.Link>
      <Typography.Icon icon={<CheckIcon />} size="$icon.l" />
    </>
  );
}
