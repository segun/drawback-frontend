import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../common/api/apiError'
import { clearAccessToken, getAccessToken } from '../../../common/utils/tokenStorage'
import { isValidAdminToken } from '../../../common/utils/jwt'
import { createAdminApi } from '../api/adminApi'

type AdminRedirectNotice = {
  noticeText: string
  noticeType?: 'info' | 'success' | 'error'
}

export const useAdminSessionGuard = () => {
  const adminApi = useMemo(() => createAdminApi(import.meta.env.VITE_BACKEND_URL), [])
  const navigate = useNavigate()
  const [isAuthorized, setIsAuthorized] = useState(false)

  const redirectToLogin = useCallback((state: AdminRedirectNotice) => {
    clearAccessToken()
    navigate('/admin', { replace: true, state })
  }, [navigate])

  const handleUnauthorizedError = useCallback((error: unknown): boolean => {
    if (!(error instanceof ApiError)) {
      return false
    }

    if (error.status === 401) {
      redirectToLogin({
        noticeText: 'Your admin session has expired. Please sign in again.',
        noticeType: 'error',
      })
      return true
    }

    if (error.status === 403) {
      redirectToLogin({
        noticeText: 'Admin access required.',
        noticeType: 'error',
      })
      return true
    }

    return false
  }, [redirectToLogin])

  useEffect(() => {
    if (!isValidAdminToken(getAccessToken())) {
      redirectToLogin({
        noticeText: 'Please sign in with an admin account.',
        noticeType: 'error',
      })
      return
    }

    setIsAuthorized(true)
  }, [redirectToLogin])

  useEffect(() => {
    if (!isAuthorized) {
      return
    }

    const onUnauthorized = () => {
      redirectToLogin({
        noticeText: 'Your admin session has expired. Please sign in again.',
        noticeType: 'error',
      })
    }

    window.addEventListener('drawback:unauthorized', onUnauthorized)
    return () => window.removeEventListener('drawback:unauthorized', onUnauthorized)
  }, [isAuthorized, redirectToLogin])

  const logout = useCallback(() => {
    redirectToLogin({
      noticeText: 'Signed out from admin.',
      noticeType: 'info',
    })
  }, [redirectToLogin])

  return {
    adminApi,
    isAuthorized,
    redirectToLogin,
    handleUnauthorizedError,
    logout,
  }
}