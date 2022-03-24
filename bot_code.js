// https://discord.js.org/#/
const { Client, Intents, Message, Permissions, GuildEmojiRoleManager, MessageEmbed, Partials } = require("discord.js");
//const { token, clientID, guildID } = require("./credentials/discordCredentials.json"); // uncomment this when uploading to main bot
const { token, clientID, guildID } = require("./credentials/discordTestingBotCredentials.json"); // comment this when uploading to main bot

// https://www.npmjs.com/package/youtube-api
// const YoutubeApi = require('youtube-api');
// const youtubeCredentials = require(`./credentials/youtubeCredentials.json`);

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
const { memoryUsage } = require("process");
//

const commandPrefix = '!';
const notificationRoleSuffix = 'role';
const streamerList = 'streamerList.txt';

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

// const oauth = YoutubeApi.authenticate
// ({
//   type: "oauth", 
//   client_id: youtubeCredentials.client_id, 
//   client_secret: youtubeCredentials.client_secret,
//   redirect_url: youtubeCredentials.redirect_uris
// });

let currentGuild = '', announceChannel = '', roleMessageID = '', roleChannel = '';
client.once("ready", () =>
{
    console.log(`Connected as ${client.user.tag}`);
    console.log('---------------------------');

    currentGuild = client.guilds.cache.get(guildID);
    announceChannel = currentGuild.channels.cache.find(channel => channel.name === 'announce');
    roleChannel = currentGuild.channels.cache.find(channel => channel.name === 'bot');

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
      console.log(`\n${streamerList}` + ' was ' + '\x1b[32m%s\x1b[0m', 'found\x1b[0m' + ' in bot_code.js directory.\n');
    }
    else
    {
      console.log(`\n${streamerList}` + ' was ' + '\x1b[35m%s\x1b[0m', 'missing\x1b[0m' + ' in bot_code.js directory, ' + '\x1b[32mcreating\x1b[0m' + ` empty ${streamerList} file.\n`);
      fs.writeFile(`${streamerList}`, '', function(err)
      {
        if (err) throw err;
        console.log(`${streamerList} was ` + '\x1b[32m%s\x1b[0m', 'created\x1b[0m' + ' in bot_code.js directory.\n');
      });
    }

    // https://discord.js.org/#/docs/discord.js/stable/class/RoleManager?scrollTo=create
    console.log(`Checking ${streamerList} for any missing roles.`);
    let roleCheck = '', roleCheckCount = 0;
    for (let cnt = 0; cnt < streamers.length; cnt++)
    {
        roleCheck = currentGuild.roles.cache.find(role => role.name === `${streamers[cnt]} ${notificationRoleSuffix}`);
        if (roleCheck === undefined)
        {
          console.log(`${streamers[cnt]} ${notificationRoleSuffix} was ` + '\x1b[35m%s\x1b[0m', 'missing\x1b[0m' + ', ' + '\x1b[32mcreating\x1b[0m' + ` a Discord role for ${streamers[cnt]}.`);
          currentGuild.roles.create({
            name: `${streamers[cnt]} ${notificationRoleSuffix}`,
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
    if (roleCheckCount == streamers.length)
    {
      console.log(`All ${streamerList} roles were ` + '\x1b[32m%s\x1b[0m', 'found\x1b[0m' + '.');
    }
    console.log();

    // temporary here for testing role message + reaction add/remove
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
    sent.react("6⃣")).then(() => sent.react("7⃣")).catch(() => console.error('emoji failed to react.')); });

    // i'm not sure how to do this, but i wanted to do the following: filter messages in #role by message content (works), get message ids of filtered messages for messageReactionAdd/Remove to check (can't figure out)
    // another way could be to read in a .txt file for message ID; first create role message, store the roleMessageID in the .txt file, read in this file for the ID any time after the bot is restarted 
    /*let filteredMessage = '';
    roleChannel.messages.fetch().then(messages => 
    {
      filteredMessage = (messages.filter(m => m.content.includes('Twitch Notification Roles')));
      console.log(filteredMessage);
    }).catch(console.error);*/

    if (roleMessageID === undefined)
    {
      // https://github.com/discord/discord-api-docs/issues/2723#issuecomment-807022205 
      // https://emzi0767.gl-pages.emzi0767.dev/discord-emoji/discordEmojiMap-canary.json
      // 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣ 9⃣ - up to 20 reactions on a message
      /*let counter = 0;
      roleChannel.send(`**${'Twitch Notification Roles'}**\n 1⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix} 
      \n 2⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix} 
      \n 3⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix} 
      \n 4⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix}
      \n 5⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix}
      \n 6⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix}
      \n 7⃣ ${streamersNoMarkDown[counter++]} ${notificationRoleSuffix}`).then(sent => { roleMessageID = sent.id; sent.react("1⃣").then(() => 
      sent.react("2⃣")).then(() => sent.react("3⃣")).then(() =>
      sent.react("4⃣")).then(() => sent.react("5⃣")).then(() =>
      sent.react("6⃣")).then(() => sent.react("7⃣")).catch(() => console.error('emoji failed to react.')); });*/
    }

    //startBot();
    //botMenu();

    //checkStreamerNotificationRoles();
    //startLiveCheck();
});

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
  lineNoMarkDown = line.replaceAll('_',  '*_*');
  streamersNoMarkDown.push(lineNoMarkDown);
  streamers.push(line);
});

for (let cnt = 0; cnt < streamers.length; cnt++) // for loop creates a liveMemory variable for each streamer
{
  liveMemory[cnt] = false;
}

let roleMissing = [];
let roleFound = ['ekun7']; // hardcoded to include my username by default
function checkStreamerNotificationRoles()
{
  for (let cnt = 0; cnt < streamers.length; cnt++)
  {
    let roleID = '';
    roleID = currentGuild.roles.cache.find(role => role.name === `${streamers[cnt]} ${notificationRoleSuffix}`);
    if (roleID === undefined)
    {
      roleMissing.push(streamers[cnt]);
    }
    else
    {
      roleFound.push(streamers[cnt]);
    }
  }
 
  if (roleMissing.length == 0)
  {
    console.log('No roles were missing.');
  }
  else
  {
    console.log(`${roleMissing} roles were ` + '\x1b[35m%s\x1b[0m', 'not found\x1b[0m' + '. No live announcement for these streamers.');
  }
  console.log('----------');
  console.log(`${roleFound} roles were ` + '\x1b[32m%s\x1b[0m', 'found\x1b[0m' + '! Live announcements enabled for these streamers.');
  console.log('---------------------------');
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
    //if (reaction.message.id != roleMessageID)
    if (reaction.message.id === '955244733419098112') // temporarily hardcoded role message ID
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
    //if (reaction.message.id != roleMessageID)
    if (reaction.message.id === '955244733419098112') // temporarily hardcoded role message ID
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

// YOUTUBE NOTIFICATION IDEA
//
// get channel name, get video title, set header title to 'youtube'; simple send message with @everyone
// since discord auto embeds youtube links, maybe don't even need to do the fetching video info
// and just fetch the latest video then post link with message in #youtube channel using auto embed


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