import { Button, Checkbox, Text } from '../../primitives'
import { Sheet, SheetClose } from './Sheet'

export default {
  title: 'Patterns/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  args: {
    trigger: <Button variant="outline">Filters</Button>,
    title: 'Filter members',
    description: 'Narrow the directory by role.',
    children: (
      <div className="flex flex-col">
        <Checkbox label="CMOs" />
        <Checkbox label="VPs of Marketing" />
        <Checkbox label="Founders" />
      </div>
    ),
    footer: (
      <>
        <SheetClose>
          <Button variant="ghost">Cancel</Button>
        </SheetClose>
        <SheetClose>
          <Button>Apply</Button>
        </SheetClose>
      </>
    ),
  },
  argTypes: {
    side: { control: 'select', options: ['left', 'right'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export const Right = {}

export const Left = { args: { side: 'left', size: 'sm' } }

export const Large = {
  args: {
    size: 'lg',
    title: 'Session details',
    description: undefined,
    children: <Text>Recording, slides and the attendee list for this session.</Text>,
  },
}
