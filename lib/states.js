const _ = require( "underscore" );

module.exports = {

    // the initial state that all conversations begin in.
    // the user instigates conversations and thus this is the *only* state *without* a question
    init : {
        question : () => null,
        interpreter : (a,r) => { r.state = "ask_name"; r.reply = "Hey there!"; }
    },

    ask_name : {
        question : () => "What's your name?",
        interpreter : function( answer, res ) {
            res.data.name = answer;
            res.state = "ask_age";
            res.reply = `Well its nice to meet you, ${answer}!`;
        }
    },

    ask_age : {
        question : (data) => `So, ${data.name}, how old are you?`,
        interpreter : function( answer, res ) {

            if( res.data.numAgeAsks === undefined )
                res.data.numAgeAsks = 0;

            var age = parseInt( answer );
            if( _.isNaN( age ) ) {
                if( res.data.numAgeAsks === 3 ) {
                    res.reply = "You're taking the mick! I'm done talking to you";
                    res.state = "end";
                } else {
                    res.reply = "Don't quite understand - try responding with a number.";
                    res.data.numAgeAsks += 1;
                }
            } else {
                if( age < 10 ) {
                    res.reply = "Christ! A bit young - better stop chatting... Don't want to be put on a register!";
                    res.state = "end";
                } else if ( age < 20 ) {
                    res.reply = "Ah - don't forget to study hard.";
                    res.state = "ask_study"; 
                } else {
                    res.reply = "Wow - you're old! See you later gramps!";
                    res.state = "end";
                }
            }
        }
    },

    ask_study : {
        question : (data) => `${data.name}, tell me in a few words what you're currently studying.`,
        interpreter : function( answer, res ) {
            const matches = [
                [ [ "math", "maths", "mathematics" ], "Wow, maths?! You must be a braniac." ],
                [ [ "physics" ], "Perhaps you're the next Einstein?" ],
            ];

            var match = _.find( matches, x => _.intersection( answer.toLowerCase().split( " " ), x[0] ).length > 0 );
            res.reply = match === undefined ? "Hmm... never heard of it." : match[1];
            res.state = "end";
        }
    },

    end : {
        question : () => null,
        interpreter : function( answer, res ) {
            res.state = "ask_age";
            res.data = { name : res.data.name };
            res.reply = `${res.data.name}, you want to chat again it seems...`;
        }
    }

};
