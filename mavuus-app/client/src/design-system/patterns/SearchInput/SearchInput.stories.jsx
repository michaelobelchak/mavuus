import { SearchInput } from './SearchInput'

export default {
  title: 'Patterns/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  args: { placeholder: 'Search members', 'aria-label': 'Search members', onSearch: () => {} },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
}

export const Default = {}

export const WithValue = { args: { defaultValue: 'growth' } }

export const Small = { args: { size: 'sm' } }
