const _HELP = ['h', 'H', 'help', 'Help', '你會幹嘛', '你會幹麻']
const _THEATER = ['BQ']

export const commandType = (message) => {
  if (_HELP.indexOf(message) > -1) {
    return 'HELP'
  } else if (_THEATER.indexOf(message) > -1) {
    return 'THEATER'
  } else {
    return 'NONSENSE'
  }

}
