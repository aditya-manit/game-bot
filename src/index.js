var Story = require('inkjs').Story;
var fs = require('fs');
var readline = require('readline');
require("dotenv").config();
const {Client} = require('discord.js');
const {MessageEmbed} = require("discord.js");
const client = new Client();
var dbcon = require('./database');

// app.get('/getEvent',function(req,res){
//     dbcon.query('SELECT * FROM eventinfo',function(err, result) {
//         if (err) throw err;
//     });
// });


const PREFIX = "!";
const DELAY_IN_MILLISECS = 2000;
const TIMEOUT = 600000;
const COLOR_GREEN = '#00FF00';
const THUMBNAIL = "https://i.ibb.co/4Vq90qp/812531599089729590-1.png";
const ALREADY_PLAYED = "You've already won the game! You can only play once"
const PLAYING = "you're already playing the game! Check your DMs to continue."
const START_PLAY_TEXT = "check your DMs for instructions on how to play! Please note that after 10 minutes of inactivity you'll need to start over."
const STATUS_ERROR = "STATUS_ERROR"
const DELETE_PLAYING_STATUS_QUERY = "DELETE FROM `discord_users` WHERE (`id` = ?);"
const STATUS_ALREADY_PLAYED = "STATUS_ALREADY_PLAYED"
const STATUS_PLAYING = "STATUS_PLAYING"
const STATUS_NEW_PLAYER = "STATUS_NEW_PLAYER"
const CHECK_STATUS_QUERY = "SELECT * FROM discord_users WHERE id = ?;";
const INSERT_PLAYING_STATUS_QUERY = "INSERT INTO discord_users VALUES (?, ?);"
const UPDATE_STATUS_TO_ALREADY_PLAYED_QUERY = "UPDATE `discord_users` SET `status` = 'STATUS_ALREADY_PLAYED' WHERE (`id` = ?);"

const WIN_STRING_1 = "Now you're waiting in the rocket that's going to take you to your new home at the new Ruritania City Spaceport. Thirty or so other new Lunar citizens sit next to you in their chairs, all ready to immigrate to the moon."
const FAIL_TEXT = "didn't quite make it through... better luck next time!"
const CORRECT_INPUT = "** Please enter one of the latest pink-highlighted messages to proceed. **"
const ERROR_TEXT = "Something Bad Happened, please report to somebody !"
const DM_ENABLED = "I can't text you, please make sure you have your DMs enabled"
const THE_END_TEXT = '** ~~ THE END ~~ **'
const TIMEOUT_TEXT = "** The game ended because you ran out of time! Type `!start` to play again. After 10 minutes of inactivity, you'll need to start over. **"
const START_TEXT = "Type `!start` to play and then advance in the story by replying with your choice of the pink-highlighted messages" +
    " — you can just send the number (like `1` or `2`) or you can send the text of the message. \n" +
    "\n" +
    "After 10 minutes of no activity, you'll need to start over.\n" +
    "\n" +
    "You can play as many times as you want until you succeed — then, the bot will give you <:points:819648258112225316> in the main Eco Discord server!\n" +
    "\n" +
    "Good luck! <:eco:812531599089729590>"
// const TIMEOUT_TEXT =
// const TIMEOUT_TEXT =


client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
});

//load the ink file
// var inkFile = fs.readFileSync('./src/intercept.ink.json', 'UTF-8').replace(/^\uFEFF/, '');
// var inkFile = fs.readFileSync('./src/small_example.json', 'UTF-8').replace(/^\uFEFF/, '');
// var inkFile = fs.readFileSync('./src/upcoin_v4.ink.json', 'UTF-8').replace(/^\uFEFF/, '');
// var inkFile = fs.readFileSync('./src/stories/textadventure_v8.ink.json', 'UTF-8').replace(/^\uFEFF/, '');
var inkFile = fs.readFileSync(process.env.STORY_FILE_LOCATION, 'UTF-8').replace(/^\uFEFF/, '');




//create a new story
// var myStory = new Story(inkFile);

