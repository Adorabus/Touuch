import Api from '@/services/Api'

export function register (credentials) {
  return Api().post('users', credentials)
}

export function getUser (username) {
  return Api().get(`users/${username}`)
}

export function indexUsers (params) {
  return Api().get('users', {params})
}

export function editUser (username, edits) {
  return Api().put(`users/${username}`, edits)
}

export function remove2FA (username) {
  return Api().put(`users/${username}/remove_2fa`)
}

export function getSelf () {
  return Api().get('users/me')
}

export function getSelfDetails () {
  return Api().get('users/me/details')
}
