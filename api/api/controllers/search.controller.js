const { User, Post } = require('../models');
const { sendErr, search } = require('../../utils');


// MAIN SEARCH PAGE

const getSearchResults = async (req, res) => {
  const result = await search.getSearchResults(req, res);
  const results = result.results;
  const moreToLoad = result.moreToLoad;

  res.status(200).json({
    message: 'great success',
    results,
    moreToLoad
  });
};

const loadMoreResults = async (req, res) => {
  const results = await search.getSearchResults(req, res, req.params.amountLoaded);

  res.status(200).json({
    message: 'successfully retrieved next results',
    results
  });
};

// SEARCH BAR

const deleteSearchResult = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });

    // use this until you find the right mongodb way to do it
    user.search_history = user.search_history.filter((search) => {
      if (req.body.type === 'user') {
        return req.body.user._id != search.user._id;
      } if (req.body.type === 'content') {
        return req.body.content._id != search.content._id;
      }
    });

    await user.save();

    return res.status(200).json({
      message: 'successfully deleted the search result'
    });
  } catch (err) {
    sendErr(res, err);
  }
};

const loadRecentSearches = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });

    // get the 5 most recent searches
    const recentSearches = user.search_history.slice(-5).reverse();

    res.status(200).json({
      message: 'successfully retrieved the searches',
      searches: recentSearches
    });
  } catch (err) {
    sendErr(res, err);
  }
};

const saveSearch = async (req, res) => {
  try {
    // add the search of the user to the search results
    const user = await User.findOne({ _id: req.userId });

    user.search_history.forEach((search, index) => {
      if (search[search['type']]._id == req.body[req.body['type']]._id) {
        user.search_history.splice(index, 1);
      }
    });

    user.search_history.push(req.body);

    await user.save();

    res.status(200).json({
      message: 'successfully saved your search'
    });
  } catch (err) {
    sendErr(res, err);
  }
};

const searchNav = async (req, res) => {
  try {
    const result = await search.getSearchResults(req, res);
    const results = result.results;

    res.status(200).json({
      message: 'Successfully loaded search results',
      results
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getSkillsSearchResults = async (req, res) => {
  try {
    const result = await search.getSkillsSearchResults(req, res);
    const results = result.results;
    const moreToLoad = result.moreToLoad;

    res.status(200).json({
      message: 'Successfully loaded search results',
      results,
      moreToLoad
    });
  } catch (err) {
    console.log("here1")
    return sendErr(res, err);
  }
};
const getTagsSearchResults = async (req, res) => {
  try {
    const result = await search.getTagsSearchResults(req, res);
    const results = result.results;
    const moreToLoad = result.moreToLoad;

    res.status(200).json({
      message: 'Successfully loaded search results',
      results,
      moreToLoad
    });
  } catch (err) {
    console.log("here1")
    return sendErr(res, err);
  }
};


module.exports = {
  getSearchResults,
  searchNav,
  loadRecentSearches,
  saveSearch,
  deleteSearchResult,
  loadMoreResults,
  getSkillsSearchResults,
  getTagsSearchResults,
};
