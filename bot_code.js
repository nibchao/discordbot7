// https://discord.js.org/#/
const { Client, Intents, Message, Permissions, GuildEmojiRoleManager, MessageEmbed, Partials } = require("discord.js");
//const { token, clientID, guildID } = require("./credentials/discordCredentials.json"); // uncomment this when uploading to main bot
const { token, clientID, guildID } = require("./credentials/discordTestingBotCredentials.json"); // comment this when uploading to main bot

// https://developers.google.com/youtube/v3/quickstart/nodejs
 const { google } = require('googleapis');
 const OAuth2 = google.auth.OAuth2;
 const youtubeCredentials = require(`./credentials/youtubeCredentials.json`);
 const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

// Check for live streams
const checkForLiveStreams = require('./commands/botMenu/checkForLiveStreams.js');
//

// For File I/O
const fs = require('fs');
const readline = require('readline');
//

// botMenu
const menuCommands = require('./commands/botMenu/menuFunctions.js');
const { resolve } = require("path");
const { memoryUsage, exit } = require("process");
const { connect } = require("http2");
//

const commandPrefix = '!';
const notificationRoleSuffix = 'role';
const streamerList = 'streamerList.txt';
const roleMessageIDFile = 'roleMessageID.txt';

const client = new Client
({intents: 
  [
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ],
  partials:
  [
    'MESSAGE',
    'CHANNEL',
    'REACTION'
  ]
});

// https://stackoverflow.com/a/18818533, https://www.npmjs.com/package/console-stamp
require('console-stamp')(console, 
{ 
  format: ':date(yyyy/mm/dd HH:MM:ss)' 
});
//

// YOUTUBE NOTIFICATION IDEA
// scan youtube channels for uploads, depending on their id they have different usernames, mention corresponding role + put link in notification message

