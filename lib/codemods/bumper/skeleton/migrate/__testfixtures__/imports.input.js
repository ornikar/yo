import { Skeleton } from '@ornikar/kitt-universal';
import type { SkeletonProps } from '@ornikar/kitt-universal';

function Example({ width }: SkeletonProps) {
  return <Skeleton width={width} height={48} />;
}
