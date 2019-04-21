import Api from '@/services/Api'

export function indexFiles (params) {
  return Api().get('files', {params})
}
