import { Tag } from '@ornikar/bumper';

function Spread({ tagProps }) {
  // TODO: [Tag migration] props passed through `{...spread}` are not migrated — drop `withWhiteBorder`, remap `size` (`medium` → `large`) and `color` (`deepPurple` → `beige`) from the spread source manually.
  return <Tag {...tagProps} />;
}

function SpreadWithExplicit({ tagProps }) {
  // deepPurple (accent) → beige — verify visual with design
  // TODO: [Tag migration] props passed through `{...spread}` are not migrated — drop `withWhiteBorder`, remap `size` (`medium` → `large`) and `color` (`deepPurple` → `beige`) from the spread source manually.
  return <Tag {...tagProps} color="beige" size="large" />;
}
