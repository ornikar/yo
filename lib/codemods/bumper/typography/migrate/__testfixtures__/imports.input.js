import { Typography, TypographyLink, TypographyIcon } from '@ornikar/kitt-universal';
import { SomeOtherComponent } from '@ornikar/kitt-universal';

function Example() {
  return (
    <>
      <Typography.Text base="body-m">Text</Typography.Text>
      <TypographyLink base="body-s" variant="bold">
        Link
      </TypographyLink>
      <TypographyIcon icon={<CheckIcon />} size={24} />
    </>
  );
}
