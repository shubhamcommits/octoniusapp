(function(window) {
    window.env = window.env || {};

    // Environment variables
    window["env"]["protocol"] = "${PROTOCOL}";
    window["env"]["domain"] = "${DOMAIN}";
    window["env"]["websocket"] = "${WEBSOCKET}";
    window["env"]["mgmt_portal_domain"] = "${mgmt_portal_domain}";
    window["env"]["SSO_AD_METHOD"] = "${SSO_AD_METHOD}";
    window["env"]["active_directory_client_application_id"] = "${active_directory_client_application_id}";
    window["env"]["active_directory_authority_cloud_id"] = "${active_directory_authority_cloud_id}";
    window["env"]["active_directory_redirect_url"] = "${active_directory_redirect_url}";
    window["env"]["LDAP_METHOD"] = "${LDAP_METHOD}";
    window["env"]["SSO_GOOGLE_METHOD"] = "${SSO_GOOGLE_METHOD}";
    window["env"]["GOOGLE_CLIENT_ID"] = "${GOOGLE_CLIENT_ID}";
    window["env"]["GOOGLE_CLIENT_SECRET"] = "${GOOGLE_CLIENT_SECRET}";
  })(this);
