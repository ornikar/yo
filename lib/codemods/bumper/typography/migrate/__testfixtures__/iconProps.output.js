import { Typography } from '@ornikar/bumper';

function Example() {
  return (
    <>
      <Typography.Icon icon={<CheckIcon />} />
      <Typography.Icon icon={<StarIcon />} color="$content.accent" size="$icon.s" />
      <Typography.Icon icon={<ArrowIcon />} size="$icon.m" />
      <Typography.Icon icon={<InfoIcon />} size="$icon.l" />
    </>
  );
}
