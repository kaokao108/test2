import Message from '../models/message'
import _ from 'lodash'
import { ErrorLogger } from '../utils/index'

export const getMessages = (req, res) => {
  Message.find((err, messages) => {
    if (err) {
      ErrorLogger(res, err.message, 'Failed to get messages.')
    } else {
      res.status(200).json(messages)
    }
  })
}
export const postMessages = (req, res) => {
  let payload = req.body
  console.log('[Message] payload :', JSON.stringify(payload))

  if (!_.has(payload, 'user')) {
    ErrorLogger(res, 'Invalid payload.', 'Must contain user field', 400)
  } else if (!_.has(payload, 'message')) {
    ErrorLogger(res, 'Invalid payload.', 'Must contain message field', 400)
  } else {
    let msg = new Message()
    const { user, message } = payload
    msg.user = user
    msg.message = message
    msg.save((err) => {
      if(err) {
        ErrorLogger(res, err.message, 'Failed to create new message.')
      } else {
        res.status(201).json(msg)
      }
    })
  }
}
export const deleteMessages = (req, res) => {
  Message.remove({}, () => {
    res.status(200).json({ message: 'Table Message truncated.'})
  })
}
export const getMessageById = (req, res) => {
  Message.findById(req.params._messageId, (err, message) => {
    if (err) {
      ErrorLogger(res, err, 'Messages doesnt exist.', 400)
    } else {
      res.json(message)
    }
  })
}
export const deleteMessageById = (req, res) => {
  const { _messageId } = req.params
  Message.findByIdAndRemove(_messageId, (err) => {
    if (err) {
      ErrorLogger(res, err, 'Messages doesnt exist.', 400)
    } else {
      res.status(200).json({ message: `Message(${_messageId}) is deleted.`})
    }
  })
}
