// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    TeamsActivityHandler,
    CardFactory,
    ActionTypes,
} = require('botbuilder');
const axios = require('axios');
const querystring = require('querystring');
const { SimpleGraphClient } = require('../simpleGraphClient');
var moment = require('moment');

// User Configuration property name
const USER_CONFIGURATION = 'userConfigurationProperty';

class TeamsMessagingExtensionsSearchAuthConfigBot extends TeamsActivityHandler {
    /**
     *
     * @param {UserState} User state to persist configuration settings
     */
    constructor(userState) {
        super();
        // Creates a new user property accessor.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
        this.userConfigurationProperty = userState.createProperty(
            USER_CONFIGURATION
        );
        this.connectionName = process.env.ConnectionName;
        this.userState = userState;
    }

    /**
     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
     */
    async run(context) {
        await super.run(context);

        // Save state changes
        await this.userState.saveChanges(context);
    }
    async handleTeamsAppBasedLinkQuery(context, query) {
        const magicCode =
            query.state && Number.isInteger(Number(query.state))
                ? query.state
                : '';
        const tokenResponse = await context.adapter.getUserToken(
            context,
            this.connectionName,
            magicCode
        );

        if (!tokenResponse || !tokenResponse.token) {
            // There is no token, so the user has not signed in yet.

            // Retrieve the OAuth Sign in Link to use in the MessagingExtensionResult Suggested Actions
            const signInLink = await context.adapter.getSignInLink(
                context,
                this.connectionName
            );

            return {
                composeExtension: {
                    type: 'auth',
                    suggestedActions: {
                        actions: [
                            {
                                type: 'openUrl',
                                value: signInLink,
                                title: 'Bot Service OAuth'
                            },
                        ],
                    },
                },
            };
        }
        const graphClient = new SimpleGraphClient(tokenResponse.token);
        const profile = await graphClient.GetMyProfile();
        const attachment = CardFactory.thumbnailCard(
            'Thumbnail Card',
            profile.displayName,
            query.url,
            [
                'https://raw.githubusercontent.com/microsoft/botframework-sdk/master/icon.png'
            ]
        );
        const result = {
            attachmentLayout: 'list',
            type: 'result',
            attachments: [attachment]
        };

        const response = {
            composeExtension: result
        };
        return response;
    }
    async handleTeamsMessagingExtensionConfigurationQuerySettingUrl(
        context,
        query
    ) {
        // The user has requested the Messaging Extension Configuration page settings url.
        const userSettings = await this.userConfigurationProperty.get(
            context,
            ''
        );
        const escapedSettings = userSettings
            ? querystring.escape(userSettings)
            : '';

        return {
            composeExtension: {
                type: 'config',
                suggestedActions: {
                    actions: [
                        {
                            type: ActionTypes.OpenUrl,
                            value: `${process.env.SiteUrl}/public/searchSettings.html?settings=${escapedSettings}`
                        },
                    ],
                },
            },
        };
    }

    async handleTeamsMessagingExtensionConfigurationSetting(context, settings) {
        // When the user submits the settings page, this event is fired.
        if (settings.state != null) {
            await this.userConfigurationProperty.set(context, settings.state);
        }
    }

    async handleTeamsMessagingExtensionQuery(context, query) {
        const searchQuery = query.parameters[0].value;
        const attachments = [];
        const userSettings = await this.userConfigurationProperty.get(
            context,
            ''
        );

        if (userSettings && userSettings.includes('email')) {
            // When the Bot Service Auth flow completes, the query.State will contain a magic code used for verification.
            const magicCode =
                query.state && Number.isInteger(Number(query.state))
                    ? query.state
                    : '';
            const tokenResponse = await context.adapter.getUserToken(
                context,
                this.connectionName,
                magicCode
            );

            if (!tokenResponse || !tokenResponse.token) {
                // There is no token, so the user has not signed in yet.

                // Retrieve the OAuth Sign in Link to use in the MessagingExtensionResult Suggested Actions
                const signInLink = await context.adapter.getSignInLink(
                    context,
                    this.connectionName
                );

                return {
                    composeExtension: {
                        type: 'auth',
                        suggestedActions: {
                            actions: [
                                {
                                    type: 'openUrl',
                                    value: signInLink,
                                    title: 'Bot Service OAuth'
                                },
                            ],
                        },
                    },
                };
            }

            // The user is signed in, so use the token to create a Graph Clilent and search their email
            const graphClient = new SimpleGraphClient(tokenResponse.token);
            const messages = await graphClient.searchMailInbox(searchQuery);

            // Here we construct a ThumbnailCard for every attachment, and provide a HeroCard which will be
            // displayed if the user selects that item.
            messages.value.forEach((msg) => {
                const heroCard = CardFactory.heroCard(
                    msg.from.emailAddress.address,
                    msg.body.content,
                    null,
                    null,
                    { subtitle: msg.subject }
                );
                const preview = CardFactory.thumbnailCard(
                    msg.from.emailAddress.address,
                    `${msg.subject} <br />  ${msg.bodyPreview.substring(
                        0,
                        100
                    )}`,
                    [
                        'https://raw.githubusercontent.com/microsoft/botbuilder-samples/master/docs/media/OutlookLogo.jpg',
                    ]
                );
                attachments.push({
                    contentType: heroCard.contentType,
                    content: heroCard.content,
                    preview: preview
                });
            });
        } else {
            const response = await axios.get(
                `http://registry.npmjs.com/-/v1/search?${querystring.stringify({
                    text: searchQuery,
                    size: 8
                })}`
            );

            response.data.objects.forEach((obj) => {
                const heroCard = CardFactory.heroCard(obj.package.name);
                const preview = CardFactory.heroCard(obj.package.name);
                preview.content.tap = {
                    type: 'invoke',
                    value: { description: obj.package.description }
                };
                attachments.push({ ...heroCard, preview });
            });
        }

        return {
            composeExtension: {
                type: 'result',
                attachmentLayout: 'list',
                attachments: attachments
            },
        };
    }

