// Try at implementing Farkle in Javascript
// Greg Nuyens
// Jan 2, 2013
console.log('// Loading Farkle.js');

var farklemod = {
    /// Module for project

    fturn: [], // global UI state for a current turn \\ needs to be one per player, etc.

    die:{
        /// The object representing a single die across multiple turns

        dieID:{}, // which die is this?
        face:{}, // the number currently face up on the die
        active:{}, // true if this die is to be rolled and scored on this roll
        scored: {}, // true once this die has been consumed for scoring


        diePrint:function diePrint() {
            console.log('die: ' + this.dieID + '{' + this.current + ' }');
        },

        roll:function roll() {
            this.face = Math.floor((Math.random() * 6) + 1); // number from 1 to 6 inclusive
            this.scored = false;
            // console.log('Rolling die ' + this.dieID + ' to: ' + this.face);
        }
    }, // close die

rule:{
    /// the objects that are evaluated in order to determine dice scores
    name: "", // symbolic name of this rule displayable to user
    fn: {}, // characteristic function to recognize if there is an instance of this scoring rule
    points: 0, // how many is each instance worth?
    count: 0
} ,
    turn:{
        /// The object containing the dice and state for a current hand or turn

        activeDice:[], // will be an array of dice
        scoredDice:[], // array of already scored Dice
        turnScores:[], // will be an array of the score from each roll
        ranks:[], // array of how many of each rank
        metaranks:[] , // how many triplets, pairs, etc.
        score:0, //
        rules: [] ,

        display:function (scorep) {
            // display the face of each die and current score
            var line = "", rline, mline;
            this.activeDice.forEach(function (d) {
                    // warning "this" does not get closed over in this anon fn
                    line += d.face + " "});
            // console.log("Dice: " + line);
            document.getElementById("froll").innerHTML=line.bold();
            document.getElementById("froll").style.border="thick solid #0000FF";
            if (scorep) {
                rline = this.ranks.toString();
                rline = rline.substring(2); // drop first characters from rline (0 rank is meaningless)
                // console.log("Ranks: " + rline);
                mline = this.metaranks.toString();
                document.getElementById("frank").innerHTML=rline;
                document.getElementById("fmrank").innerHTML=mline;
                document.getElementById("fscore").innerHTML=this.score;

            }
        }, // close display

        measure:function () {
            // compute the score for this turn and store it in the score field
            var partial;
            var cranks = this.ranks;
            var mranks = this.metaranks;
            // set all ranks to 0
            for (var i=0; i<7 ; i++){
                cranks[i]= 0;
                mranks[i]=0;
            }
            this.activeDice.forEach(function (d) {
                // warning "this" does not get closed over in this anon fn
                if (!this.scored) {
                    cranks[d.face]++; // add 1 to the count for this die's value
                }
            });
            // now that we know rank for each non-scored dice, figure out how many pairs, triplets, etc.
            console.log("before cranks: ", cranks.toString());
            console.log("mranks: ", mranks.toString());
            for (i=1; i <=6; i++){
                // 1 to 6 since there are no zero faces, so don't want an extra 0 of a kind.
                mranks[cranks[i]]++; // add 1 to the count for this rank
            }
            console.log("after cranks: ", cranks.toString());
            console.log("mranks: ", mranks.toString());
            // now apply rules
            this.score= 0;
            partial= this.twoTriplets() || this.threePairs() || this.straight();
            if (partial)
                // these all use all 6 dice, no point in looking further
                this.score = partial;
            else
                this.score = this.onesFives();
            this.display(true);
        }, // close measure


        reRoll:function () {
            // reroll all the active dice
            this.activeDice.forEach(function (d) {
                d.roll(); // *that's how I roll*
            });
        },

        setRoll:function (setup) {
            // given the string Setup, change the value of all the dice.
            // Testing function only
            var pos= 0;
            if (setup.length != this.activeDice.length) {
                alert("setRoll's setup doesn't match number of active dice: " + setup);
            }
            else {
                this.activeDice.forEach(function (d) {
                    d.face = setup[pos++] - "0"; // *that's how I roll*
                }); }
        },


        turnInit:function () {
            // initialize a turn by creating the dice, rolling them and setting the score to 0
            console.log("entering turn.turnInit: ");
            var die, i;
            var ids = "ABCDEF";
            for (i = 0; i < 6; i++) {
                die = Object.create(farklemod.die); // create a new one
                die.dieID = ids[i]; // set the name for this die
                die.scored = false;
                this.activeDice.push(die); // add to the array of dice
                die.roll();
            }
            this.turnScores = [];
            this.score = 0;
            console.log("initialized Turn of length: " + this.activeDice.length);

            for (i = 0; i < 7; i++) { // 7 so that we can access 1 to 6, 0 will be ignored
                this.ranks[i] = 0
            }
            for (i = 0; i < 7; i++) { // 7 because we can 0 of a kind, to 6 of a kind
                this.metaranks[i] = 0
            }
        } ,

        twoTriplets: function () {
            // rule for Two sets of 3 of the same die
            if (this.metaranks[3] === 2) {
                // success
                return(2500);}
            else
                return(false);
            // all dice are counted
        } , // close twoTriplets

        threePairs: function() {
            // rule for three sets of two dice
            if (this.metaranks[2] === 3)
                return(1500);
            else
                return(false);
        } ,

        straight: function() {
            if (this.metaranks[1] === 6)
                return(2500);
            else
                return(false);

        } ,

        onesFives: function() {
            var i;
            i = this.ranks[1]*100;
            i += this.ranks[5]*50;
            return(i);

        }


    }, // close turn

    uiRoll:function uiRoll() {
        this.fturn.reRoll();
        this.fturn.measure();
        this.fturn.display(true);
    }, // close uiRoll

    uiSetRoll:function uiSetRoll(setup) {
        this.fturn.setRoll(setup);
        this.fturn.measure();
        this.fturn.display(true);
    } , // close uiSetRoll

    farkleInit:function farkleInit() {
        /// overall module initialization for the game
        console.log("// Initializing Farkle module");
        this.fturn = Object.create(farklemod.turn);
        this.fturn.turnInit();
        this.fturn.measure();

    }
}; // close farklemod


//magic from The Good Parts (to avoiding writing prototypes directly everywhere)
if (typeof Object.create !== 'function') {
    console.log("// Creating Object.create function");
    Object.create = function (o) {
        var F = function () {
        };
        F.prototype = o;
        return new F();
    };
}

farklemod.farkleInit();