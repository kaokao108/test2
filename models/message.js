import mongoose from 'mongoose'

let MessageSchema = new mongoose.Schema({
  user: String,
  message: String,
  created_at: Date,
  updated_at: Date
})

// use function insteat of => to bind this
// ref: http://stackoverflow.com/questions/37365038/this-is-undefined-in-a-mongoose-pre-save-hook
MessageSchema.pre('save', function (next) {
  let msg = this
  if (!msg.created_at) {
    msg.created_at = new Date()
  } else {
    msg.updated_at = new Date()
  }
  next()
})

export default mongoose.model('Message', MessageSchema)
