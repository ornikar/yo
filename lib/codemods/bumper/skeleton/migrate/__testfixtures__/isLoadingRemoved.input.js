import { Skeleton } from '@ornikar/kitt-universal';

function Example({ isLoading }) {
  return <Skeleton isLoading={isLoading} width={200} height={48} />;
}
