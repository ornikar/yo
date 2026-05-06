import { ListItem } from '@ornikar/bumper';
import type { ListItemProps } from '@ornikar/bumper';

function Example({ children }: ListItemProps) {
  return (
    <ListItem>
      <ListItem.Content>{children}</ListItem.Content>
    </ListItem>
  );
}
