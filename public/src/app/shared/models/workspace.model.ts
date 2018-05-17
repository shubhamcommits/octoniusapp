export interface Workspace {
  _id: string;
  company_name: string;
  workspace_name: string;
  owner_password: string;
  owner_email: string;
  owner_first_name: string;
  owner_last_name: string;
  allowed_domains: string[];
  invited_users: string[];
}
