export const ErrorLogger = (res, reason, message, code) => {
  console.log('[ErrorLogger]: ' + reason)
  res.status(code || 500).json({ error: message})
}
