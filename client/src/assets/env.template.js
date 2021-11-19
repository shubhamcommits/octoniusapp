(function(window) {
    window.env = window.env || {};

    // Environment variables
    window["env"]["protocol"] = "${PROTOCOL}";
    window["env"]["domain"] = "${DOMAIN}";
    window["env"]["websocket"] = "${WEBSOCKET}";
    window["env"]["mgmt_portal_domain"] = "${mgmt_portal_domain}";
    window["env"]["SLACK_CLIENT_ID"] = "${SLACK_CLIENT_ID}";
  })(this);
