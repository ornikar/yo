import { Tag } from '@ornikar/bumper';

function CollapsingTernary({ isPro }) {
  return <Tag label="a" color="beige" size="small" />;
}

function PartialTernary({ isPro }) {
  return <Tag label="b" color={isPro ? 'beige' : 'green'} size="small" />;
}

function VariableColor({ dynamicColor }) {
  return <Tag label="c" color={dynamicColor} size="small" />;
}
