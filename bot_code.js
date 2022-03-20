// https://discord.js.org/#/
const { Client, Intents, Message, Permissions, GuildEmojiRoleManager, MessageEmbed, Partials } = require("discord.js");
const { token, clientID, guildID } = require("./credentials/discordCredentials.json");

// https://www.npmjs.com/package/node-twitch
// const TwitchApi = require('node-twitch').default;
// const twitchCredentials = require('./credentials/twitchCredentials.json');

// https://www.npmjs.com/package/youtube-api
// const YoutubeApi = require('youtube-api');
// const youtubeCredentials = require(`./credentials/youtubeCredentials.json`);

var test456 = require('./commands/botMenu/checkForLiveStreams.js');

const commandPrefix = '!';
const fs = require('fs');
const readline = require('readline');

var menuCommands = require('./commands/botMenu/menuFunctions.js');
const { resolve } = require("path");
const { memoryUsage } = require("process");

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


// https://stackoverflow.com/a/65729237, could switch to reactionCollector instead https://discordjs.guide/popular-topics/collectors.html#reaction-collectors and https://stackoverflow.com/a/60754621
// as is right now, adding the pogchamping emote reaction from my emote server will add 'nnabi role' so need to limit it to only in #role channel
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
    {
        return;
    }
    const mem = reaction.message.guild.members.cache.find(mem => mem.id === user.id);
    var role;
    // need a way to catch error if role name doesn't exist; try-catch block doesn't work or what i tried before didn't work because TypeError gets thrown if role name doesn't exist
    if (reaction.emoji.name === "1⃣") // if '1' reaction, add 'schoolmealclub7 role'
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === 'schoolmealclub7 role');
    }
    else if (reaction.emoji.name == "2⃣") // if '2' reaction, add 'lilpearl_ role'
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === 'lilpearl_ role');
    }
    else if (reaction.emoji.name == "3⃣") // if '3' reaction, add 'parkhaag role'
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === 'parkhaag role');
    }
    else if (reaction.emoji.name == "4⃣") // if '4' reaction, add 'chodan_ role'
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === 'chodan_ role');
    }
    else
    {
      console.log('Attempted to add role from reaction and a role does not exist for the emoji reaction.');
      return;
    }
    mem.roles.add(role);
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
    {
      return;
    }
    const mem = reaction.message.guild.members.cache.find(mem => mem.id === user.id);
    var role;
    // need a way to catch error if role name doesn't exist; try-catch block doesn't work or what i tried before didn't work because TypeError gets thrown if role name doesn't exist
    if (reaction.emoji.name === "1⃣") // if '1' reaction, add 'schoolmealclub7 role'
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === 'schoolmealclub7 role');
    }
    else if (reaction.emoji.name == "2⃣") // if '2' reaction, add 'lilpearl_ role'
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === 'lilpearl_ role');
    }
    else if (reaction.emoji.name == "3⃣") // if '3' reaction, add 'parkhaag role'
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === 'parkhaag role');
    }
    else if (reaction.emoji.name == "4⃣") // if '4' reaction, add 'chodan_ role'
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === 'chodan_ role');
    }
    else
    {
      console.log('Attempted to remove role from reaction and a role does not exist for the emoji reaction.');
      return;
    }
    mem.roles.remove(role);
  }
})

// const twitch = new TwitchApi
// ({
//   client_id: twitchCredentials.client_id, 
//   client_secret: twitchCredentials.client_secret
// });

// const oauth = YoutubeApi.authenticate
// ({
//   type: "oauth", 
//   client_id: youtubeCredentials.client_id, 
//   client_secret: youtubeCredentials.client_secret,
//   redirect_url: youtubeCredentials.redirect_uris
// });

var currentGuild, announceChannel, roleMessageID;
client.once("ready", () =>
{
    console.log(`Connected as ${client.user.tag}`);
    console.log('---------------------------');

    currentGuild = client.guilds.cache.get(guildID);
    announceChannel = currentGuild.channels.cache.find(channel => channel.name === 'announce');

    client.user.setPresence
    ({
      activities: 
      [{
          type: 'LISTENING', // PLAYING, STREAMING, WATCHING, CUSTOM, COMPETING
          name: 'TWICE'
      }], 
      status: 'online' // idle, offline, dnd
    });

    // https://discord.js.org/#/docs/discord.js/stable/class/RoleManager?scrollTo=create
    /*currentGuild.roles.create({
      name: 'chodan_ role',
      //color: 'BLUE',
      //reason: 'testing bot creating roles',
    }).then(console.log).catch(console.error);*/

    //startBot();

    //botMenu();

    // https://discordjs.guide/popular-topics/reactions.html#removing-reactions
    // https://github.com/discord/discord-api-docs/issues/2723#issuecomment-807022205 // 1⃣
    /*var roleChannel = currentGuild.channels.cache.find(channel => channel.name === 'bot');
    roleChannel.send('react role test').then(sent => { roleMessageID = sent.id; sent.react("1⃣").then(() => 
    sent.react("2⃣")).then(() => sent.react("3⃣")).then(() =>
    sent.react("4⃣")).then(() => sent.react("5⃣")).then(() => sent.react("6⃣")).then(() =>
    sent.react("7⃣")).then(() => sent.react("8⃣")).then(() => sent.react("9⃣")).catch(() => console.error('emoji failed to react.')); });*/

    checkStreamerNotificationRoles();
    startLiveCheck();
});