//start reading and writing to the console
// var rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// continueToNextChoice();
function takeInput(message, myStory, win, username) {
//check for invalid input s like 1jnd
    let filter = m => m.author.id === message.author.id
    message.channel.awaitMessages(filter, {
        max: 1,
        time: TIMEOUT,
        errors: ['time']
    })
        .then(collected => {


            let foundChoice = false;
            let choiceIndex = 1;
            answer = collected.first()
            answerInt = parseInt(collected.first())


            for (var i = 0; i < myStory.currentChoices.length; ++i) {
                var choice = myStory.currentChoices[i];
                if (answer.toString().toLowerCase() === choice.text.toLowerCase()) {
                    foundChoice = true;
                    choiceIndex = i;
                    // myStory.ChooseChoiceIndex(parseInt(i));
                    // continueToNextChoice(message, myStory,win);
                }
                //
                // else {
                //     // console.log(message)
                //     // message.channel.send(`${message.author}`)
                //     message.channel.send(CORRECT_INPUT)
                //     // message.author.send("Choice Not Present, Try Again")
                //     // console.log("Choice Not Present, Try Again")
                //     takeInput(message, myStory,win);
                // }

            }

            if (foundChoice === true) {
                myStory.ChooseChoiceIndex(parseInt(choiceIndex));
                continueToNextChoice(message, myStory, win, username);
            }  else if (answerInt > 0 && answerInt <= myStory.currentChoices.length) {
                    myStory.ChooseChoiceIndex(parseInt(answerInt) - 1);
                    continueToNextChoice(message, myStory,win, username);
            }
            else {
                // console.log(message)
                // message.channel.send(`${message.author}`)
                message.channel.send(CORRECT_INPUT)
                // message.author.send("Choice Not Present, Try Again")
                // console.log("Choice Not Present, Try Again")
                takeInput(message, myStory, win, username);
            }


            //
            // answerInt = parseInt(collected.first())
            // if (answerInt <= myStory.currentChoices.length) {
            //     myStory.ChooseChoiceIndex(parseInt(answerInt) - 1);
            //     continueToNextChoice(message, myStory,win);
            // } else {
            //     // console.log(message)
            //     // message.channel.send(`${message.author}`)
            //     message.channel.send(CORRECT_INPUT)
            //     // message.author.send("Choice Not Present, Try Again")
            //     // console.log("Choice Not Present, Try Again")
            //     takeInput(message, myStory,win);
            // }
        })
        .catch(collected => {
            end(message, myStory, false, username).then(r  =>  { message.channel.send(TIMEOUT_TEXT); console.log("timeout")})


        });


    // await client.on('message', async (answer) => {
    //     answerInt = parseInt(answer);
    //     //continue with that choice
    //     if (answerInt <= myStory.currentChoices.length) {
    //         myStory.ChooseChoiceIndex(parseInt(answerInt) - 1);
    //         continueToNextChoice(answer);
    //     } else {
    //         // message.author.send("Choice Not Present, Try Again")
    //         // console.log("Choice Not Present, Try Again")
    //         takeInput(answer);
    //     }
    // });
    // rl.question('> ', (answer) => {
    //     //continue with that choice
    //     if(answer <= myStory.currentChoices.length ) {
    //         myStory.ChooseChoiceIndex(parseInt(answer) - 1);
    //         continueToNextChoice();
    //     }
    //     else {
    //         message.author.send("Choice Not Present, Try Again")
    //         // console.log("Choice Not Present, Try Again")
    //         takeInput();
    //     }
    // });
}
//
// async function check(username) {
//
//
//     await fs.readFile(FILE_LOCATION, function (err, data) {
//         if (err) {
//             console.log(err)
//             return STATUS_ERROR;
//         } else if (data.includes(`${username}`)) {
//             console.log("test2")
//             return STATUS_ALREADY_PLAYED;
//         } else {
//             return STATUS_NEW_PLAYER;
//         }
//     });
// }

// async function checkIfAlreadyPlayed(username) {
//
//     const status = await check(username);
//     return status.toString();
// }

// const checkIfAlreadyPlayed = async (username) => {
//     return await check(username);}

async function queryDb() {
    // await delay(10000)
    await dbcon.query('SELECT 1', function (err, result) {
        if (err) throw err;
        console.log(result)
        return result;
    });

    // return "sdsd"
}

