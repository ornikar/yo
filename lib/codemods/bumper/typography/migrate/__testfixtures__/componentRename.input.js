import { Typography, TypographyLink, TypographyIcon } from '@ornikar/kitt-universal';

function Example() {
  return (
    <>
      <Typography.Paragraph base="body-m">Paragraph text</Typography.Paragraph>
      <TypographyLink base="body-s" variant="bold">
        Link text
      </TypographyLink>
      <TypographyIcon icon={<StarIcon />} color="primary" size={20} />
      <ExternalLink as={TypographyLink} href={url}>
        External
      </ExternalLink>
    </>
  );
}
