// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.


var utils={}
utils.debounce=function(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

utils.callApi = async function(method, path) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, path, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (err) {
          reject(err)
        }
        
      } else {
        reject(new Error("Network error"));
      }
    }
  })
}

module.exports = utils;
