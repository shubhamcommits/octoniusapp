import express from 'express';
import { SearchController } from '../controllers';
import { Auths } from '../utils';

const router = express.Router();

/**
 * Search Controller Class Object
 */
const search = new SearchController();

// Define auths helper controllers
const auth = new Auths();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

// -| Main search |-
router.get('/getSearchResults/:filter/:query', search.getSearchResults);

/************************/

// -| Main search page routes |-
// router.get('/post/:query/:filter', search.getPosts);

/*
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

//search skills results
router.get("/getSkillsSearchResults/:query", search.getSkillsSearchResults);

router.get("/getTagsSearchResults/:query", search.getTagsSearchResults);
*/

export { router as searchRoutes };