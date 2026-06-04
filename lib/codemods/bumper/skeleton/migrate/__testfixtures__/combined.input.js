import { Skeleton, Typography } from '@ornikar/kitt-universal';
import type { SkeletonProps } from '@ornikar/kitt-universal';

function Example({ width }: SkeletonProps) {
  return (
    <>
      <Skeleton isLoading width={width} height={48} borderRadius={8} style={{ margin: 8 }} />
      <Skeleton.Circle size={32} />
      <Skeleton.Square size={64} />
      <Skeleton.Bar size={16} />
      <Typography>label</Typography>
    </>
  );
}