// eventually add option to add more youtube channels for notifications, view emote requests that were written to a file or a channel (if possible), could add option to create roles (won't though because it's easier to customize all aspects in discord)
// add check for if streamerList.txt file exists; if not, create empty .txt file named streamerList in same directory
/*async function botMenu() // add this when i get basic functionality to work first
{
  do
  {
    menuChoice = await menuCommands.printMenu();
    switch(menuChoice)
    {
      case '0':
        console.log('Printing contents of streamerList.txt: \n');
        menuCommands.printStreamers();
        break;
      case '1':
        console.log('Adding streamer to streamerList.txt: \n');
        const addStreamerUsername = await menuCommands.getStreamerUsername();
        menuCommands.addStreamer(addStreamerUsername);
        break;
      case '2': // if there are two duplicate usernames that were manually added to streamerList.txt, there will be an issue with 1 empty line left in the list
        console.log('Removing streamer from streamerList.txt: \n');
        const removeStreamerUsername = await menuCommands.getStreamerUsername();
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
      case '6':
        console.log('Post roles in #role channel. \n');
        // make command for posting roles
        break;
      default:
        console.log('Error: Invalid input. Enter a value from 0-5.\n');
        break;
    } 
  }
  while (menuChoice !== '5');
}*/

// https://nodejs.org/api/tty.html, https://gist.github.com/newvertex/d78b9c6050d6a8f830809e6e528d5e96, https://thisdavej.com/making-interactive-node-js-console-apps-that-listen-for-keypress-events/
/*function startBot()
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
}*/

const liveMemory = [];
const streamers = [];
readline.createInterface // https://stackoverflow.com/a/12299566 / https://stackoverflow.com/a/41407246 for text color reference
(
  {
    input: fs.createReadStream('./streamerList.txt'),
    terminal: false
  }
).on('line', function(line)
{
  streamers.push(line); // this pushes the streamer usernames from the .txt into streamers array
});

for (var cnt = 0; cnt < streamers.length; cnt++) // for loop creates a liveMemory variable for each streamer
{
  liveMemory[cnt] = false;
}

const roleMissing = [];
const roleFound = ['ekun7'];
function checkStreamerNotificationRoles()
{
  for (var cnt = 0; cnt < streamers.length; cnt++)
  {
    const roleID = currentGuild.roles.cache.find(role => role.name === `${streamers[cnt]} role`);
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
    var liveStorage = require('./commands/botMenu/checkForLiveStreams.js');

    for (var cnt = 0; cnt < streamers.length; cnt++)
    {
      await test456.Run(streamers[cnt], currentGuild, announceChannel, liveMemory[cnt]).then(() =>
      {
        liveMemory[cnt] = liveStorage.liveStorage;
      });
    }
  }, 30000); // increase this delay when everything works because if bitrate drops a lot for long enough, stream will "go offline" when it's not; maybe set to default hangtime duration for twitch disconnect protection
}

client.on('messageCreate', async(message) => 
{
  const args = message.content.slice(commandPrefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase(); 

  if (message.author.bot) 
  {
    return;
  }

  /*if (message.channel.name === "role") // just to make bot send message in channel to test reactions
  {
    message.channel.send('test').then(function(sentMessage) 
    {
      sentMessage.react('👍').then(() => sentMessage.react('👎')).catch(() => console.error('emoji failed to react.'));
    });
  }*/

  // make kick/ban use discord's built in kick()/ban() functions
  if (command === 'kick')
  {
    if (message.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS]))
    {
      const target = message.mentions.users.first();
      const reason = message.content.slice(command.length + 1).trim().split(/ +/g);
      if (target === undefined)
      {
        message.channel.send('Error: User not found or target was missing. Command format is !kick @<user> [optional reason].');
        return;
      }

      const memberID = message.guild.members.cache.get(target.id); 
      // Negative number if this role's position is lower (other role's is higher), positive number if this one is higher (other's is lower), 0 if equal
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