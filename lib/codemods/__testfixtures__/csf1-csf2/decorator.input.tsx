import { storiesOf } from '@storybook/react-native';
import {
  NativeStoryDecorator,
  AnotherDecorator,
} from '@ornikar/learner-apps-shared/src/storybook/decorators/NativeStoryDecorator';
import { NotificationEnablerScreenView } from './NotificationEnablerScreenView';

storiesOf('LNA/shared/components', module)
  .addDecorator(NativeStoryDecorator)
  .addDecorator(AnotherDecorator)
  .add('NotificationEnablerScreen', () => <NotificationEnablerScreenView firstname="Michael" />);
