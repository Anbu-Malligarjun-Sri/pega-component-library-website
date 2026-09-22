import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PegaExtensionsMapboxAddressField } from './index';

const meta = {
  title: 'Fields/Mapbox Address Field',
  component: PegaExtensionsMapboxAddressField,
} satisfies Meta<typeof PegaExtensionsMapboxAddressField>;

export default meta;
type Story = StoryObj<typeof PegaExtensionsMapboxAddressField>;

export const Default: Story = {
  args: {
    label: 'Address',
    mapboxToken: process.env.MAPBOX_PUBLIC_TOKEN || '',
    value: '',
    placeholder: 'Search for an address',
    helperText: 'Search for an address or use your current location.',
    disabled: false,
    readOnly: false,
    required: false,
  },
  render: (args) => (
    <PegaExtensionsMapboxAddressField
      {...args}
      getPConnect={() =>
        ({
          getStateProps: () => ({ value: '.Address' }),
          getActionsApi: () => ({
            updateFieldValue: () => {},
            triggerFieldChange: () => {},
          }),
        }) as unknown as typeof PConnect
      }
    />
  ),
};
