const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Suggestion = require('../models/Suggestion')

// @desc    Show add page
// @route   GET /suggestions/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('suggestions/add')
})

// @desc    Process add form
// @route   POST /suggestions
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Suggestion.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all suggestions
// @route   GET /suggestion
router.get('/', ensureAuth, async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('suggestions/index', {
      suggestions,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single suggestion
// @route   GET /suggestions/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let suggestion = await Suggestion.findById(req.params.id).populate('user').lean()

    if (!suggestion) {
      return res.render('error/404')
    }

    if (suggestion.user._id != req.user.id && suggestion.status == 'private') {
      res.render('error/404')
    } else {
      res.render('suggestions/show', {
        suggestion,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const suggestion = await Suggestion.findOne({
      _id: req.params.id,
    }).lean()

    if (!suggestion) {
      return res.render('error/404')
    }

    if (suggestion.user != req.user.id) {
      res.redirect('/suggestions')
    } else {
      res.render('suggestions/edit', {
        suggestion,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update suggestion
// @route   PUT /suggestions/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let suggestion = await Suggestion.findById(req.params.id).lean()

    if (!suggestion) {
      return res.render('error/404')
    }

    if (suggestion.user != req.user.id) {
      res.redirect('/suggestions')
    } else {
      suggestion = await Suggestion.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete suggestion
// @route   DELETE /suggestions/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let suggestion = await Suggestion.findById(req.params.id).lean()

    if (!suggestion) {
      return res.render('error/404')
    }

    if (suggestion.user != req.user.id) {
      res.redirect('/suggestions')
    } else {
      await Suggestion.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User suggestion
// @route   GET /suggestions/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const suggestions = await Suggestion.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('suggestions/index', {
      suggestions,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
