import type { ComponentMeta, ComponentStory } from '@storybook/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NativeStoryDecorator } from '@ornikar/learner-apps-shared/src/storybook/decorators/NativeStoryDecorator';
import { WelcomePageView } from './WelcomePageView';

export default {
  title: 'LNA/authentication/pages',
  component: WelcomePageView,
  decorators: [NativeStoryDecorator],

  parameters: {
    chromatic: { disable: true },
    jest: {
      createBeforeAfterEachCallbacks: () => ({
        before: () => jest.useFakeTimers({ legacyFakeTimers: true }),
        after: () => jest.useRealTimers(),
      }),
    },
  },
} satisfies ComponentMeta<typeof WelcomePageView>;

export const WelcomePageStory: ComponentStory<typeof WelcomePageView> = () => (
  <GestureHandlerRootView>
    <WelcomePageView topInset={60} bottomInset={0} />
  </GestureHandlerRootView>
);

WelcomePageStory.storyName = 'WelcomePage';
