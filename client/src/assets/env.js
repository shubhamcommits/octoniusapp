(function(window) {
    window[`env`] = window[`env`] || {};
  
    // Environment variables
    window[`env`][`protocol`] = `${PROTOCOL}` || '';
    window[`env`][`domain`] = `${DOMAIN}` || '';
    window[`env`][`websocket`] = `${WEBSOCKET}` || '';
  })(this);