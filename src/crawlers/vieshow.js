import Crawler from 'js-crawler'
import Cheerio from 'cheerio'
import _ from 'lodash'
import Promise from 'promise'

export const getShowtimes = (_theaterId) => {
  const crawler = new Crawler().configure({ maxRequestsPerSecond: 10 })
  const showtimePromise = new Promise((resolve, reject) => {
    crawler.crawl({
      url: `http://www.vscinemas.com.tw/visPrintShowTimes.aspx?cid=${_theaterId}&visLang=2`,
      success: (page) => {
        const html = page.content.toString()
        const $ = Cheerio.load(html)
        let tables = $('.PrintShowTimesFilm').parent().parent().parent().find('table')
        let showtimes = []
        _.map(tables, (table, idx) => {
          let title = $(table).find('.PrintShowTimesFilm').text()
          const showtimesDay = _getShowtimesDay($(table))
          let cinemaType = []
          let rating = ''
          let label = ''
          if (title.indexOf('普遍級') > 0) {
            rating = 'G'
          } else if (title.indexOf('保護級') > 0) {
            rating = 'PG'
          } else if (title.indexOf('輔12級') > 0) {
            rating = 'PG 12'
          } else if (title.indexOf('輔15級') > 0) {
            rating = 'PG 15'
          } else if (title.indexOf('限制級') > 0) {
            rating = 'R'
          }
          title = title.replace(/\(普遍級\)|\(保護級\)|\(輔12級\)|\(輔15級\)|\(限制級\)|/g, '')
          let originalTitle = title.trim().replace(/ /g, '')

          // filter cinemaType
          label = title.split('\)')[0]
          title = title.split('\)')[1].replace(/ /g, '')
          cinemaType = _getCinemaType(label)
          showtimes.push({
            title: {
              original: originalTitle,
              zh_tw:title,
            },
            rating,
            cinemaType: _.uniq(cinemaType),
            showtimesDay,
            movieId: null,
            poster: null
          })

        })
        resolve(showtimes)

      },
      failure: (page) => {
        console.log(`Get Showtimes Failed on theater: ${_theaterId}`)
        reject([])
      }
    })
  })
  return showtimePromise

}

const _getShowtimesDay = (table) => {
  let showtimesDay = []
  let t = table.find('.PrintShowTimesDay');
  let s = table.find('.PrintShowTimesSession');
  _.map(t, (tmp, idx) => {
    let day = tmp.children[0].data
    day = (new Date()).getFullYear() + '/' + day.split(' ')[0].replace(/月/g,'/').replace(/日/g,'')
    const timestamp = (new Date(day)).getTime()
    showtimesDay[idx] = {
      day,
       timestamp
    }
  })
  _.map(s, (tmp, idx) => {
    showtimesDay[idx].sessions =  tmp.children[0].data.replace(/ /g, '').split(',')
  })
  return showtimesDay

}
const _getCinemaType = (label) => {
  let cinemaType = []
  if (label.indexOf('數位') > 0) {
    cinemaType.push('digital')
  }
  if (label.indexOf('3D') > 0) {
    cinemaType.push('3d')
  }
  if (label.indexOf('未來3D') > 0) {
    cinemaType.push('futuristic 3d')
    cinemaType = _.filter(cinemaType, (n) => {
      return n !== '3d'
    })
  }
  if (label.indexOf('4D') > 0) {
    cinemaType.push('4d')
  }
  if (label.indexOf('4DX') > 0) {
    cinemaType.push('4dx')
    cinemaType = _.filter(cinemaType, (n) => {
      return n !== '4d'
    })
  }
  if (label.indexOf('IMAX') > 0) {
      cinemaType.push('imax')
  }
  if (label.indexOf('GC') > 0) {
    cinemaType.push('gc')
  }
  if (label.indexOf('MAPPA') > 0) {
    cinemaType.push('mappa')
  }
  if (label.indexOf('國') > 0) {
    cinemaType.push('chinese')
  }
  if (label.indexOf('英') > 0) {
    cinemaType.push('english')
  }
  return cinemaType
}
