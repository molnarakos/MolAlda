'use strict'

require('dotenv').config()

const fastify = require('fastify')({ logger: true })
const nodemailer = require('nodemailer')
const path = require('path')

// Plugins
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/'
})
fastify.register(require('@fastify/formbody'))

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Routes
fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html')
})

fastify.post('/arajanlat', async (request, reply) => {
  const { nev, email, tipus, reszletek } = request.body

  if (!nev || !email || !tipus) {
    return reply.code(400).send({ success: false, message: 'Hiányzó mezők!' })
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: `Új árajánlat kérés - ${nev}`,
    html: `
      <h2>Új árajánlat kérés érkezett!</h2>
      <p><strong>Név:</strong> ${nev}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Projekt típus:</strong> ${tipus}</p>
      <p><strong>Részletek:</strong> ${reszletek || 'Nem adott meg részleteket.'}</p>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return reply.send({ success: true, message: 'Árajánlat kérés elküldve!' })
  } catch (err) {
    fastify.log.error(err)
    return reply.code(500).send({ success: false, message: 'Email küldési hiba!' })
  }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })
    console.log(`🚀 MolAlda szerver fut: http://localhost:${process.env.PORT || 3000}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
