import { CompanyLogo } from './CompanyLogo'

export default {
  title: 'Organisms/Dashboard/CompanyLogo',
  component: CompanyLogo,
  tags: ['autodocs'],
  args: { name: 'Northwind Growth' },
  argTypes: { size: { control: 'select', options: ['md', 'lg'] } },
}

export const Initials = {}

export const OneWordName = { args: { name: 'TechFlow' } }

export const Large = { args: { size: 'lg' } }

export const NoName = { args: { name: undefined } }

export const BrokenImage = { args: { name: 'Lumen Creative', src: '/does-not-exist.png' } }
