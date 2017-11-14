import _ from 'lodash'
import mongodb from 'mongodb'
import mongoose from 'mongoose' // MongoDB ORM

import Showtime from '../../models/showtime'
import { getShowtimes } from '../crawlers/vieshow.js'
import CinemaLists from '../datas/cinemas.js'


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://kaokao123:zasdc108896@ds251985.mlab.com:51985/kaokao'
let db

mongoose.connect(MONGODB_URI)
mongoose.Promise = global.Promise
db = mongoose.connection

db.on('error', (err) => {
  console.error('MongoDB connection error: ', err)
  process.exit(1)
})
db.on('open', () => {
  console.log('db connected')
  // trucated DB
  Showtime.remove({}, () => {
    console.log('Showtimes table trunctated.')
    _.map(CinemaLists, (cinema, theaterId) => {
      getShowtimes(theaterId).then((showtime) => {
        let showtime_info = {}
        let st = new Showtime()
        st.cinema = 'vieshow'
        st.theater = theaterId
        try {
          showtime_info = JSON.stringify(showtime)
        } catch(err) {
          console.log(`${theaterId} error: ${err}`)
        }
        st.showtime_info = showtime_info
        st.save((err) => {
          if(err) {
            ErrorLogger(res, err.message, 'Failed to create new message.')
            console.log(`Save theater${_theaterId} into DB Error`)
          } else {
            console.log(`[${theaterId}] save success`)
          }
        })

      })
    })
  })
})

setTimeout(() => {
  console.log('disconnect db')
  mongoose.disconnect()
}, 10000)
