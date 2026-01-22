import { storiesOf } from '@storybook/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NativeStoryDecorator } from '@ornikar/learner-apps-shared/src/storybook/decorators/NativeStoryDecorator';
import { WelcomePageView } from './WelcomePageView';

storiesOf('Learner Native App/Authentication/Pages/WelcomePageView', module)
  .addDecorator(NativeStoryDecorator)
  .addParameters({
    chromatic: { disable: true },
    jest: {
      createBeforeAfterEachCallbacks: () => ({
        before: () => jest.useFakeTimers({ legacyFakeTimers: true }),
        after: () => jest.useRealTimers(),
      }),
    },
  })
  .add('WelcomePageView', () => (
    <GestureHandlerRootView>
      <WelcomePageView topInset={60} bottomInset={0} />
    </GestureHandlerRootView>
  ));
