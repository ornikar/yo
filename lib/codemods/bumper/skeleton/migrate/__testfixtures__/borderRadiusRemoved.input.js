import { Skeleton } from '@ornikar/kitt-universal';

function Rectangle() {
  return <Skeleton width={200} height={48} borderRadius={8} />;
}

function Pill() {
  return <Skeleton width={48} height={48} borderRadius={9999} />;
}
