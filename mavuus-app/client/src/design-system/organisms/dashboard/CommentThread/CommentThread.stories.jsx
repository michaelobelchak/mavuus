import { CommentThread } from './CommentThread'

const comments = [
  {
    id: 1,
    authorName: 'Priya Patel',
    authorAvatarSrc: '/images/avatars/avatar-03.webp',
    content: "Will there be a recording available for those who can't attend live?",
    timeLabel: 'Mar 11',
    dateTime: '2026-03-11',
    replies: [
      {
        id: 2,
        authorName: 'Demo User',
        authorAvatarSrc: '/images/avatars/avatar-06.webp',
        content: 'Yes! All live sessions are recorded and available in the on-demand library within 24 hours.',
        timeLabel: 'Mar 11',
        own: true,
      },
    ],
  },
  {
    id: 3,
    authorName: 'Marcus Johnson',
    content: 'Sarah always delivers amazing insights.',
    timeLabel: '2d ago',
    replies: [],
  },
]

const noop = async () => true

export default {
  title: 'Organisms/Dashboard/CommentThread',
  component: CommentThread,
  tags: ['autodocs'],
  args: { comments, currentUser: { name: 'Demo User', avatarSrc: '/images/avatars/avatar-06.webp' }, onPost: noop, onReply: noop, onDelete: () => {} },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
}

export const Default = {}

export const Empty = { args: { comments: [] } }

export const Loading = { args: { comments: [], loading: true } }

export const SignedOut = { args: { currentUser: null } }
