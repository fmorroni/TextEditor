import express from 'express'

const app = express()

app.listen(5000, () => {
  console.log('Server listening on port 5000...')
})

app.use(express.static('dist/public'))
app.use(express.static('dist/html'))
app.use(express.static('dist/css'))

// For debuging
app.use('/src/public/', express.static('src/public'))

