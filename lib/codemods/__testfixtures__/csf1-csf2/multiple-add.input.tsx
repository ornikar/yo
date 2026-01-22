import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react-native';
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

storiesOf('LAS/driving/dashboard/components/DrivingDashboardLearningChaptersModal', module)
  .addDecorator(StoryDecorator as any)
  .addDecorator(ApolloDecorator)
  .add('Default', () => <DrivingDashboardLearningChaptersModalView visible onClose={action('onClose')} />, {
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
  })
  .add('Empty chapters', () => <LearningChaptersModalBodyWrapper visible />, {
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
  })
  .add(
    'Error',
    () => (
      <NotificationProvider>
        <DrivingDashboardLearningChaptersModalView visible onClose={action('onClose')} />
      </NotificationProvider>
    ),
    {
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
    },
  );
