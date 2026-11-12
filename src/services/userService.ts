import { usersMock } from '@/mocks/users.mock'
import type { InviteUserInput, TeamMember, UsersData } from '@/types'
import { fromMock, type RequestOptions } from './api/mockTransport'

const initialsFrom = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const userService = {
  get: (opts?: RequestOptions): Promise<UsersData> => fromMock(usersMock, 350, opts?.signal),
  invite: (input: InviteUserInput): Promise<TeamMember> =>
    fromMock<TeamMember>(
      { id: `u-${Date.now()}`, name: input.name, initials: initialsFrom(input.name), role: input.role, email: input.email, status: 'Invited', access: 'Staff' },
      400,
    ),
}
