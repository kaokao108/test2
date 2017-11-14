import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import mongodb from 'mongodb'
import mongoose from 'mongoose' // MongoDB ORM
import _ from 'lodash'
import LINEBot from 'line-messaging'
import cors from 'cors'
import googleMapsClient from '@google/maps'

import Router from './router'
import Cinemas from '../src/datas/cinemas'
import { channelID, channelSecret, channelToken } from '../config/line-bot'
import { commandType } from '../src/textCommand'
import Showtime from '../models/showtime'

const googleMapsClient = require('@google/maps').createClient({ key: 'AIzaSyAl7wJfWGWrf9_eNfedFob_qpFMYHDN99M' })
let app = express()
const server = require('http').Server(app)
let bot = LINEBot.create({
  channelID,
  channelSecret,
  channelToken
}, server)

app.use(bot.webhook('/webhook'))
//lint bot

bot.on(LINEBot.Events.MESSAGE, (replyToken, message) => {
  // add code below.
  // console.log('message', message)
  const msgId = message.getMessageId()
  const msgType = message.getMessageType()
  console.log('messageType', msgType)
  const userId = message.getUserId()
  switch (msgType) {
    case 'text':

      const msg = message.getText()
      switch(commandType(msg)) {
        case 'HELP':
          const helpMessage = '1. 傳你的位址給我，我可以跟你說離你最近的五個威秀影城'
          bot.replyTextMessage(replyToken, helpMessage)
            .then((data) => {
              console.log('send text success', data)
            })
            .catch((err) => {
              console.log('send text error', err)
            })
          break
        case 'THEATER':
          console.log('theater', msg)
          Showtime.find({ theater: msg }, (err, st) => {
            let text = ''

            if (err) {
              text = '找無'
            } else {
              const showtime_info = JSON.parse(st[0].showtime_info)
              console.log('st', showtime_info)
              const movies = _.map(showtime_info, 'title.zh_tw').toString()
              console.log('movies', movies)
              bot.replyTextMessage(replyToken, movies)
                .then((data) => {
                  console.log('send text success', data)
                })
                .catch((err) => {
                  console.log('send text error', err)
                })
            }
          })
          break;

        case 'NONSENSE':
          bot.getProfile(userId).then(
            (profile) => {
              const { displayName, pictureUrl, statusMessage } = profile
              console.log(`Message sent from USER[${displayName}, ${pictureUrl}, ${statusMessage}] : ${msg}`)
              const text = `寶寶關注 ${displayName} 很久，但寶寶不說;寶寶有你的大頭貼，但寶寶也不說`
              bot.replyTextMessage(replyToken, '收到訊息啦: ' + msg,  text, pictureUrl)
                .then((data) => {
                  console.log('send text success', data)
                })
                .catch((err) => {
                  console.log('send text error', err)
                })
            },
            (err) => {
              console.log('error', JSON.stringify(err))
            }
          )
          break
      }
      break
    case 'location':
      const address = message.getAddress()
      const latitude = message.getLatitude()
      const longitude = message.getLongitude()
      console.log(`address: ${address}, latitude: ${latitude}, longitude: ${longitude}`)
      const origins = `${latitude},${longitude}`
      let destinations = []
      let CinemasList = _.map(Cinemas, (cinema, idx) => {
        cinema.id = idx
        destinations.push(cinema.address)
        return cinema
      })

      const payload = {
        origins,
        destinations,
        units: 'metric',
        language: 'zh-TW'
      }
      const GoogleMapPromise = new Promise((resolve, reject) => {
        googleMapsClient.distanceMatrix(payload, (err, res) => {
          if (!err) {
            // const locations = _.sortBy(res.json.rows[0].elements, (location) => {
            //   return location.duration.value
            // })
            console.log('Google Distance Matrix Response', JSON.stringify(res.json))
            const distanceMatrix = res.json.rows[0].elements
            // map distanceMatrix to Cinemas
            CinemasList = _.map(CinemasList, (c, idx) => {
              const { duration, distance } = distanceMatrix[idx]
              c = _.assign(c, {
                duration,
                distance
              })
              return c
            })
            // sortBy duration
            CinemasList = _.sortBy(CinemasList, (c) => {
              return c.duration.value
            })
            CinemasList = _.slice(CinemasList, 0, 5)
            resolve(CinemasList)
            // console.log('res', JSON.stringify(CinemasList))
          }
        })
      })
      GoogleMapPromise.then((cinemaList) => {
        let columns = _.map(cinemaList, (c) => {
          let column = new LINEBot.CarouselColumnTemplateBuilder()
          column
            .setTitle(c.text)
            .setMessage(`距離${c.distance.text}，開車前往需要${c.duration.text}`)
            .setThumbnail(c.thumbnail)
            .addAction('用 Google Map 導航', `https://www.google.com.tw/maps/place/${c.address}`, LINEBot.Action.URI)

          return column

        })
        const carousel = new LINEBot.CarouselTemplateBuilder(columns)
        const template = new LINEBot.TemplateMessageBuilder('以下為距離你最近的五個威秀影城', carousel)
        bot.replyMessage(replyToken, template)
        // bot.replyTextMessage(replyToken, '以下為距離你最近的威秀影城', cinema1, cinema2, cinema3, cinema4)
          .then((data) => {
            console.log('send text success', data)
          })
          .catch((err) => {
            console.log('send text error', err)
          })
      })
      break
    default:
      console.log('yo')

  }

})

app.use(cors())
app.use(bodyParser.json());

// register api routes
app.use('/api', Router)
app.use(express.static(__dirname + "/public"))
// 
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://<dbuser>:<dbpassword>@ds251985.mlab.com:51985/kaokao'
let db

mongoose.connect(MONGODB_URI)
// Plugging in your own Promises Library using ES6 Promise
// Ref: http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise

db = mongoose.connection

db.on('error', (err) => {
  console.error('MongoDB connection error: ', err)
  process.exit(1)
})
db.on('open', () => {
  server.listen(process.env.PORT || 3000)
  const port = server.address().port
  console.log('App now running on port', port)
})



// routes

app.get('/', (req, res) => {
  res.json({
    message: 'This is better-vieshow line bot api',
    timestamp: (new Date()).getTime()
  })
})
// app.get('/*', (req, res) => {
//   res.redirect('/')
// })