const getData = async (username) => {
    // try {
    // const response = await fetch("https://jsonplaceholder.typicode.com/todos/1")
    // const data = await response.json()
    // console.log(data)
    // return ""

    const response = await queryDb();
    // const data = await response.json();
    console.log(response)

    // await dbcon.query('SELECT 1',function(err, result) {
    //     if (err) throw err;
    //     console.log(result)
    // });

    // const resp =  await fs.readFileSync(FILE_LOCATION, function (err, data) {
    //        if (err) {
    //            console.log(err)
    //            return STATUS_ERROR;
    //        } else if (data.includes(`${username}`)) {
    //            return STATUS_ALREADY_PLAYED;
    //        } else {
    //            return STATUS_NEW_PLAYER;
    //        }
    //    });
    // } catch (err) {
    //     console.log(err)
    //     return STATUS_ERROR;
    // }
}

function queryPromise(str, params) {
    return new Promise((resolve, reject) => {
        dbcon.query(str, params, (err, result, fields) => {
            if (err) reject(err);
            resolve(result);
        })
    })
}

async function discordSendPromise(message,messageToSend) {
    // await delay(10000)
    return new Promise((resolve, reject) => {
        // dbcon.query(str, params, (err, result, fields) => {
        //     if (err) reject(err);

        resolve(message.channel.send(messageToSend));
        // console.log("ye resolve hai",resolve(message.channel.send(messageToSend)))
        // })
    })
}

