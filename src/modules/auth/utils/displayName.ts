const DISPLAY_NAME_REGEX = /^@[a-zA-Z0-9_]{2,29}$/

export const isValidDisplayName = (displayName: string): boolean => {
  return DISPLAY_NAME_REGEX.test(displayName.trim())
}
