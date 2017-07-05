'use strict';
const Alexa = require('alexa-sdk');
const language = require('./language.json');
const APP_ID = 'amzn1.ask.skill.9f257108-c03c-4687-96ff-cf0527ecc69d';
const etty = require('./etty.dynamo');

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.resources = language;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'Search': function () {
        const word = this.event.request.intent.slots.word;
        const output = (word && word.value) ? word.value.toLowerCase() : this.t('ERROR_MESSAGE');
    
        this.attributes['speechOutput'] = output;
        this.attributes['repromptSpeech'] = this.t('HELP_REPROMPT');
        this.emit(':tell', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = this.t('HELP_MESSAGE');
        this.attributes['repromptSpeech'] = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
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
