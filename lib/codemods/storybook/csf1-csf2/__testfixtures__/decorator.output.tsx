import type { ComponentMeta, ComponentStory } from '@storybook/react-native';
import {
  NativeStoryDecorator,
  AnotherDecorator,
} from '@ornikar/learner-apps-shared/src/storybook/decorators/NativeStoryDecorator';
import { NotificationEnablerScreenView } from './NotificationEnablerScreenView';

export default {
  title: 'LNA/shared/components',
  component: NotificationEnablerScreenView,
  decorators: [NativeStoryDecorator, AnotherDecorator],
} satisfies ComponentMeta<typeof NotificationEnablerScreenView>;

export const NotificationEnablerScreenStory: ComponentStory<typeof NotificationEnablerScreenView> = () => (
  <NotificationEnablerScreenView firstname="Michael" />
);
NotificationEnablerScreenStory.storyName = 'NotificationEnablerScreen';
