import Api from '@/services/Api'

export function login (credentials) {
  return Api().post('auth', credentials)
}

export function resetPassword (credentials) {
  return Api().post('auth/password', credentials)
}

export function resetUserkey () {
  return Api().post('auth/userkey')
}

export function checkAuth (updatedAt) {
  return Api().get('auth', {params: {updatedAt}})
}

export function set2FA (enabled) {
  return Api().post('auth/2fa', {
    enabled
  })
}
