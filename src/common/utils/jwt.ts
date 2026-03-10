export type AdminJwtPayload = {
  sub: string
  email: string
  displayName: string
  role: string
  iat: number
  exp: number
}

type JwtPayload = {
  role?: string
  exp?: number
}

const decodeBase64Url = (base64Url: string): string => {
  const base64 = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(base64Url.length / 4) * 4, '=')

  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export const decodeJwtPayload = <T extends object>(token: string): T | null => {
  if (!token) {
    return null
  }

  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const payloadJson = decodeBase64Url(parts[1])
    return JSON.parse(payloadJson) as T
  } catch {
    return null
  }
}

export const getJwtPayloadFromToken = <T extends object>(token: string | null): T | null => {
  if (!token) {
    return null
  }
  return decodeJwtPayload<T>(token)
}

export const hasAdminRole = (payload: JwtPayload | null): boolean => {
  return payload?.role === 'ADMIN'
}

export const isJwtExpired = (payload: JwtPayload | null, nowMs = Date.now()): boolean => {
  if (!payload?.exp) {
    return true
  }

  return payload.exp * 1000 <= nowMs
}

export const isValidAdminToken = (token: string | null): boolean => {
  const payload = getJwtPayloadFromToken<AdminJwtPayload>(token)
  if (!payload) {
    return false
  }

  return hasAdminRole(payload) && !isJwtExpired(payload)
}
