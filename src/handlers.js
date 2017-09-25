'use strict';
const APP_ID = process.env.APP_ID;

module.exports = function(etty) {
    return {
        'LaunchRequest': function () {
            this.attributes.speechOutput = this.t('LAUNCH_MESSAGE');
            this.attributes.repromptSpeech = this.t('LAUNCH_MESSAGE');
            this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
        },
        'Ask': function () {
            const word = this.event.request.intent.slots.word;
            const term = (word && word.value) ? word.value.toLowerCase() : this.t('ERROR_MESSAGE');

            if (this.event.session.application.applicationId !== APP_ID) {
                this.context.fail('Invalid Application ID');
                return;
            }

            if (term === 'yes') {
                return this.emit('LaunchRequest');
            }
            if (term === 'no') {
                return this.emit('SessionEndedRequest');
            }

            etty.search(term, (err, response) => {
                this.attributes.speechOutput = response.text;
                response.results.forEach(result => {
                    this.attributes.speechOutput += ' <break time="1s"/> ' + result;
                });
                this.attributes.speechOutput += ' <break time="1s"/> ' + this.t('SEARCH_AGAIN');
                this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
                this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
            });
        },
        'Search': function () {
            this.emitWithState('Ask');
        },
        'AMAZON.HelpIntent': function () {
            this.attributes.speechOutput = this.t('HELP_MESSAGE');
            this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
            this.emitWithState('Respond');
        },
        'AMAZON.RepeatIntent': function () {
            this.emitWithState('Respond');
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
        'Respond': function () {
            this.emit(':tell', this.attributes.speechOutput, this.attributes.repromptSpeech);
        },
        'Unhandled': function () {
            this.emitWithState('AMAZON.HelpIntent');
        }
    };
};