let currentGuild = '', announceChannel = '', roleMessageID = '', roleChannel = '', connectedGuildName = '';
client.once("ready", () =>
{
    currentGuild = client.guilds.cache.get(guildID);
    connectedGuildName = currentGuild.name;
    console.log(`Connected as ${client.user.tag} to ${connectedGuildName}`);
    console.log('---------------------------');

    announceChannel = currentGuild.channels.cache.find(channel => channel.name === 'announce');
    roleChannel = currentGuild.channels.cache.find(channel => channel.name === 'role');

    client.user.setPresence
    ({
      activities: 
      [{
          type: 'LISTENING', // PLAYING, STREAMING, WATCHING, CUSTOM, COMPETING
          name: 'TWICE'
      }], 
      status: 'online' // idle, offline, dnd
    });

    if (fs.existsSync(`./${streamerList}`))
    {
      console.log(`${streamerList}` + ' was ' + '\x1b[32m%s\x1b[0m', 'found\x1b[0m' + ' in bot_code.js directory.');
    }
    else
    {
      console.log(`${streamerList}` + ' was ' + '\x1b[35m%s\x1b[0m', 'missing\x1b[0m' + ' in bot_code.js directory, ' + '\x1b[32mcreating\x1b[0m' + ` empty ${streamerList} file.\n`);
      fs.writeFile(`${streamerList}`, '', function(err)
      {
        if (err) throw err;
        console.log(`${streamerList} was ` + '\x1b[32m%s\x1b[0m', 'created\x1b[0m' + ' in bot_code.js directory.\n');
      });
    }

    if (fs.existsSync(`./${roleMessageIDFile}`))
    {
      console.log(`${roleMessageIDFile}` + ' was ' + '\x1b[32m%s\x1b[0m', 'found\x1b[0m' + ' in bot_code.js directory.\n');
    }
    else
    {
      console.log(`${roleMessageIDFile}` + ' was ' + '\x1b[35m%s\x1b[0m', 'missing\x1b[0m' + ' in bot_code.js directory, ' + '\x1b[32mcreating\x1b[0m' + ` empty ${roleMessageIDFile} file.\n`);
      fs.writeFile(`${roleMessageIDFile}`, '', function(err)
      {
        if (err) throw err;
        console.log(`${roleMessageIDFile} was ` + '\x1b[32m%s\x1b[0m', 'created\x1b[0m' + ' in bot_code.js directory.\n');
      });
    }
    
    // https://discord.js.org/#/docs/discord.js/stable/class/RoleManager?scrollTo=create
    console.log(`Checking ${streamerList} for any missing roles.`);
    let roleCheck = '', roleCheckCount = 0;
    for (const streamersCnt of streamers)
    {
        roleCheck = currentGuild.roles.cache.find(role => role.name === `${streamersCnt} ${notificationRoleSuffix}`);
        if (roleCheck === undefined)
        {
          console.log(`${streamersCnt} ${notificationRoleSuffix} was ` + '\x1b[35m%s\x1b[0m', 'missing\x1b[0m' + ', ' + '\x1b[32mcreating\x1b[0m' + ` a Discord role for ${streamersCnt}.`);
          currentGuild.roles.create({
            name: `${streamersCnt} ${notificationRoleSuffix}`,
            //color: 'BLUE',
            //reason: 'testing bot creating roles',
          }).catch(console.error);
        }
        else
        {
          roleCheckCount++;
        }
    }

    // if number of checked roles equals number of streamerList.txt roles, then all roles exist
    if (roleCheckCount === streamers.length)
    {
      console.log(`All ${streamerList} roles were ` + '\x1b[32m%s\x1b[0m', 'found\x1b[0m' + '.\n');
    }

    if (roleMessageIDArray.length === 0) // if text file is empty -> make message + store id
    {
          let counter = 0;
          roleChannel.send(`**${'Twitch Notification Roles'}**\n 1⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix} 
          \n 2⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix} 
          \n 3⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix} 
          \n 4⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix}
          \n 5⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix}
          \n 6⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix}
          \n 7⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix}`).then(sent => { roleMessageID = sent.id; sent.react("1⃣").then(() => 
          sent.react("2⃣")).then(() => sent.react("3⃣")).then(() =>
          sent.react("4⃣")).then(() => sent.react("5⃣")).then(() =>
          sent.react("6⃣")).then(() => sent.react("7⃣")).catch(() => console.error('Failed to react with emoji.')).then(() =>
          fs.appendFileSync(`./${roleMessageIDFile}`, `${roleMessageID}`, {encoding:'utf8'})); });
    }
    else
    {
      // need to address the case if multiple copies of the same message ID are in the roleMessageID.txt for whatever reason
      // also if there are empty lines
      // make this a function and use the return value of the function to proceed for whether to make a new message or not (below commented code section)
      let foundMessage = false;
      for (let i = 0; i < roleMessageIDArray.length; i++) // should make runtime faster than O(n^2)
      {    
        roleChannel.messages.fetch(roleMessageIDArray[i]).then(message =>
        {
            for (let j = 0; j < roleMessageIDArray.length; j++)
            {
              if (message.id === roleMessageIDArray[j])
              {
                console.log(`${roleMessageIDArray[i]} was found. Skipped creating role message.`);
                foundMessage = true;
                break;
              }
            }
        }).catch(() => 
        {
        if (!foundMessage) 
        {
          console.log(`${roleMessageIDArray[i]} was not found.`);
        }
        else // this fails to run for some reason if the found message isn't the first line in .txt
        { 
          //console.log('exited');
          return;
        }});
      }
    }

    // let roleMessage = '', roleMessageLength = 0;
    // roleChannel.messages.fetch(roleMessageIDArray[1]).then((message) => // make this iterate through the entire IDArray instead of just index 1 then finally do the bottom if-elif-else statements
    // {
    //   roleMessage = message;
    //   roleMessageLength = message.content.length;
    // }).catch(console.error).then(() => 
    // { 
    //   if (roleMessageIDArray.length !== 0 && roleMessageLength === 0) // if text file is not empty but does not contain the message id -> make message + store id
    //   {
    //     console.log('make message + store id');
    //   }
    //   else // if text file is not empty and contains the message id -> do nothing
    //   {
    //     console.log('do nothing');
    //   }
    // });

    //startBot();
    //botMenu();

    //startLiveCheck();
});

