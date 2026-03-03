import { DISPLAY_NAME_PATTERN } from './validationPatterns'

export const isValidDisplayName = (displayName: string): boolean => {
  return DISPLAY_NAME_PATTERN.test(displayName.trim())
}
