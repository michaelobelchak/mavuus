import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentThread } from './CommentThread'

const comments = [
  {
    id: 1,
    authorName: 'Priya Patel',
    content: 'Will there be a recording?',
    timeLabel: 'Mar 11',
    dateTime: '2026-03-11',
    own: false,
    replies: [{ id: 2, authorName: 'Demo User', content: 'Yes, within 24 hours.', timeLabel: 'Mar 11', own: true }],
  },
]
const me = { name: 'Demo User' }

describe('CommentThread', () => {
  it('should title the section with the count and list comments with their replies', () => {
    render(<CommentThread comments={comments} currentUser={me} onPost={vi.fn()} onReply={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('region', { name: 'Comments (1)' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Comments (1)' })).toBeInTheDocument()
    expect(screen.getByText('Will there be a recording?')).toBeInTheDocument()
    expect(screen.getByText('Yes, within 24 hours.')).toBeInTheDocument()
  })

  it('should post the trimmed text and clear the field when the form is sent', async () => {
    const user = userEvent.setup()
    const onPost = vi.fn().mockResolvedValue(true)
    render(<CommentThread comments={[]} currentUser={me} onPost={onPost} />)
    const field = screen.getByRole('textbox', { name: 'Add a comment' })
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled()
    await user.type(field, '  Great talk  {Enter}')
    expect(onPost).toHaveBeenCalledWith('Great talk')
    expect(field).toHaveValue('')
  })

  it('should keep the text when the post fails', async () => {
    const user = userEvent.setup()
    render(<CommentThread comments={[]} currentUser={me} onPost={vi.fn().mockResolvedValue(false)} />)
    const field = screen.getByRole('textbox', { name: 'Add a comment' })
    await user.type(field, 'Hello{Enter}')
    expect(field).toHaveValue('Hello')
  })

  it('should open a reply field and send the reply to the parent when Reply is used', async () => {
    const user = userEvent.setup()
    const onReply = vi.fn().mockResolvedValue(true)
    render(<CommentThread comments={comments} currentUser={me} onPost={vi.fn()} onReply={onReply} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Reply to Priya Patel' }))
    const field = screen.getByRole('textbox', { name: 'Reply to Priya Patel' })
    expect(field).toHaveFocus()
    await user.type(field, 'Thanks{Enter}')
    expect(onReply).toHaveBeenCalledWith(1, 'Thanks')
    expect(screen.queryByRole('textbox', { name: 'Reply to Priya Patel' })).not.toBeInTheDocument()
  })

  it('should offer Delete only on your own comments', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<CommentThread comments={comments} currentUser={me} onPost={vi.fn()} onReply={vi.fn()} onDelete={onDelete} />)
    const deletes = screen.getAllByRole('button', { name: /Delete comment/ })
    expect(deletes).toHaveLength(1)
    await user.click(deletes[0])
    expect(onDelete).toHaveBeenCalledWith(2)
  })

  it('should ask to log in and hide Reply when signed out', () => {
    render(<CommentThread comments={comments} />)
    expect(screen.getByText('Log in to leave a comment.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Reply to/ })).not.toBeInTheDocument()
  })

  it('should show an empty state and a busy skeleton', () => {
    const { rerender } = render(<CommentThread comments={[]} currentUser={me} onPost={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'No comments yet' })).toBeInTheDocument()
    rerender(<CommentThread loading currentUser={me} onPost={vi.fn()} />)
    const region = screen.getByRole('region')
    expect(within(region).getByText('Loading comments').parentElement).toHaveAttribute('aria-busy', 'true')
  })

  it('should return focus to the Reply button and announce the reply when it is posted', async () => {
    const user = userEvent.setup()
    render(<CommentThread comments={comments} currentUser={me} onPost={vi.fn()} onReply={vi.fn().mockResolvedValue(true)} onDelete={vi.fn()} />)
    const replyButton = screen.getByRole('button', { name: 'Reply to Priya Patel' })
    await user.click(replyButton)
    await user.type(screen.getByRole('textbox', { name: 'Reply to Priya Patel' }), 'Thanks{Enter}')
    expect(replyButton).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Reply posted')
  })

  it('should announce a posted comment', async () => {
    const user = userEvent.setup()
    render(<CommentThread comments={[]} currentUser={me} onPost={vi.fn().mockResolvedValue(true)} />)
    await user.type(screen.getByRole('textbox', { name: 'Add a comment' }), 'Hello{Enter}')
    expect(screen.getByRole('status')).toHaveTextContent('Comment posted')
  })

  it('should move focus to the thread heading and announce it when a comment is deleted', async () => {
    const user = userEvent.setup()
    render(<CommentThread comments={comments} currentUser={me} onPost={vi.fn()} onReply={vi.fn()} onDelete={vi.fn().mockResolvedValue(true)} />)
    await user.click(screen.getByRole('button', { name: /Delete comment by Demo User/ }))
    const heading = screen.getByRole('heading', { name: /^Comments/ })
    expect(heading).toHaveAttribute('tabindex', '-1')
    expect(heading).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Comment deleted')
  })

  it('should keep focus and stay quiet when the delete fails', async () => {
    const user = userEvent.setup()
    render(<CommentThread comments={comments} currentUser={me} onPost={vi.fn()} onReply={vi.fn()} onDelete={vi.fn().mockResolvedValue(false)} />)
    const button = screen.getByRole('button', { name: /Delete comment by Demo User/ })
    await user.click(button)
    expect(button).toHaveFocus()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