String.prototype.replaceAt = function(index, replacement) 
{
  return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

async function botMenu()
{
  let menuChoice = '';
  do
  {
    menuChoice = await menuCommands.printMenu();
    switch(menuChoice)
    {
      case '0': // prints usernames in streamerList.txt
        console.log(`Printing contents of ${streamerList}: \n`);
        menuCommands.printStreamers();
        break;
      case '1': // adds username to streamerList.txt
        console.log(`Adding streamer to ${streamerList}: \n`);
        let addStreamerUsername = await menuCommands.getStreamerUsername();
        menuCommands.addStreamer(addStreamerUsername);
        break;
      case '2': // if there are two duplicate usernames that were manually added to streamerList.txt, there will be an issue with 1 empty line left in the list
        console.log(`Removing streamer from ${streamerList}: \n`);
        let removeStreamerUsername = await menuCommands.getStreamerUsername();
        menuCommands.removeStreamer(removeStreamerUsername);
        break;
      case '3': // enables bot functions - probably add setInterval loops in all bot functions (so far just live announcement) to check if start === 1 or something
        console.log('Started bot. \n');
        startBot(); // need to somehow loop this until shift+q is returned then print table again
        break;
      case '4': // disables bot functions - same as case 3 except make start === 0 or something which prevents the functions from executing
        console.log('Stopped bot. \n');
        break;
      case '5':
        console.log('Ended the program.');
        process.exit(0);
      case '6': // make bot post role message in #role channel
        console.log('Post roles in #role channel. \n');
        // make command for posting roles
        break;
      case '7': // adds username to youtubeList.txt
        console.log('Add YouTube channel for notifications')
        break;
      case '8': // prints contents of emoteRequests.txt
        console.log('Print all existing emote requests');
        break;
      case '9': // remove username from youtubeList.txt
        console.log('Remove youtuber from youtubeList.txt');
        break;
      default:
        console.log('Error: Invalid input. Enter a value from 0-5.\n');
        break;
    } 
  }
  while (menuChoice !== '5');
}

// https://nodejs.org/api/tty.html, https://gist.github.com/newvertex/d78b9c6050d6a8f830809e6e528d5e96, https://thisdavej.com/making-interactive-node-js-console-apps-that-listen-for-keypress-events/
function startBot()
{
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY)
  {
    process.stdin.setRawMode(true);
  }
  return new Promise(resolve => 
  {
    process.stdin.on('keypress', (keyPressed, key) => // once shift+S is pressed, loop until shift+Q is pressed
    {
      if (key && key.name === 's' && key.shift)
      {
        process.stdin.pause();
        process.stdin.setRawMode(false);
        checkStreamerNotificationRoles();
        startLiveCheck();   
      }
      else if (key && key.name == 'q' && key.shift)
      {
        //process.stdin.pause();
        //process.stdin.setRawMode(false);
        console.log('Stopping bot and program.');
        process.exit(0);
      }
    })
  })
}

let liveMemory = [];
let streamers = [];
let streamersNoMarkDown = [];
readline.createInterface // https://stackoverflow.com/a/12299566
(
  {
    input: fs.createReadStream(`./${streamerList}`),
    terminal: false
  }
).on('line', function(line)
{
  let lineNoMarkDown = '';
  lineNoMarkDown = line.replaceAll('_',  '\\_');
  streamersNoMarkDown.push(lineNoMarkDown);
  streamers.push(line);
});

