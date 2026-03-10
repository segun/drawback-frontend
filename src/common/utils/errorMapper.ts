import { ApiError } from '../api/apiError'

export const mapErrorToMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return error.message || 'Validation failed. Please check your input.'
    }
    if (error.status === 401) {
      return error.message || 'Invalid credentials or account not activated yet.'
    }
    if (error.status === 403) {
      return error.message || 'You are not allowed to perform this action.'
    }
    if (error.status === 404) {
      return error.message || 'The requested resource was not found.'
    }
    if (error.status === 409) {
      return error.message || 'Email or display name is already in use.'
    }
    return error.message || `Request failed with status ${error.status}.`
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
