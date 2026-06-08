import { Tag } from '@ornikar/kitt-universal';

function VariableSize({ size }) {
  return <Tag label="a" color="green" size={size} />;
}

function TernarySize({ isCompact }) {
  return <Tag label="b" color="green" size={isCompact ? 'small' : 'medium'} />;
}