let roleMessageIDArray = [];
readline.createInterface
(
  {
    input: fs.createReadStream(`./${roleMessageIDFile}`),
    terminal: false
  }
).on('line', function(line)
{
  roleMessageIDArray.push(line);
});

for (let cnt = 0; cnt < streamers.length; cnt++) // for loop creates a liveMemory variable for each streamer
{
  liveMemory[cnt] = false;
}

function startLiveCheck()
{
  setInterval(async() =>
  {  
    for (let cnt = 0; cnt < streamers.length; cnt++)
    {
      await checkForLiveStreams.Run(streamers[cnt], currentGuild, announceChannel, liveMemory[cnt]).then(() =>
      {
        liveMemory[cnt] = checkForLiveStreams.liveStorage;
      });
    }
  }, 30000);
}

client.on('messageCreate', async(message) => 
{
  let args = message.content.slice(commandPrefix.length).trim().split(/ +/g);
  let command = args.shift().toLowerCase(); 

  if (message.author.bot) 
  {
    return;
  }

  let target = message.mentions.users.first();
  let reason = message.content.slice(command.length + 1).trim().split(/ +/g);
  
  if (command === 'kick')
  {
    if (message.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS]))
    {
      if (target === undefined)
      {
        message.channel.send('Error: User not found or target was missing. Command format is !kick @<user> [optional reason].');
        return;
      }
      let memberID = message.guild.members.cache.get(target.id); 
      if (message.member.roles.highest.comparePositionTo(message.mentions.members.first().roles.highest) <= 0)
      {
        message.channel.send(`${memberID} has a higher role and could not be kicked.`);
        return;
      }
      if (reason[1] === undefined)
      {
        message.channel.send(`${memberID} was kicked.`);
      }
      else
      {
        message.channel.send(`${memberID} was kicked for ${reason[1]}.`);
      }
    }
    else
    {
      message.channel.send(`<@${message.member.id}>, you do not have permission to use this command.`);
    }
  }
  else if (command === 'ban')
  {
    if (message.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]))
    {
      if (target === undefined)
      {
        message.channel.send('Error: User not found or target was missing. Command format is !ban @<user> [optional reason].');
        return;
      }
      let memberID = message.guild.members.cache.get(target.id); 
      if (message.member.roles.highest.comparePositionTo(message.mentions.members.first().roles.highest) <= 0)
      {
        message.channel.send(`${memberID} has a higher role and could not be banned.`);
        return;
      }
      if (reason[1] === undefined)
      {
        message.channel.send(`${memberID} was banned.`);
      }
      else
      {
        message.channel.send(`${memberID} was banned for ${reason[1]}.`);
      }
    }
    else
    {
      message.channel.send(`<@${message.member.id}>, you do not have permission to use this command.`);
    }
  }
})

