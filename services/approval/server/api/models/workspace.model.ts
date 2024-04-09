import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const workspaceSchema = new Schema({
    company_name: {
        type: String,
        default: null
    },
    workspace_name: {
        type: String,
        required: true
    },
    access_code: {
        type: String,
        unique: true,
        required: true
    },
    workspace_avatar: {
        type: String,
        default: 'assets/images/organization.png'
    },
    owner_email: {
        type: String,
        required: true,
        // unique : true
    },
    owner_first_name: {
        type: String,
        required: true,
        default: null
    },
    owner_last_name: {
        type: String,
        required: true,
        default: null
    },
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    allowed_domains: [{
        type: String,
        required: true
    }],
    allow_decentralized_roles: {
        type: Boolean,
        default: false
    },
    ldapPropertiesMap: {
        type: Map,
        of: String
    },
    googlePropertiesMap: [{
        google_property: {
            type: String
        },
        google_schema: {
            type: String
        },
        octonius_property: {
            type: String
        }
    }],
    googleGenericPropertiesMap: [{
        google_property: {
            type: String
        },
        google_schema: {
            type: String
        },
        octonius_property: {
            type: String
        }
    }],
    
    profile_custom_fields: {
        type: [{
            name: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            values: {
                type: [String],
                required: true,
                default: []
            },
            user_type: {
                type: Boolean,
                default: false
            },
            hide_in_business_card: {
                type: Boolean,
                default: false
            }
        }]
    },
    manager_custom_field: {
        type: String
    },
    invited_users: [{
        email: {
            type: String,
            required: true
        },
        invited_date: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            enum: ['group', 'workspace']
        },
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        _group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
            required: false
        },
        accepted: {
            type: Boolean,
            default: false,
            required: true
        }
    }],
    created_date: {
        type: Date,
        default: moment().format()
    },
    management_private_api_key: {
        type: String,
        required: true,
        default: 'TZCDAC3CDCJILSRGA2II'
    },
    integrations: {
        is_google_connected: {
            type: Boolean,
            default: false
        },
        google_client_id: {
            type: String
        },
        google_client_secret_key: {
            type: String
        },
        google_api_key: {
            type: String
        },
        is_slack_connected: {
            type: Boolean,
            default: false
        },
        slack_client_id: {
            type: String
        },
        slack_client_secret_key: {
            type: String
        },
        is_azure_ad_connected: {
            type: Boolean,
            default: false
        },
        azure_ad_clientId: {
            type: String
        },
        azure_ad_authority_cloud_url: {
            type: String
        },
        is_ldap_connected: {
            type: Boolean,
            default: false
        },
        ldap_url: {
            type: String
        },
        ldap_dn: {
            type: String
        },
        ldap_password: {
            type: String
        },
        ldap_search_base: {
            type: String
        },
        is_box_connected: {
            type: Boolean,
            default: false
        },
        box_client_id: {
            type: String
        },
        box_client_secret_key: {
            type: String
        },
        is_onedrive_connected: {
            type: Boolean,
            default: false
        },
        onedrive_client_id: {
            type: String
        },
        onedrive_client_secret_key: {
            type: String
        },
        onedrive_tenant_id: {
            type: String
        },
        is_ms_365_connected: {
            type: Boolean,
            default: false
        },
        ms_365_client_id: {
            type: String
        },
        ms_365_client_secret: {
            type: String
        },
        ms_365_tenant_id: {
            type: String
        },
        ms_365_authority: {
            type: String
        },
        ms_365_private_key_path: {
            type: String
        },
        is_atlassia_connected: {
            type: Boolean,
            default: false
        },
        atlassia_url: {
            type: String
        },
        atlassia_token: {
            type: String
        }
    }
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

export { Workspace }
