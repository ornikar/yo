import { Tag } from '@ornikar/kitt-universal';

function CollapsingTernary({ isPro }) {
  return <Tag label="a" color={isPro ? 'deepPurple' : 'beige'} size="small" />;
}

function PartialTernary({ isPro }) {
  return <Tag label="b" color={isPro ? 'deepPurple' : 'green'} size="small" />;
}

function VariableColor({ dynamicColor }) {
  return <Tag label="c" color={dynamicColor} size="small" />;
}
