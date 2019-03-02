const express = require('express');

const { search } = require('../controllers');

const {
    auth
} = require('../../utils');

const router = express.Router();


// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);


// -| Main search page routes |-

router.get('/getSearchResults/:query/:filter', search.getSearchResults);

// -| Search bar routes |-

// delete a search result
router.delete('/deleteSearchResult', search.deleteSearchResult);

// load the user's recent searches
// change route later
router.get('/user/loadRecentSearches', search.loadRecentSearches);

// search throughout the entire workspace
router.get('/searchNav/:query/:filter', search.searchNav);

// add item to user's search history
router.post('/saveSearch', search.saveSearch);

// load more search results
router.get('/loadMoreResults/:filter/:amountLoaded/:query', search.loadMoreResults);


module.exports = router;
