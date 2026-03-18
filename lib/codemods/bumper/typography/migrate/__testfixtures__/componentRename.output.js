import { Typography } from '@ornikar/bumper';

function Example() {
  return (
    <>
      <Typography.Text variant="body-m">Paragraph text</Typography.Text>
      <Typography.Link variant="body-s" weight="bold">
        Link text
      </Typography.Link>
      <Typography.Icon icon={<StarIcon />} color="$content.accent" size="$icon.m" />
      <ExternalLink as={Typography.Link} href={url}>
        External
      </ExternalLink>
    </>
  );
}
