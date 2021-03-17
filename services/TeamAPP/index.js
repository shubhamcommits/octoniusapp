// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required pckages
const path = require('path');

// Read botFilePath and botFileSecret from .env file.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const express = require('express');
const app = express();
let exphbs = require("express-handlebars");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, UserState, MemoryStorage, Activity ,MessageFactory, ConversationParameters,TeamsInfo} = require('botbuilder');
const { TeamsMessagingExtensionsSearchAuthConfigBot } = require('./bots/teamsMessagingExtensionsSearchAuthConfigBot');

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights. See https://aka.ms/bottelemetry for telemetry 
    //       configuration instructions.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Note: Since this Messaging Extension does not have the messageTeamMembers permission
    // in the manifest, the bot will not be allowed to message users.
};

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);

// Create the bot that will handle incoming messages.
const bot = new TeamsMessagingExtensionsSearchAuthConfigBot(userState);

// tslint:disable-next-line:no-var-requires
const BotConnector = require("botframework-connector");
const credentials = new BotConnector.MicrosoftAppCredentials(
  process.env.MICROSOFT_APP_ID,
  process.env.MICROSOFT_APP_PASSWORD
);

BotConnector.MicrosoftAppCredentials.trustServiceUrl(
  process.env.SERVICE_URL
);


// Listen for incoming requests.
app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

// Send user proactive message
app.post("/api/proactive", async (req, res, next) => {
    

    const message = MessageFactory.attachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
            type: "AdaptiveCard",
               body: [
                    {
                        "type": "TextBlock",
                        "text": req.query.text,
                    },
                    {
                        "type": "ColumnSet",
                        "columns": [
                          {
                            "type": "Column",
                            "items": [
                              {
                                "type": "Image",
                                "url": req.query.image,
                                "size": "small",
                                "style": "person",
                                "width":"50px"
                              }
                            ],
                            "width":"50px"
                          },
                          {
                            "type": "Column",
                            "items": [
                              {
                                "type": "TextBlock",
                                "text": req.query.name,
                              }
                            ]
                          }
                        ]
                      }
                ],
                "actions": [
                    {
                        "type": "Action.OpenUrl",
                        "method": "POST",
                        "url":req.query.url,
                        "title": req.query.btn_title
                    }
                ]
        }
    });
    
    //MessageFactory("This is a user message 😀"+ req.query.message);
    const conversationParameters = {
        isGroup: false,
        channelData: {
            tenant: {
                id: process.env.TENANT_ID
            }
        },
        bot: {
            id: process.env.BOT_ID,
            name: process.env.BOT_NAME
        },
        members: [
            {
                id: req.query.uid,
                name: "Cosmin Ciobanu"
            }
        ]
    };
    //id: "29:1ZEsCk6CcPOeHVAGKzxsUF85r30mGW1u_Sf9vdtQuoLTTXn0V6P7FwIoANGpOhpCOihKm0r4lTCZhV9YFgbTFmw",
    const parametersTalk = conversationParameters;
    const connectorClient = adapter.createConnectorClient(process.env.SERVICE_URL);
    const response = await connectorClient.conversations.createConversation(parametersTalk);
    await connectorClient.conversations.sendToConversation(response.id, message);

    res.send("Message sent");
    next();
});


app.get("/tab/simple", (req, res) => { res.render("tab/simple/simple"); });
app.get("/tab/simple-start", (req, res) => { res.render("tab/simple/simple-start"); });
app.get("/tab/simple-start-v2", (req, res) => { res.render("tab/simple/simple-start-v2"); });
app.get("/tab/simple-end", (req, res) => { res.render("tab/simple/simple-end"); });


// Serve up static files in the public directory (namely: searchSettings.html)
const options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
      res.set('x-timestamp', Date.now())
    }
}
  
app.use(express.static('public', options));
let appId = process.env.MicrosoftAppId;
let handlebars = exphbs.create({
    extname: ".hbs",
    helpers: {
        appId: () => { return appId; },
    },
    defaultLayout: false,
});
app.engine("hbs", handlebars.engine);
app.set("view engine", "hbs");

app.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ app.name } listening to port 3978`);
});