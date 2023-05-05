import express from 'express'

const app = express()

app.listen(5000, () => {
  console.log('Server listening on port 5000...')
})

app.use(express.static('dist/public'))

// For debuging
app.use('/src/public/', express.static('src/public'))
