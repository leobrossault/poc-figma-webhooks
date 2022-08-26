require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const ngrok = require('ngrok')
const axios = require('axios')
const crypto = require('crypto')

const PORT = 3000
const app = express()
const passcode = crypto.randomBytes(48).toString('hex')

app.use(bodyParser.json())

app.post('/', (request, response) => {
  if (request.body.passcode === passcode) {
    const { file_name, timestamp } = request.body
    console.log(`${file_name} was updated at ${timestamp}`)
    response.sendStatus(200)
  } else {
    response.sendStatus(403)
  }
})

app.listen(PORT, () => console.log(`Server running on : http://localhost:${PORT}`))

ngrok.connect(PORT).then(async (endpoint) => {
  try {
    const response = await axios({
      url: 'https://api.figma.com/v2/webhooks',
      method: 'post',
      headers: {
        'X-Figma-Token': process.env.DEV_TOKEN
      },
      data: {
        event_type: 'FILE_UPDATE',
        team_id: process.env.TEAM_ID,
        passcode,
        endpoint
      }
    })

    console.log(response)
  } catch(error) {
    console.log(error)
  }
})
