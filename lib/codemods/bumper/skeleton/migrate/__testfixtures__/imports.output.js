import { Skeleton } from '@ornikar/bumper';
import type { SkeletonShapeProps } from '@ornikar/bumper';

function Example({ width }: SkeletonShapeProps) {
  return <Skeleton.Shape type="rectangle" width={width} height={48} />;
}
