import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PegaExtensionsMapboxAddressPicker } from './index';

const localMapboxToken = process.env.MAPBOX_PUBLIC_TOKEN || '';

const meta = {
  title: 'Widgets/Mapbox Address Picker',
  component: PegaExtensionsMapboxAddressPicker,
  argTypes: {
    mapboxToken: { control: 'text' },
    height: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof PegaExtensionsMapboxAddressPicker>;

export default meta;
type Story = StoryObj<typeof PegaExtensionsMapboxAddressPicker>;

export const Default: Story = {
  render: (args) => (
    <PegaExtensionsMapboxAddressPicker
      {...args}
      getPConnect={() =>
        ({
          getActionsApi: () => ({ updateFieldValue: () => {} }),
        }) as unknown as typeof PConnect
      }
    />
  ),
  args: {
    heading: 'Choose an address',
    mapboxToken: localMapboxToken,
    addressLine1Property: '',
    cityProperty: '',
    stateProperty: '',
    countryProperty: '',
    postalCodeProperty: '',
    latitudeProperty: '',
    longitudeProperty: '',
    initialLatitude: '17.6868',
    initialLongitude: '83.2185',
    zoom: '12',
    height: '24rem',
    disabled: false,
  },
};
