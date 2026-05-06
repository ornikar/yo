import { ListItem } from '@ornikar/bumper';
import styled from 'styled-components';

// MANUAL REVIEW: [ListItem migration] `styled(ListItem)` is not supported. Bumper does not expose the same styling surface.
const StyledListItem = styled(ListItem)`
  background-color: red;
`;

function Example() {
  return (
    <StyledListItem>
      <Text>x</Text>
    </StyledListItem>
  );
}
