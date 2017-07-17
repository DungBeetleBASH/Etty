'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region:'us-west-2'});
const Alexa = require('alexa-sdk');
const language = require('./language.json');
const APP_ID = process.env.APP_ID;
const client = new AWS.DynamoDB.DocumentClient();
const etty = require('./etty.dynamo')(client);

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.appId = APP_ID;
    if (event.context && event.context.System.application.applicationId == 'applicationId') {
        event.context.System.application.applicationId = event.session.application.applicationId;
    }
    alexa.resources = language;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'Ask': function () {
        const word = this.event.request.intent.slots.word;
        const term = (word && word.value) ? word.value.toLowerCase() : this.t('ERROR_MESSAGE');

        if (this.event.session.application.applicationId !== APP_ID) {
            this.context.fail('Invalid Application ID');
            return;
        }

        etty.search(term, (err, response) => {
            this.attributes['speechOutput'] = response.text;
            response.results.forEach(result => {
                this.attributes['speechOutput'] += ' ' + result;
            });
            this.attributes['repromptSpeech'] = this.t('HELP_REPROMPT');
            this.emit(':tell', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
        });
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = this.t('HELP_MESSAGE');
        this.attributes['repromptSpeech'] = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    }
};
