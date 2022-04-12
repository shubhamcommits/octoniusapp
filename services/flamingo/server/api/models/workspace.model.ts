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
        unique: true,
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
    ldap_user_properties_cf: {
        type: [String],
        default: []
    },
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
        _group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
            required: false
        },
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
        is_slack_connected: {
            type: Boolean,
            default: false
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
        }
    }
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

export { Workspace }
