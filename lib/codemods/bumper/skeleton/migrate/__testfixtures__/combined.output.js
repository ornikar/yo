import { Typography } from '@ornikar/kitt-universal';
import { Skeleton } from '@ornikar/bumper';
import type { SkeletonShapeProps } from '@ornikar/bumper';

// TODO: [Skeleton migration] adjust `typographyVariant` on `Skeleton.Typography` to match the real text line.
function Example({ width }: SkeletonShapeProps) {
  return (
    <>
      <Skeleton.Shape type="rectangle" width={width} height={48} />
      <Skeleton.Shape type="rounded" width={32} height={32} />
      <Skeleton.Shape type="rectangle" width={64} height={64} />
      <Skeleton.Typography typographyVariant="body-m" />
      <Typography>label</Typography>
    </>
  );
}
