import express from 'express';
import { nanoid } from 'nanoid'
import { client } from '../../mongodb.mjs'

const db = client.db("cruddb")
const col = db.collection("posts")

let router = express.Router()

// POST    /api/v1/post
router.post('/post', async(req, res, next) => {

    if (!req.body.title ||
        !req.body.text
    ) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            title: "abc post title",
            text: "some post text"
        } `);
        return;
    }

    const insertResponse = await col.insertOne({
        id: nanoid(),
        title: req.body.title,
        text: req.body.text
    })
    console.log(insertResponse)

    res.send('post created');
})

//GET  ALL   POSTS   /api/v1/post/:postId
router.get('/posts', async(req, res, next) => {
    const cursor = col.find({})
    let results = await cursor.toArray()
    console.log(results)
    res.send(results)
})

// GET  ONE   POST   /api/v1/posts/
router.get('/post/:postId', async(req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await col.findOne({ id: postId });

        if (post) {
            res.send(post);
        } else {
            res.status(404).send('Post not found with id ' + postId);
        }
    } catch (error) {
        console.error(error);
    }
});

// DELETE  /api/v1/post/:postId
router.delete('/post/:postId', async(req, res, next) => {
    const postId = req.params.postId;

    try {
        const deleteResponse = await col.deleteOne({ id: postId });
        if (deleteResponse.deletedCount === 1) {
            res.send(`Post with id ${postId} deleted successfully.`);
        } else {
            res.send('Post not found with the given id.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while deleting the post.');
    }
});

// EDIT post

// PUT /api/v1/post/:postId
router.put('/post/:postId', async(req, res, next) => {
    const postId = req.params.postId;
    const { title, text } = req.body;

    if (!title || !text) {
        res.status(403).send('Required parameters missing. Please provide both "title" and "text".');
        return;
    }

    try {
        const updateResponse = await col.updateOne({ id: postId }, { $set: { title, text } });

        if (updateResponse.matchedCount === 1) {
            res.send(`Post with id ${postId} updated successfully.`);
        } else {
            res.send('Post not found with the given id.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while updating the post.');
    }
});


export default router