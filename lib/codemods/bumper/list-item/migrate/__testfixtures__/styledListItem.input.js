import { ListItem } from '@ornikar/kitt-universal';
import styled from 'styled-components';

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
