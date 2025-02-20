import { getStorageEntry } from '../utils'

export const getLastUsedRouteId = () =>
  getStorageEntry<string | null>({ key: 'lastUsedRoute' })
