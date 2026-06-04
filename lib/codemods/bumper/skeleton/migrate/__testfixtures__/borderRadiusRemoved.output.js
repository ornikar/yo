import { Skeleton } from '@ornikar/bumper';

function Rectangle() {
  return <Skeleton.Shape type="rectangle" width={200} height={48} />;
}

function Pill() {
  return <Skeleton.Shape type="rounded" width={48} height={48} />;
}
