import { useState } from 'react'
import { Pagination } from './Pagination'

export default {
  title: 'Patterns/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: { page: 1, pageCount: 20 },
  render: function Render(args) {
    const [page, setPage] = useState(args.page)
    return <Pagination {...args} page={page} onPageChange={setPage} />
  },
}

export const Default = {}

export const Middle = { args: { page: 10 } }

export const FewPages = { args: { pageCount: 4, page: 2 } }

export const WideWindow = { args: { page: 10, siblings: 2 } }