    async handleTeamsMessagingExtensionSelectItem(context, obj) {
        return {
            composeExtension: {
                type: 'result',
                attachmentLayout: 'list',
                attachments: [CardFactory.thumbnailCard(obj.description)]
            },
        };
    }

    async handleTeamsMessagingExtensionFetchTask(context, action) {
        if (action.commandId === 'CREATETASK') {

            let apiResponce = await axios.post('http://127.0.0.1:13000/api/is-teams-auth-user',{user_object_id:context._activity.from.aadObjectId});
            
            let user = apiResponce.data.user;
            let groupsList = apiResponce.data.groupsBYAdmin;
            if (user && groupsList) {
            let groupChoices = [];
            groupsList.forEach(group => {
                groupChoices.push({
                    title: group.group_name,
                    value: group._id+"="+group.group_name
                })
            });
        
            let messagedata = action.messagePayload.body.content;
            const adaptiveCard = CardFactory.adaptiveCard({
                actions: [{
                  data: { submitLocation: 'messagingExtensionFetchTask'},
                  title: 'Continue',
                  type: 'Action.Submit'
                }],
                body: [
                    {type: "Input.Text", value: user._user._id , isVisible: false, id: "assigneeId" },
                    { text: 'Title*', type: 'TextBlock', weight: 'bolder'},
                    { id: 'title', placeholder: 'Enter Task Title', type: 'Input.Text', value: '' },
                    { text: 'Description', type: 'TextBlock', weight: 'bolder'},
                    { id: 'description', placeholder: 'Enter Task Description', type: 'Input.Text',maxLength: 500,isMultiline: true ,value: messagedata },
                    { text: 'Group', type: 'TextBlock', weight: 'bolder'},
                    {
                        type: "Input.ChoiceSet",
                        id: "groupSelection",
                        label: "Please select a group?",
                        style: "compact",
                        isRequired: true,
                        errorMessage: "This is a required input",
                        placeholder: "Please choose",
                        choices: groupChoices
                    },
                ],
                type: 'AdaptiveCard',
                version: '1.0'
              });
        
              return {
                task: {
                  type: 'continue',
                  value: {
                    card: adaptiveCard,
                    height: 400,
                    title: 'Create Task Octonius',
                    url: null,
                    width: 450
                  }
                }
              };

            }else {
                console.log("failed")
            return {
                composeExtension:{
                  type:"auth",
                  suggestedActions:{
                    actions:[
                      {
                        type: "openUrl",
                        value: "https://f5a7ac0170e4.ngrok.io/tab/simple-start?userID="+context._activity.from.id,
                        title: "Sign in to this app"
                      }
                    ]
                  }
                }
              }
            }
        }
        if (action.commandId === 'SIGNIN') {
            let apiResponce = await axios.post('http://127.0.0.1:13000/api/is-teams-auth-user',{user_object_id:context._activity.from.aadObjectId});
            let user = apiResponce.data.user;
            if (user) {
                const adaptiveCard = CardFactory.adaptiveCard({
                    actions: [{
                      data: { submitLocation: 'submited'},
                      title: 'Ok',
                      type: 'Action.Submit'
                    }],
                    body: [
                        
                        { text: 'User Already Connected', type: 'TextBlock', weight: 'bolder'},
            
                    ],
                    type: 'AdaptiveCard',
                    version: '1.0'
                  });
            
                  return {
                    task: {
                      type: 'continue',
                      value: {
                        card: adaptiveCard,
                        height: 150,
                        title: 'Create Task Octonius',
                        url: null,
                        width: 400
                      }
                    }
                  };
            } else {
                console.log("failed")
            return {
                composeExtension:{
                  type:"auth",
                  suggestedActions:{
                    actions:[
                      {
                        type: "openUrl",
                        value: "https://f5a7ac0170e4.ngrok.io/tab/simple-start?userID="+context._activity.from.id,
                        title: "Sign in to Octonius"
                      }
                    ]
                  }
                }
              }
            }
        }
        return null;
    }