// https://stackoverflow.com/a/65729237
client.on('messageReactionAdd', async (reaction, user) =>
{
  if (reaction.partial)
  {
    try
    {
      await reaction.fetch();
    }
    catch (error)
    {
      console.error(error);
      return;
    }
  }
  if (user.bot === false)
  {
    if (reaction.message.id != roleMessageID)
    //if (reaction.message.id !== '955244733419098112') // temporarily hardcoded role message ID
    {
        return;
    }

    let mem = reaction.message.guild.members.cache.find(mem => mem.id === user.id);
    let memberUsername = mem.displayName;
    let reactionEmojiName = reaction.emoji.name;
    let counter = 0;
    switch (reactionEmojiName) // 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣ 9⃣
    {
      case "1⃣": // if '1' reaction
        counter += 0;
        break;
      case "2⃣": // if '2' reaction
        counter += 1;
        break;
      case "3⃣": // if '3' reaction
        counter += 2;
        break;
      case "4⃣": // if '4' reaction
        counter += 3;
        break;
      case "5⃣": // if '5' reaction
        counter += 4;
        break;
      case "6⃣": // if '6' reaction
        counter += 5;
        break;
      case "7⃣": // if '7' reaction
        counter += 6;
        break;
      default:
        console.log(`${memberUsername} tried to add a role, but a role was missing for the emoji reaction(s).`);
        return;
    }
    let roleToAdd = '';
    roleToAdd = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[counter]} ${notificationRoleSuffix}`);
    let roleName = '';
    roleName = roleToAdd.name;
    console.log('\x1b[4m%s\x1b[0m', `${memberUsername}\x1b[0m` + '\x1b[36m added \x1b[0m' + `"${roleName}" role.`);
    mem.roles.add(roleToAdd);
  }
})

client.on('messageReactionRemove', async (reaction, user) =>
{
  if (reaction.partial)
  {
    try
    {
      await reaction.fetch();
    }
    catch (error)
    {
      console.error(error);
      return;
    }
  }
  if (user.bot === false)
  {
    if (reaction.message.id != roleMessageID)
    //if (reaction.message.id !== '955244733419098112') // temporarily hardcoded role message ID
    {
      return;
    }

    let mem = reaction.message.guild.members.cache.find(mem => mem.id === user.id);
    let memberUsername = mem.displayName;
    let reactionEmojiName = reaction.emoji.name;
    let counter = 0;
    switch (reactionEmojiName) // 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣ 9⃣
    {
      case "1⃣": // if '1' reaction
        counter += 0;
        break;
      case "2⃣": // if '2' reaction
        counter += 1;
        break;
      case "3⃣": // if '3' reaction
        counter += 2;
        break;
      case "4⃣": // if '4' reaction
        counter += 3;
        break;
      case "5⃣": // if '5' reaction
        counter += 4;
        break;
      case "6⃣": // if '6' reaction
        counter += 5;
        break;
      case "7⃣": // if '7' reaction
        counter += 6;
        break;
      default:
        console.log(`${memberUsername} tried to remove a role, but a role was missing for the emoji reaction(s).`);
        return;
    }
    let roleToRemove = '';
    roleToRemove = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[counter]} ${notificationRoleSuffix}`);
    let roleName = '';
    roleName = roleToRemove.name;
    console.log('\x1b[4m%s\x1b[0m', `${memberUsername}\x1b[0m` + '\x1b[36m removed \x1b[0m' + `"${roleName}" role.`);
    mem.roles.remove(roleToRemove);
  }
})

client.login(token);

// SLASH COMMANDS STUFF
//
/*
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(token);
const commands = 
[{
  name: 'test', 
  description: 'Replies with test!'
}]; 

(async () => 
{
  try 
  {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(clientID, guildID), {body: commands});
    console.log('Successfully reloaded application (/) commands.');
  } 
  catch (error) 
  {
    console.error(error);
  }
})();

client.on('interactionCreate', async interaction => 
{
  if (!interaction.isCommand()) 
  {
    return;
  }

  if (interaction.commandName === 'test') 
  {
    await interaction.reply(' hello test slash command ');
  }
});
*/

// hardcoded youtube channel url at the moment; if it's possible, try to get youtube channel url by fetching via search parameters https://developers.google.com/youtube/v3/docs/search/list?apix=true
    // https://stackoverflow.com/a/1431113

    /*let ytChannelURL = 'UCSD0MKMFT0bZP4jj6c5ihMw'; // need to see what happens when user has custom channel URL
    console.log(ytChannelURL);
    let latestVideoURL = '';
    latestVideoURL = ytChannelURL.replaceAt(1, 'U'); // replacing the C with a U makes the playlist request work for some reason
    console.log(latestVideoURL);

    let googleURLTemp = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${latestVideoURL}&maxResults=1&key=${youtubeCredentials.installed.api_key}`;
    console.log(googleURLTemp);*/
    //console.log(googleURLTemp.items.snippet.resourceId.videoId); // need to somehow access the contents in the URL instead of accessing the actual URL
    // then get videoID from above somehow and use in `https://www.youtube.com/watch?v=${videoID}` to post for video URL in notification message