import express from 'express'
import { getMessages, postMessages, deleteMessages, getMessageById, deleteMessageById } from '../controllers/message'
import { getShowtimes, deleteShowtimes } from '../controllers/showtime.js'

const Router = express.Router()

Router.get('/', (req, res) => {
  res.status(200).json({ message: 'api index'})
})

// messagesRoute (plural)
const messagesRoute = Router.route('/messages')

messagesRoute
  .get(getMessages)
  .post(postMessages)
  .delete(deleteMessages)

// messageRoute (singular)
const messageRoute = Router.route('/messages/:_messageId')
// create endpoint /api/messages/:_messageId for GET
messageRoute
  .get(getMessageById)
  .delete(deleteMessageById)

const showtimesRoute = Router.route('/showtimes')
showtimesRoute.get(getShowtimes).delete(deleteShowtimes)

export default Router
