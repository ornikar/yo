import { Tag } from '@ornikar/bumper';

function VariableSize({ size }) {
  return <Tag label="a" color="green" size={size === 'medium' ? 'large' : size} />;
}

function TernarySize({ isCompact }) {
  return <Tag label="b" color="green" size={isCompact ? 'small' : 'large'} />;
}
