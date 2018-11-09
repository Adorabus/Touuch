const requiredVariables = [
  'DB_PASS',
  'FILE_HASH_KEY',
  'JWT_SECRET'
]

requiredVariables.forEach((variable) => {
  if (!process.env[variable]) {
    console.error(`Missing required environment variable! [${variable}]`)
    process.exit(1)
  }
})

if (process.env.NODE_ENV === 'development') {
  console.log('Development Mode')
} else if (process.env.NODE_ENV !== 'production') {
  console.log(`Unknown NODE_ENV value "${process.env.NODE_ENV}".`)
}
