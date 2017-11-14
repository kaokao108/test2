import Showtime from '../models/showtime'
import _ from 'lodash'
import { ErrorLogger } from '../utils/index'

export const getShowtimes = (req, res) => {
  Showtime.find((err, showtime) => {
    if (err) {
      ErrorLogger(res, err.message, 'Fails to get showtimes.')
    } else {
      res.status(200).json(showtime)
    }
  })
}
export const deleteShowtimes = (req, res) => {
  Showtime.remove({}, () => {
    res.status(200).json({ message: 'Table Showtime truncated.'})
  })
}