client.on('message', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.DISCORD_CHANNEL_ID && message.channel.type !== "dm") return;
    if (message.content.startsWith(PREFIX)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/);
        if (CMD_NAME.toLowerCase() === 'play') {
            try {


                // alternative to store username: message.author.id
                // console.log(message)
                // console.log(message.author)

                //  await dbcon.query('SELECT 1',function(err, result) {
                //     if (err) throw err;
                //     console.log(result)
                // });

                // console.log("ye aa gyee")

                // const getData = async () => {
                //     // const response = await fetch("https://jsonplaceholder.typicode.com/todos/1")
                //     // const data = await response.json()
                //     // await delay(1000)
                //     console.log("dssfsf")
                //     // console.log(data)
                // }
                let username = message.author.id // + "#" + message.author.discriminator

                let status = ""//await getData(username)
                // let heroidQuery = await queryPromise("SELECT * FROM owned_heroes WHERE user = ? AND equipped = 1", [req.session.login]);
                let queryResult = await queryPromise(CHECK_STATUS_QUERY, [username]);
                if (queryResult.length === 0) {
                    status = STATUS_NEW_PLAYER
                    message.channel.send(`${message.author} ` + START_PLAY_TEXT)
                    const embed = new MessageEmbed()
                        .setTitle("Welcome To Eco's Text Adventure Game")
                        .setDescription(START_TEXT)
                        .setColor(COLOR_GREEN)
                        .setThumbnail(THUMBNAIL)


                        message.author.send(embed).catch(error => {
                            message.channel.send(`${message.author} ` + DM_ENABLED)

                        })

                } else if (queryResult.length > 0) {
                    if (queryResult[0].status.toString() === STATUS_ALREADY_PLAYED) {
                        message.channel.send(`${message.author} ` + ALREADY_PLAYED)
                    } else if (queryResult[0].status.toString() === STATUS_PLAYING) {
                        message.channel.send(`${message.author} ` + PLAYING)
                    }
                }


                // let status = await (checkIfAlreadyPlayed(username));
                // console.log("test1")
                //  console.log(status)
                //
                // if (status === STATUS_ERROR) {
                //     console.log(err)
                //     message.channel.send(ERROR_TEXT)
                // } else if (status === STATUS_ALREADY_PLAYED) {
                //     message.channel.send(`${message.author} ` + ALREADY_PLAYED)
                // } else if (status === STATUS_NEW_PLAYER) {
                //     message.channel.send(`${message.author} ` + START_PLAY_TEXT)
                //     const embed = new MessageEmbed()
                //         .setTitle("Welcome To Eco's Text Adventure Game")
                //         .setDescription(START_TEXT)
                //         .setColor(COLOR_GREEN)
                //         .setThumbnail(THUMBNAIL)
                //
                //     message.author.send(embed)
                // }
            } catch (err) {
                message.channel.send(`${message.author} ` + ERROR_TEXT)
            }


            // fs.readFile(FILE_LOCATION, function (err, data) {
            //     if (err) {
            //         console.log(err)
            //         message.channel.send(ERROR_TEXT)
            //         return;
            //     } else if (data.includes(`${username}`)) {
            //         message.channel.send( `${message.author} ` + ALREADY_PLAYED)
            //         // to check client id
            //         // console.log(client)
            //     } else {
            //         // username = username + " ";
            //         // fs.appendFile(FILE_LOCATION, username, (err) => {
            //         //
            //         //     if (err) {
            //         //         console.log(err)
            //         //         message.channel.send(ERROR_TEXT)
            //         //         return;
            //         //
            //         //     }
            //         // })
            //
            //         message.channel.send(`${message.author} ` + START_PLAY_TEXT)
            //         // message.author.send("Type `!start` to play")
            //         // message.author.send(START_TEXT)
            //         const embed = new MessageEmbed()
            //             .setTitle("Welcome To Eco's Text Adventure Game")
            //             .setDescription(START_TEXT)
            //             .setColor(COLOR_GREEN)
            //             .setThumbnail(THUMBNAIL)
            //
            //         message.author.send(embed)
            //
            //     }
            // });

        } else if (CMD_NAME.toLowerCase() === 'start') {
            try {

                if (message.channel.type !== "dm") {

                    message.channel.send(`${message.author} ` + "go to your DMs to start the game!")
                    return;
                }

                //check if already played :D

                // let username = message.author.id // + "#" + message.author.discriminator
                // // alternative to store username: message.author.id
                // console.log(message)
                // console.log(message.author)
                //
                // fs.readFile(FILE_LOCATION, function (err, data) {
                //     if (err) {
                //         console.log(err)
                //         message.channel.send(ERROR_TEXT)
                //         return;
                //     } else if (data.includes(`${username}`)) {
                //         message.channel.send(`${message.author} ` + ALREADY_PLAYED)
                //         // to check client id
                //         // console.log(client)
                //     } else {
                //         username = username + ", ";
                //         fs.appendFile(FILE_LOCATION, username, (err) => {
                //
                //             if (err) {
                //                 console.log(err)
                //                 message.channel.send(ERROR_TEXT)
                //                 return;
                //
                //             }
                //         })
                //
                //         // if(message.channel.type !== "dm") {
                //         //
                //         //     message.channel.send("You have to start this game in DM")
                //         //     return;
                //         // }
                //         // else {
                //         let myStory = new Story(inkFile);
                //         let win = false;
                //         continueToNextChoice(message, myStory, win, username);
                //         // }
                //     }
                // });

                // DELETE FROM `eco`.`discord_users` WHERE (`id` = '745287787502108700');
                // UPDATE `eco`.`discord_users` SET `status` = 'STATUS_ALREADY_PLAYED' WHERE (`id` = '745287787502108700');


                let username = message.author.id // + "#" + message.author.discriminator

                let status = ""//await getData(username)
                // let heroidQuery = await queryPromise("SELECT * FROM owned_heroes WHERE user = ? AND equipped = 1", [req.session.login]);
                let queryResult = await queryPromise(CHECK_STATUS_QUERY, [username]);
                if (queryResult.length === 0) {
                    status = STATUS_NEW_PLAYER
                    let myStory = new Story(inkFile);
                    let win = false;
                    let insertQueryResult = await queryPromise(INSERT_PLAYING_STATUS_QUERY, [username, STATUS_PLAYING]);
                    console.log(insertQueryResult)
                    continueToNextChoice(message, myStory, win, username);

                } else if (queryResult.length > 0) {
                    if (queryResult[0].status.toString() === STATUS_ALREADY_PLAYED) {
                        message.channel.send(`${message.author} ` + ALREADY_PLAYED)
                    } else if (queryResult[0].status.toString() === STATUS_PLAYING) {
                        return;
                        // message.channel.send(`${message.author} ` + PLAYING)
                    }
                }


                // if(message.channel.type !== "dm") {
                //
                //     message.channel.send("You have to start this game in DM")
                //     return;
                // }
                // else {
                //     let myStory = new Story(inkFile);
                //     continueToNextChoice(message, myStory,win);
                // }

                // type: 'dm',
                //     deleted: false,
                //     id: '836292434677727284',
                //     recipient: User {
                //     id: '745287787502108700
                // console.log(message.channel)
            } catch (err) {
                message.channel.send(`${message.author} ` + ERROR_TEXT)
            }

        } else {
            return;
            // message.channel.send('Sorry ! But I don\'t know, what to say !')
        }
    }
});

