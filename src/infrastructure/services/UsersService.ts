import { httpClient } from '@/infrastructure/api/httpClient'
import type { User } from '@/types/user'

class UsersService {
  async list(): Promise<User[]> {
    const { data } = await httpClient.get<User[]>('/users')
    return data
  }

  async getById(userId: string): Promise<User> {
    const { data } = await httpClient.get<User>(`/users/${userId}`)
    return data
  }
}

export const usersService = new UsersService()
