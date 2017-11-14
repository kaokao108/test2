import mongoose from 'mongoose'

let ShowtimeSchema = new mongoose.Schema({
  cinema: String,
  theater: String,
  showtime_info: String,
  created_at: Date,
  updated_at: Date
})

// use function insteat of => to bind this
// ref: http://stackoverflow.com/questions/37365038/this-is-undefined-in-a-mongoose-pre-save-hook
ShowtimeSchema.pre('save', function (next) {
  let st = this
  if (!st.created_at) {
    st.created_at = new Date()
  } else {
    st.updated_at = new Date()
  }
  next()
})

export default mongoose.model('Showtime', ShowtimeSchema)

