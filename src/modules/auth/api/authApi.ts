import { ApiError } from '../../../common/api/apiError'
import { clearAccessToken, getAccessToken, setAccessToken } from '../../../common/utils/tokenStorage'

export type UserMode = 'PUBLIC' | 'PRIVATE'

export type User = {
  id: string
  email: string
  displayName: string
  mode: UserMode
  createdAt: string
  updatedAt: string
}

export type RegisterPayload = {
  email: string
  password: string
  displayName: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterResponse = {
  message: string
}

export type LoginResponse = {
  accessToken: string
}

const normalizeDisplayName = (displayName: string): string => displayName.trim()

export const createAuthApi = (baseUrl: string) => {
  const sanitizedBaseUrl = baseUrl.replace(/\/$/, '')

  const request = async <T>(path: string, options: RequestInit = {}, authRequired = true): Promise<T> => {
    const headers = new Headers(options.headers ?? {})

    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json')
    }

    if (authRequired) {
      const token = getAccessToken()
      if (!token) {
        throw new ApiError(401, 'Missing access token. Please log in.')
      }
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${sanitizedBaseUrl}${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let message = `Request failed: ${response.status}`
      try {
        const errorBody = (await response.json()) as { message?: string }
        if (errorBody?.message) {
          message = errorBody.message
        }
      } catch {
        // no-op
      }
      if (response.status === 401 && authRequired) {
        window.dispatchEvent(new Event('drawback:unauthorized'))
      }
      throw new ApiError(response.status, message)
    }

    if (response.status === 204) {
      return null as T
    }

    return (await response.json()) as T
  }

  const register = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    return request<RegisterResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          email: payload.email.trim(),
          password: payload.password,
          displayName: normalizeDisplayName(payload.displayName),
        }),
      },
      false,
    )
  }

  const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    const result = await request<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({
          email: payload.email.trim(),
          password: payload.password,
        }),
      },
      false,
    )

    setAccessToken(result.accessToken)
    return result
  }

  return {
    register,
    login,
    request,
    getAccessToken,
    setAccessToken,
    logout: clearAccessToken,
  }
}

export type AuthApi = ReturnType<typeof createAuthApi>
