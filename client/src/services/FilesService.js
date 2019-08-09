import Api from '@/services/Api'

export function indexFiles (params) {
  return Api().get('files', {params})
}

export function removeFiles (urls) {
  return Api().delete('files', {
    params: {urls}
  })
}
