import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PegaExtensionsSplitFlapTextField } from './index';

const meta = {
  title: 'Fields/Split Flap Text Field',
  component: PegaExtensionsSplitFlapTextField,
} satisfies Meta<typeof PegaExtensionsSplitFlapTextField>;

export default meta;
type Story = StoryObj<typeof PegaExtensionsSplitFlapTextField>;

export const Default: Story = {
  args: {
    label: 'Display text',
    value: 'HELLO',
    placeholder: 'Enter text',
    helperText: 'The preview updates as you type.',
    fontSize: 42,
    tileColor: '#111827',
    textColor: '#f8fafc',
    gap: 5,
    tileRadius: 7,
  },
  render: (args) => (
    <PegaExtensionsSplitFlapTextField
      {...args}
      getPConnect={() =>
        ({
          getStateProps: () => ({ value: '.DisplayText' }),
          getActionsApi: () => ({
            updateFieldValue: () => {},
            triggerFieldChange: () => {},
          }),
        }) as unknown as typeof PConnect
      }
    />
  ),
};
