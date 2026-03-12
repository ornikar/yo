import { action } from '@storybook/addon-actions';
import type { ComponentMeta, ComponentStory } from '@storybook/react-native';
import { ApolloError } from '@apollo/client';
import { StoryDecorator } from '@ornikar/kitt-universal';
import { NotificationProvider } from '@ornikar/react-notification';
import {
  ThirdPartyServiceStatusEnum,
  ThirdPartyServiceTypeEnum,
} from '@ornikar/learner-apps-shared/src/__generated__/globalTypes';
import {
  mockLearningChaptersEmptyError,
  mockLearningChaptersWithCourses,
  mockLearningChaptersWithCoursesQueryBuilder,
} from '@ornikar/learner-apps-shared/src/shared/apollo/mocks/learningChaptersWithCoursesMock';
import {
  getThirdPartyService,
  mockThirdPartyServiceQueryBuilder,
} from '@ornikar/learner-apps-shared/src/shared/apollo/mocks/thirdPartyService';
import { ApolloDecorator } from '../../../../../../../storybook/decorators/ApolloDecorator';
import {
  DrivingDashboardLearningChaptersModalView,
  LearningChaptersModalBodyWrapper,
} from './DrivingDashboardLearningChaptersModalView';

export default {
  title: 'LAS/driving/dashboard/components/DrivingDashboardLearningChaptersModal',
  component: DrivingDashboardLearningChaptersModalView,
  decorators: [StoryDecorator, ApolloDecorator],
} satisfies ComponentMeta<typeof DrivingDashboardLearningChaptersModalView>;

export const DefaultStory: ComponentStory<typeof DrivingDashboardLearningChaptersModalView> = () => (
  <DrivingDashboardLearningChaptersModalView visible onClose={action('onClose')} />
);
DefaultStory.storyName = 'Default';

DefaultStory.parameters = {
  apollo: {
    mocks: [
      mockThirdPartyServiceQueryBuilder(
        ThirdPartyServiceTypeEnum.NORTHPASS,
        getThirdPartyService(ThirdPartyServiceTypeEnum.NORTHPASS, ThirdPartyServiceStatusEnum.UP),
      ),
      mockLearningChaptersWithCoursesQueryBuilder(mockLearningChaptersWithCourses),
    ],
  },
  jest: {
    ignore: true,
  },
};

export const EmptyChaptersStory: ComponentStory<typeof DrivingDashboardLearningChaptersModalView> = () => (
  <LearningChaptersModalBodyWrapper visible />
);
EmptyChaptersStory.storyName = 'Empty chapters';

EmptyChaptersStory.parameters = {
  apollo: {
    mocks: [
      mockThirdPartyServiceQueryBuilder(
        ThirdPartyServiceTypeEnum.NORTHPASS,
        getThirdPartyService(ThirdPartyServiceTypeEnum.NORTHPASS, ThirdPartyServiceStatusEnum.UP),
      ),
      mockLearningChaptersWithCoursesQueryBuilder(mockLearningChaptersEmptyError),
    ],
  },
  jest: {
    ignore: true,
  },
};

export const ErrorStory: ComponentStory<typeof DrivingDashboardLearningChaptersModalView> = () => (
  <NotificationProvider>
    <DrivingDashboardLearningChaptersModalView visible onClose={action('onClose')} />
  </NotificationProvider>
);

ErrorStory.storyName = 'Error';

ErrorStory.parameters = {
  apollo: {
    mocks: [
      mockThirdPartyServiceQueryBuilder(
        ThirdPartyServiceTypeEnum.NORTHPASS,
        getThirdPartyService(ThirdPartyServiceTypeEnum.NORTHPASS, ThirdPartyServiceStatusEnum.DOWN),
      ),
      mockLearningChaptersWithCoursesQueryBuilder(mockLearningChaptersEmptyError, new ApolloError({})),
    ],
  },
  jest: {
    ignore: true,
  },
};
