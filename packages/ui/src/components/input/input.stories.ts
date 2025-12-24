import { fn } from 'storybook/test';

import { Input } from './input.js';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Component/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: { onClick: fn() },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
