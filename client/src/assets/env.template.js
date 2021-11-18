(function(window) {
    window.env = window.env || {};

    // Environment variables
    window["env"]["protocol"] = "${PROTOCOL}";
    window["env"]["domain"] = "${DOMAIN}";
    window["env"]["websocket"] = "${WEBSOCKET}";
    window["env"]["mgmt_portal_domain"] = "${mgmt_portal_domain}";
    window["env"]["active_directory_client_application_id"] = "${active_directory_client_application_id}";
    window["env"]["active_directory_authority_cloud_id"] = "${active_directory_authority_cloud_id}";
    window["env"]["active_directory_redirect_url"] = "${active_directory_redirect_url}";
    window["env"]["GOOGLE_CLIENT_ID"] = "${GOOGLE_CLIENT_ID}";
  })(this);