async function continueToNextChoice(message, myStory, win, username) {
    //check we haven't reached the end of the story

    if (!myStory.canContinue && myStory.currentChoices.length === 0) end(message, myStory, win, username);

    //write the story to the console until we find a choice
    while (myStory.canContinue) {

        // send msg to user

        let storyLine = myStory.Continue().toString()
        // console.log(storyLine)

        //winning strings checks

        if (storyLine.includes(WIN_STRING_1) === true) {
            win = true;
            //give reward logic
            // message.channel.send("give him reward")

        }

    if(storyLine !== "\n" && storyLine !== "")
        {
            const embed = new MessageEmbed()
                .setColor('#00D8D5')
                .setDescription(storyLine);


            // message.channel.send(myStory.Continue())

            // setTimeout(() => {
            //     message.channel.send(embed);
            // }, 1001);

            // await discordSendPromise(message, embed)
            console.log(storyLine)
            message.channel.send(embed);
            await delay(DELAY_IN_MILLISECS);
        }


        // console.log(myStory.Continue());
    }


    //check if there are choices

    if (myStory.currentChoices.length > 0) {
        for (var i = 0; i < myStory.currentChoices.length; ++i) {
            var choice = myStory.currentChoices[i];
            let choiceWithNumbers = (i + 1) + ". " + choice.text;
            // console.log(choiceWithNumbers)
            // console.log(choice.text)
            if (choice.text.toString() !== "\n" && choice.text.toString() !== "") {
                const embed = new MessageEmbed()
                    .setColor('#FF4C8B')
                    .setDescription(choiceWithNumbers);
                // .setDescription(choice.text);

                // setTimeout(() => {
                //     message.channel.send(embed);
                // }, 1001);

                // console.log("ye dekhoooooooo",message.channel.send("this should not print before"))
                console.log(choiceWithNumbers)
                message.channel.send(embed)
                // await discordSendPromise(message, embed)
                // console.log("ye aana chahiye", isSend)
                // message.channel.send("this should not print before")
                if (i < myStory.currentChoices.length -1) {
                    // message.channel.send("Waiting")
                    await delay(DELAY_IN_MILLISECS);
                    // message.channel.send("Wait over")
                }
                // console.log((i + 1) + ". " + choice.text);
            }
        }

        //await a user input here
        takeInput(message, myStory, win, username);


        //prompt the user for a choice
        // recursive function takeInput()
        // rl.question('> ', (answer) => {
        //     //continue with that choice
        //     if(answer <= myStory.currentChoices.length ) {
        //         myStory.ChooseChoiceIndex(parseInt(answer) - 1);
        //         continueToNextChoice();
        //     }
        // });

    } else {
        //if there are no choices, we reached the end of the story
        end(message, myStory, win, username);
    }
}

async function end(message, myStory, win, username) {
    if (win === true) {
        const botRewardsChannel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
        let insertQueryResult = await queryPromise(UPDATE_STATUS_TO_ALREADY_PLAYED_QUERY, [username]);
        const randomRewards = Math.floor(Math.random() * 4) + 1;
        botRewardsChannel.send(`!send <@!${message.author.id}> ` + randomRewards + " <:points:819648258112225316> for completing the text Adventure Game")
        // botRewardsChannel.send(`!send ${message.author} 50 <:points:819648258112225316> for completing the text Adventure Game`)
        message.channel.send(THE_END_TEXT)
    } else {
        const botRewardsChannel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
        let deleteQueryResult = await queryPromise(DELETE_PLAYING_STATUS_QUERY, [username]);
        botRewardsChannel.send(`${message.author} ` + FAIL_TEXT)
        // const randomRewards = Math.floor(Math.random() * 40) + 10;
        // botRewardsChannel.send(`!send ${message.author} ` + randomRewards + " <:points:819648258112225316> for completing the text Adventure Game")
        message.channel.send(THE_END_TEXT)
    }
    // mark him as played


// message.client.channels
    // console.log('THE END');
    // rl.close();
}

function delay(delayInMs) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayInMs);
    });
}

client.login(process.env.DISCORDJS_BOT_TOKEN);
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