    async handleTeamsMessagingExtensionSubmitAction(context, action) {
        // This method is to handle the 'Close' button on the confirmation Task Module after the user signs out.
        // 
        if(action.data.submitLocation == 'messagingExtensionFetchTask'){
            
            const groupName = action.data.groupSelection.split('=')[1];
            const groupId = action.data.groupSelection.split('=')[0];
            let apiResponce = await axios.post('http://127.0.0.1:13000/api/team-card-required-data',{groupId:groupId});

            let columnsList = apiResponce.data.columnsList;
            let groupMembers = apiResponce.data.groupMembers;

            if(columnsList && columnsList.length>0 && groupMembers && groupMembers.length>0){
                let columnsChoices = [];
                let groupMembersChoices = [];
                columnsList.forEach(column => {
                    columnsChoices.push({
                        title: column.title,
                        value: column._id
                    })
                });

                groupMembers.forEach(member => {
                    groupMembersChoices.push({
                        title: member.full_name,
                        value: member._id
                    })
                });
        
            const adaptiveCard = CardFactory.adaptiveCard({
                actions: [{
                  data: { submitLocation: 'submit'},
                  title: 'Submit',
                  type: 'Action.Submit'
                }],
                body: [
                    {type: "Input.Text", value: action.data.assigneeId , isVisible: false, id: "assigneeId" },
                    { text: 'Title', type: 'TextBlock', weight: 'bolder'},
                    { type: 'TextBlock',id: "title", text:  action.data.title },
                    {type: "Input.Text", value: action.data.title , isVisible: false, id: "title" },
                    { text: 'Description', type: 'TextBlock', weight: 'bolder'},
                    { type: 'TextBlock', id: "description", text:  action.data.description},
                    {type: "Input.Text", value: action.data.description , isVisible: false, id: "description" },
                    { text: 'Group', type: 'TextBlock', weight: 'bolder'},
                    {type: "Input.Text", value: groupId , isVisible: false, id: "groupSelectionId" },
                    { type: 'TextBlock', id: "groupSelection", text:  groupName},
                    { text: 'Column', type: 'TextBlock', weight: 'bolder'},
                    {
                        type: "Input.ChoiceSet",
                        id: "columnSelection",
                        label: "Please select a group?",
                        style: "compact",
                        isRequired: true,
                        errorMessage: "This is a required input",
                        placeholder: "Please choose",
                        choices: columnsChoices
                    },
                    { text: 'Assigned To', type: 'TextBlock', weight: 'bolder'},
                    {
                        type: "Input.ChoiceSet",
                        id: "assigneeSelection",
                        label: "Please select a group?",
                        style: "compact",
                        isRequired: true,
                        errorMessage: "This is a required input",
                        placeholder: "Please choose",
                        choices: groupMembersChoices
                    },
                    { text: 'Due Date', type: 'TextBlock', weight: 'bolder'},
                    {
                        type: "Input.Date",
                        id: "dueDate",
                        placeholder: "Enter a date",
                        value: moment().format("YYYY-MM-DD")
                    }
                ],
                type: 'AdaptiveCard',
                version: '1.0'
              });
        
              return {
                task: {
                  type: 'continue',
                  value: {
                    card: adaptiveCard,
                    height: 550,
                    title: 'Create Task Octonius',
                    url: null,
                    width: 500
                  }
                }
              };
        } else {
            console.log("failed")
            return {
                composeExtension:{
                  type:"auth",
                  suggestedActions:{
                    actions:[
                      {
                        type: "openUrl",
                        value: "https://69dd9fd88f07.ngrok.io/tab/simple-start",
                        title: "Sign in to this app"
                      }
                    ]
                  }
                }
              }  
        }
        }else if (action.data.submitLocation == 'submit'){
            try {
                let apiResponce = await axios.post('http://127.0.0.1:13000/api/team-create-task',action.data);
                const adaptiveCard = CardFactory.adaptiveCard({
                    actions: [{
                      data: { submitLocation: 'submited'},
                      title: 'Ok',
                      type: 'Action.Submit'
                    }],
                    body: [
                        
                        { text: 'Task Created Success!!', type: 'TextBlock', weight: 'bolder'},
            
                    ],
                    type: 'AdaptiveCard',
                    version: '1.0'
                  });
            
                  return {
                    task: {
                      type: 'continue',
                      value: {
                        card: adaptiveCard,
                        height: 150,
                        title: 'Create Task Octonius',
                        url: null,
                        width: 400
                      }
                    }
                  };

            } catch (error) {
                const adaptiveCard = CardFactory.adaptiveCard({
                    actions: [{
                      data: { submitLocation: 'error'},
                      title: 'Ok',
                      type: 'Action.Submit'
                    }],
                    body: [
                        
                        { text: 'Error occured While task creation', type: 'TextBlock', weight: 'bolder'},
            
                    ],
                    type: 'AdaptiveCard',
                    version: '1.0'
                  });
            
                  return {
                    task: {
                      type: 'continue',
                      value: {
                        card: adaptiveCard,
                        height: 150,
                        title: 'Create Task Octonius',
                        url: null,
                        width: 400
                      }
                    }
                  };
            }
            
           
        }else {
            return {}
        }
        
    }
}

module.exports.TeamsMessagingExtensionsSearchAuthConfigBot = TeamsMessagingExtensionsSearchAuthConfigBot;
