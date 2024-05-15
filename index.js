const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

// const corsOptions = {
//   origin: [
//     'http://localhost:5173',
//     'http://localhost:5174',
//     'https://aspirant-blog.web.app',
//   ],
//   credentials: true,
//   optionSuccessStatus: 200,
// }

// middleware
// app.use(cors(corsOptions))
app.use(cors())
app.use(express.json())

// console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster5.quddw3k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster5`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect()

    const blogsCollection = client
      .db('All-Blogs')
      .collection('blogs-by-category-search')

    const featuredBlogCollection = client
      .db('All-Blogs')
      .collection('wishlist-items')

    app.get('/allBlogs', async (req, res) => {
      const limit = req.query._limit ? parseInt(req.query._limit) : undefined
      let query = {}
      if (req.query?.category) {
        query = { category: req.query.category }
      }
      console.log(req.query)

      if (req.query?.title) {
        query = { title: req.query.title }
      }

      const cursor = blogsCollection.find(query)
      const allBlogs = await cursor.toArray()

      let results = allBlogs
      if (limit !== undefined) {
        results = allBlogs.slice(0, limit) // Limit the results to the specified number
      }

      res.send(results)
    })

    app.get('/allBlogs/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await blogsCollection.findOne(query)
      res.send(result)
    })

    app.post('/addBlog', async (req, res) => {
      const blog = req.body
      console.log(blog)
      const result = await blogsCollection.insertOne(blog)
      res.send(result)
    })

    app.post('/addToWishList', async (req, res) => {
      const item = req.body
      const result = await featuredBlogCollection.insertOne(item)
      res.send(result)
    })

    app.get('/wishListBlogs', async (req, res) => {
      const result = await featuredBlogCollection.find().toArray()
      res.send(result)
    })
    app.delete('/wishListBlogs/:id', async (req, res) => {
      const id = req.params.id
      const result = await featuredBlogCollection.deleteOne(id).toArray()
      res.send(result)
    })

    // app.get('/services/:id', async (req, res) => {
    //   const id = req.params.id
    //   const query = { _id: new ObjectId(id) }

    //   const options = {
    //     // Include only the `title` and `imdb` fields in the returned document
    //     projection: { title: 1, price: 1, service_id: 1, img: 1 },
    //   }

    //   const result = await serviceCollection.findOne(query, options)
    //   res.send(result)
    // })

    // // bookings
    // app.get('/bookings', async (req, res) => {
    //   //   console.log(req.query.email)
    //   let query = {}
    //   if (req.query?.email) {
    //     query = { email: req.query.email }
    //   }
    //   const result = await bookingCollection.find(query).toArray()
    //   res.send(result)
    // })

    // app.post('/bookings', async (req, res) => {
    //   const booking = req.body
    //   //   console.log(booking)
    //   const result = await bookingCollection.insertOne(booking)
    //   res.send(result)
    // })

    // app.patch('/bookings/:id', async (req, res) => {
    //   const id = req.params.id
    //   const filter = { _id: new ObjectId(id) }
    //   const updatedBooking = req.body
    //   //   console.log(updatedBooking)
    //   const updateDoc = {
    //     $set: {
    //       status: updatedBooking.status,
    //     },
    //   }
    //   const result = await bookingCollection.updateOne(filter, updateDoc)
    //   res.send(result)
    // })

    // app.delete('/bookings/:id', async (req, res) => {
    //   const id = req.params.id
    //   const query = { _id: new ObjectId(id) }
    //   const result = await bookingCollection.deleteOne(query)
    //   res.send(result)
    // })

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('My Server is running ...')
})

app.listen(port, () => {
  console.log(`My Project Server is running on port ${port}`)
})
