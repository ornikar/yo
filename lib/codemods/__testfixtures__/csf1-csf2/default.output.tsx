import type { ComponentMeta, ComponentStory } from '@storybook/react-native';
import { InfoRegularIcon } from '@ornikar/kitt-icons/phosphor';
import { HStack, IconButton, Story, StorySection, Typography, VStack } from '@ornikar/kitt-universal';
import type { ReactNode } from 'react';
import { useVisibility } from '../../hooks/useVisibility';
import { CustomTooltip } from './CustomTooltip';

function CustomTooltipWrapper(): ReactNode {
  const { visible, toggle } = useVisibility(true);

  return (
    <Story title="CustomTooltip">
      <StorySection title="Top (Default) | Right (Default)">
        <CustomTooltip visible={visible} onTooltipPress={toggle}>
          <Typography.Text>Press on this tooltip area to dismiss it.</Typography.Text>
        </CustomTooltip>
        <HStack paddingX="kitt.4" paddingY="kitt.2" space="kitt.2" alignItems="center" backgroundColor="kitt.amber.100">
          <Typography.Text flexGrow={1}>Press the info button to toggle CustomTooltip.</Typography.Text>
          <IconButton icon={<InfoRegularIcon />} onPress={toggle} />
        </HStack>
      </StorySection>

      <StorySection title="Top | Center">
        <CustomTooltip visible={visible} alignment="center" onTooltipPress={toggle}>
          <Typography.Text>Press on this tooltip area to dismiss it.</Typography.Text>
        </CustomTooltip>
        <VStack paddingX="kitt.4" paddingY="kitt.2" space="kitt.2" alignItems="center" backgroundColor="kitt.amber.100">
          <IconButton icon={<InfoRegularIcon />} onPress={toggle} />
          <Typography.Text flexGrow={1}>Press the info button to toggle CustomTooltip.</Typography.Text>
        </VStack>
      </StorySection>

      <StorySection title="Top | Left">
        <CustomTooltip visible={visible} alignment="flex-start" onTooltipPress={toggle}>
          <Typography.Text>Press on this tooltip area to dismiss it.</Typography.Text>
        </CustomTooltip>
        <HStack paddingX="kitt.4" paddingY="kitt.2" space="kitt.2" alignItems="center" backgroundColor="kitt.amber.100">
          <IconButton icon={<InfoRegularIcon />} onPress={toggle} />
          <Typography.Text flexGrow={1}>Press the info button to toggle CustomTooltip.</Typography.Text>
        </HStack>
      </StorySection>

      <StorySection title="Bottom | Right (Default)">
        <CustomTooltip visible={visible} position="bottom" positionOffset={56} onTooltipPress={toggle}>
          <Typography.Text>Press on this tooltip area to dismiss it.</Typography.Text>
        </CustomTooltip>
        <HStack paddingX="kitt.4" paddingY="kitt.2" space="kitt.2" alignItems="center" backgroundColor="kitt.amber.100">
          <Typography.Text flexGrow={1}>Press the info button to toggle CustomTooltip.</Typography.Text>
          <IconButton icon={<InfoRegularIcon />} onPress={toggle} />
        </HStack>
      </StorySection>

      <StorySection title="Bottom | Center">
        <CustomTooltip
          visible={visible}
          position="bottom"
          positionOffset={56}
          alignment="center"
          onTooltipPress={toggle}
        >
          <Typography.Text>Press on this tooltip area to dismiss it.</Typography.Text>
        </CustomTooltip>
        <VStack paddingX="kitt.4" paddingY="kitt.2" space="kitt.2" alignItems="center" backgroundColor="kitt.amber.100">
          <IconButton icon={<InfoRegularIcon />} onPress={toggle} />
          <Typography.Text flexGrow={1}>Press the info button to toggle CustomTooltip.</Typography.Text>
        </VStack>
      </StorySection>

      <StorySection title="Bottom | Left">
        <CustomTooltip
          visible={visible}
          position="bottom"
          positionOffset={56}
          alignment="flex-start"
          onTooltipPress={toggle}
        >
          <Typography.Text>Press on this tooltip area to dismiss it.</Typography.Text>
        </CustomTooltip>
        <HStack paddingX="kitt.4" paddingY="kitt.2" space="kitt.2" alignItems="center" backgroundColor="kitt.amber.100">
          <IconButton icon={<InfoRegularIcon />} onPress={toggle} />
          <Typography.Text flexGrow={1}>Press the info button to toggle CustomTooltip.</Typography.Text>
        </HStack>
      </StorySection>
    </Story>
  );
}

export default {
  title: 'LAS/shared/components',
  component: CustomTooltipWrapper,
} satisfies ComponentMeta<typeof CustomTooltipWrapper>;

export const CustomTooltipStory: ComponentStory<typeof CustomTooltipWrapper> = () => <CustomTooltipWrapper />;
CustomTooltipStory.storyName = 'CustomTooltip (default)';
