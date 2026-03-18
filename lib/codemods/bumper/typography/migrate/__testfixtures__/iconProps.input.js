import { TypographyIcon } from '@ornikar/kitt-universal';

function Example() {
  return (
    <>
      <TypographyIcon icon={<CheckIcon />} color="inherit" />
      <TypographyIcon icon={<StarIcon />} color="primary" size={16} />
      <TypographyIcon icon={<ArrowIcon />} size={20} />
      <TypographyIcon icon={<InfoIcon />} size={24} />
    </>
  );
}
