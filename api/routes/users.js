const {user, auth} = require('../models/user_model');
const express = require('express');
const router = express.Router();

// bcrypt module commented out because, even though I'm able to hash and store passwords, validation does not work therefore you can't use the newly created account anyways.
// const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const {error} = auth(req.body);
    if (error) {
        return res.status(400).json({
            error: error.message
        });
    }
    let User = await user.findOne({username: req.body.username});
    if (User) {
        return res.status(400).json({
            message: 'Username Already Exists'
        });
    } else {
        User = new user({
            username: req.body.username,
            password: req.body.password
        });
        // This is my working attempt at hashing the user password and storing it into the database using bcrypt
        // const salt = await bcrypt.genSalt(10);
        // User.password = await bcrypt.hash(User.password, salt);
        await User.save()
                  .then(result => {
                      res.status(201).json({
                          message: 'User Created Successfully',
                          createdUser: {
                              username: result.username,
                              password: result.password
                          },
                          request: {
                              type: "GET",
                              url: "http://localhost:3000/api/users/" + result._id
                          }
                      });
                  })
                  .catch(err => {
                      console.log(err);
                      res.status(500).json({
                          error: err
                      });
                  });
        res.send(User);
    }
});

router.get('/', (req, res, next) => {
    user.find()
        .select('-__v')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                users: docs.map(doc => {
                    return {
                        user: doc,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/api/users/" + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/:userID', (req, res, next) => {
    const id = req.params.userID;
    user.findById(id)
        .select('-__v')
        .exec()
        .then(doc => {
            res.status(200).json({
                user: doc,
                request: {
                    type: "GET",
                    description: "Get all users at following url",
                    url: "http://localhost:3000/api/users"
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.patch('/:userID', (req, res, next) => {
    const id = req.params.userID;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    user.updateOne({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User Updated',
                request: {
                    type: "GET",
                    url: "http://localhost:3000/api/users/" + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:userID', (req, res, next) => {
    const id = req.params.userID;
    user.deleteOne({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User Deleted",
                request: {
                    type: "POST",
                    url: "http://localhost:3000/api/users",
                    body: {
                        username: "String",
                        password: "String"
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;