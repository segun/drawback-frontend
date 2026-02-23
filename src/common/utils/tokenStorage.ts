const ACCESS_TOKEN_KEY = 'drawkcab-access-token'

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY)

export const setAccessToken = (token: string | null): void => {
  if (!token) {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    return
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const clearAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}
