import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Menu, User, LogOut } from 'lucide-react'

type HeaderProps = {
  isLoggedIn: boolean
  onMenuClick?: () => void
  onLogout?: () => void
  onProfileClick?: () => void
}

export function Header({ isLoggedIn, onMenuClick, onLogout, onProfileClick }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [, setLocation] = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleProfileClick = () => {
    setIsDropdownOpen(false)
    if (onProfileClick) {
      onProfileClick()
    } else {
      setLocation('/dashboard')
    }
  }

  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    onLogout?.()
  }

  return (
    <header
      className={`${isLoggedIn ? 'border-b border-rose-300 bg-rose-200/80' : 'mb-6 border-b border-rose-300 bg-rose-200/80'}`}
    >
      <nav
        className={`mx-auto flex w-full items-center justify-between ${isLoggedIn ? 'max-w-screen-2xl px-1 py-2' : 'max-w-xl px-4 py-3'}`}
      >
        <button
          type="button"
          onClick={() => setLocation('/')}
          aria-label="Home"
          className="rounded-md border border-rose-300 hover:opacity-80 transition-opacity"
        >
          <img
            src="/images/logo/logo_main.jpg"
            alt="DrawkcaB logo"
            className={`${isLoggedIn ? 'h-10 w-32' : 'h-12 w-36'} rounded-md border border-rose-300 object-cover`}
          />
        </button>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="User menu"
                className="rounded-md border border-rose-400 bg-rose-300 p-2 text-rose-700 hover:bg-rose-400 transition-colors"
              >
                <User className="h-5 w-5" aria-hidden="true" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-rose-300 bg-rose-100 shadow-lg z-50">
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200 rounded-t-md transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200 rounded-b-md transition-colors border-t border-rose-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <span className="rounded-md border border-rose-400 bg-rose-300 px-3 py-1 text-sm font-medium">
              Signed out
            </span>
          )}
          {isLoggedIn && onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="rounded-md border border-rose-400 bg-rose-300 p-2 text-rose-700 hover:bg-rose-400 lg:hidden transition-colors"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}
