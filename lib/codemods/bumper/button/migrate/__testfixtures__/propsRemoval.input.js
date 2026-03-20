import { Button } from '@ornikar/kitt-universal';

function Example() {
  return (
    <Button
      type="primary"
      size="default"
      onPress={onPress}
      onFocus={onFocus}
      onBlur={onBlur}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      href="https://example.com"
      hrefAttrs={{ target: '_blank' }}
      accessibilityRole="button"
      innerSpacing="compact"
      style={{ marginTop: 10 }}
      isHoveredInternal={false}
      isPressedInternal={false}
      isFocusedInternal={false}
    >
      Submit
    </Button>
  );
}

function WithMediumSize() {
  return (
    <Button type="secondary" size="medium" onPress={onPress}>
      Cancel
    </Button>
  );
}
