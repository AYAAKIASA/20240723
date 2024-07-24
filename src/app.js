import express from 'express'
import connectDB from './schemas/index.js'
import productRouter from './routers/products.router.js'
import { errorHandler } from './middlewares/error-handler.middleware.js'

const app = express()

app.use(express.json())
app.use('/products', productRouter)
app.use(errorHandler)

connectDB()

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
