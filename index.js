const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');


const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())
app.use(fileUpload())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0i8x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const blogsCollection = client.db("end-game").collection("blogs");
        const usersCollection = client.db("end-game").collection("users");



        // app.post('/rider', async (req, res) => {
        //     // console.log(req.body)
        //     console.log(req.files)
        //     const name = req.body.name;
        //     const email = req.body.email;
        //     const age = req.body.age;
        //     const address = req.body.address;
        //     const phone = req.body.phone;
        //     const area = req.body.area;
        //     const carName = req.body.carName;
        //     const model = req.body.model;
        //     const plate = req.body.plate;
        //     const pass1 = req.body.pass1;
        //     const pass2 = req.body.pass2;
        //     const type = req.body.type;
        //     const role = req.body.role;

        //     const licence = req.files.licence;
        //     const nid = req.files.nid;
        //     const profile = req.files.profile;

        //     const licenceData = licence.data;
        //     const nidData = nid.data;
        //     const profileData = profile.data;

        //     const encodeLicence = licenceData.toString('base64');
        //     const encodeNid = nidData.toString('base64');
        //     const encodeProfile = profileData.toString('base64');

        //     const licenceBuffer = Buffer.from(encodeLicence, 'base64');
        //     const nidBuffer = Buffer.from(encodeNid, 'base64');
        //     const profileBuffer = Buffer.from(encodeProfile, 'base64');
        //     const rider = {
        //         name,
        //         email,
        //         age,
        //         address,
        //         phone, area,
        //         carName,
        //         model,
        //         plate,
        //         pass1,
        //         pass2,
        //         type,
        //         role,
        //         licence: licenceBuffer,
        //         nid: nidBuffer,
        //         profile: profileBuffer
        //     }
        //     const result = await ridersCollection.insertOne(rider);
        //     res.json(result)
        // })

        // add user
        // save user api
        app.post('/users', async (req, res) => {
            const user = req.body;
            user["role"] = "user";
            const result = await usersCollection.insertOne(user);
            console.log('new user data saved');
            res.json(result);
        })

        //update user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, option);
            res.json(result)
            console.log(result);
        })

        //get
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const result = await cursor.toArray();
            res.json(result)
        })

        // app.get('/users/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const filter = { email: email };
        //     const result = await usersCollection.findOne(filter);

        //     res.json(result)
        // })

        // check user role admin or not 
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            console.log('admin : ', isAdmin, user);
            res.json(isAdmin);
        })
        //make admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user);
            if (user.role === 'user') {
                const filter = { email: user.email };
                const updateDoc = { $set: { role: 'admin' } };
                const result = await usersCollection.updateOne(filter, updateDoc);

                console.log('user role set to admin');

                const data = { result, role: 'admin' }
                res.json(data);
            }
            // console.log(user)
            else {
                const filter = { email: user.email };
                const updateDoc = { $set: { role: 'user' } };
                const result = await usersCollection.updateOne(filter, updateDoc);
                console.log('user role set to user');
                const data = { result, role: 'user' }
                res.json(data);
            }
        })






        // save blogs api
        app.post('/blogs', async (req, res) => {
            const data = req.body;
            const result = await blogsCollection.insertOne(data);

            res.json(result);
        })
        // blog collection
        app.get("/blogs", async (req, res) => {
            const cursor = blogsCollection.find({});
            const blogs = await cursor.toArray();
            res.send(blogs);
        });
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.deleteOne(query);
            res.send(result);
        })
        // update
        app.put('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedProduct.name,
                    price: updatedProduct.price,
                    quantity: updatedProduct.quantity
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })
        // GET API for show data
        app.get("/blogs", async (req, res) => {
            const cursor = blogsCollection.find({});
            const blog = await cursor.toArray();
            res.send(blog);
        });
        //GET Dynamic (blog)
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.findOne(query);
            res.send(result);
        });
        //post api for add review insert
        app.post("/review", async (req, res) => {
            const review = req.body;
            console.log("hit the post api", review);
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });
        // GET API for show review
        app.get("/review", async (req, res) => {
            const cursor = reviewsCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });

        // add blog
        // app.post('/addBlog', async (req, res) => {
        //     // console.log(req.body)
        //     console.log(req.files)
        //     const title = req.body.title;
        //     const address = req.body.address;
        //     const cost = req.body.cost;
        //     const category = req.body.category;
        //     const traveler = req.body.traveler;
        //     const description = req.body.description;

        //     const img = req.files.img;
        //     const imgData = img.data;
        //     const encodeImg = imgData.toString('base64');
        //     const imgBuffer = Buffer.from(encodeImg, 'base64');
        //     const blog = {
        //         title,
        //         address,
        //         cost,
        //         category,
        //         traveler,
        //         description,

        //         img: imgBuffer
        //     }
        //     const result = await blogsCollection.insertOne(blog);
        //     res.json(result)
        //     console.log(blog)
        // })

        // app.get('/profile/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email: email }
        //     const result = await ridersCollection.findOne(query);
        //     console.log('user', result)
        //     res.json(result)
        // })
        // app.get('/admin/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email: email }
        //     const cursor = await ridersCollection.findOne(query);
        //     let isAdmin = false;
        //     if (cursor.role === 'admin') {
        //         isAdmin = true
        //     }
        //     console.log(cursor)
        //     res.json({ admin: isAdmin })
        // })
    }
    finally {
        // await client.close();
    }
}








run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('end game!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})