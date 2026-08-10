/** TODO: Replace with live APIs when backend endpoints are available. */

export const TODO_MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Low stock alert',
    message: '3 products are running low on inventory.',
    time: '2h ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'New order received',
    message: 'A customer placed a new paid order.',
    time: '5h ago',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Payment gateway healthy',
    message: 'Razorpay connection is active.',
    time: '1d ago',
    unread: false,
  },
]

export const TODO_MOCK_SYSTEM_STATUS = [
  { id: 'server', label: 'Server', status: 'healthy', detail: 'API responding normally' },
  { id: 'database', label: 'Database', status: 'healthy', detail: 'MongoDB connected' },
  { id: 'storage', label: 'Storage', status: 'warning', detail: 'TODO: Live storage metrics API' },
  { id: 'api', label: 'API', status: 'healthy', detail: 'REST endpoints operational' },
  { id: 'email', label: 'Email', status: 'warning', detail: 'TODO: SMTP health check API' },
  { id: 'payment', label: 'Payment Gateway', status: 'healthy', detail: 'Razorpay configured' },
]

export const TODO_MOCK_SHORTCUTS = {
  pinned: [
    { label: 'Products', to: '/admin/products' },
    { label: 'Orders', to: '/admin/orders' },
    { label: 'Categories', to: '/admin/categories' },
  ],
  recent: [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Users', to: '/admin/users' },
  ],
  searches: ['wall clock', 'name plate', 'pending orders'],
}
