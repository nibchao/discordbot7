// https://discord.js.org/#/
const { Client, Intents, Message, Permissions, GuildEmojiRoleManager, MessageEmbed, Partials } = require("discord.js");
//const { token, clientID, guildID } = require("./credentials/discordCredentials.json"); // uncomment this when uploading to main bot
const { token, clientID, guildID } = require("./credentials/discordTestingBotCredentials.json"); // comment this when uploading to main bot

// https://www.npmjs.com/package/youtube-api
// const YoutubeApi = require('youtube-api');
// const youtubeCredentials = require(`./credentials/youtubeCredentials.json`);

var test456 = require('./commands/botMenu/checkForLiveStreams.js');

const fs = require('fs');
const readline = require('readline');

var menuCommands = require('./commands/botMenu/menuFunctions.js');
const { resolve } = require("path"); // somehow related to botmenu stuff?
const { memoryUsage } = require("process"); // somehow related to botmenu stuff?

const commandPrefix = '!';
const notificationRoleSuffix = 'role';

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

    //startBot();
    //botMenu();

    console.log('Checking streamerList.txt for any missing roles.');
    // checks if all roles in streamerList.txt exist, if not then creates
    // https://discord.js.org/#/docs/discord.js/stable/class/RoleManager?scrollTo=create
    var roleCheck, roleCheckCount = 0;
    for (var cnt = 0; cnt < streamers.length; cnt++)
    {
        roleCheck = currentGuild.roles.cache.find(role => role.name === `${streamers[cnt]} ${notificationRoleSuffix}`);
        if (roleCheck === undefined)
        {
          console.log(`${streamers[cnt]} ${notificationRoleSuffix} was missing, creating a Discord role for ${streamers[cnt]}.`);
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

    if (roleCheckCount == streamers.length)
    {
      console.log('No streamerList.txt roles were missing.');
    }

    // https://discordjs.guide/popular-topics/reactions.html#removing-reactions
    // https://github.com/discord/discord-api-docs/issues/2723#issuecomment-807022205
    // 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣ 9⃣
    // https://stackoverflow.com/questions/65968094/get-last-message-from-text-channel-with-discord-js make below run only if most recent X messages don't contain "twitch notification roles"
    /*var roleChannel = currentGuild.channels.cache.find(channel => channel.name === 'bot');
    roleChannel.send(`**Twitch Notification Roles**\n 1⃣ ${streamersNoMarkDown[0]} ${notificationRoleSuffix} 
    \n 2⃣ ${streamersNoMarkDown[1]} ${notificationRoleSuffix} 
    \n 3⃣ ${streamersNoMarkDown[2]} ${notificationRoleSuffix} 
    \n 4⃣ ${streamersNoMarkDown[3]} ${notificationRoleSuffix}
    \n 5⃣ ${streamersNoMarkDown[4]} ${notificationRoleSuffix}`).then(sent => { roleMessageID = sent.id; sent.react("1⃣").then(() => 
    sent.react("2⃣")).then(() => sent.react("3⃣")).then(() =>
    sent.react("4⃣")).then(() => sent.react("5⃣")).catch(() => console.error('emoji failed to react.')); });*/

    //checkStreamerNotificationRoles();
    //startLiveCheck();
});

// add option to: add youtube channels for notifications, view emote requests written to a file/channel, create twitch notification roles
// check for if streamerList.txt file exists; if not, say that streamerList.txt must be created in same directory; maybe edit menu to display twitch notification option only if streamerList.txt exists
async function botMenu()
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

const liveMemory = [];
const streamers = [];
const streamersNoMarkDown = [];
readline.createInterface // https://stackoverflow.com/a/12299566 / https://stackoverflow.com/a/41407246 for text color reference
(
  {
    input: fs.createReadStream('./streamerList.txt'),
    terminal: false
  }
).on('line', function(line)
{
  // const noDiscordMarkdownUsername = displayName.replaceAll('_', '*_*');
  var x = line.replaceAll('_',  '*_*');
  streamersNoMarkDown.push(x);
  streamers.push(line); // this pushes the streamer usernames from the .txt into streamers array
});

for (var cnt = 0; cnt < streamers.length; cnt++) // for loop creates a liveMemory variable for each streamer
{
  liveMemory[cnt] = false;
}

const roleMissing = [];
const roleFound = ['ekun7']; // hardcoded to include my username by default
function checkStreamerNotificationRoles()
{
  for (var cnt = 0; cnt < streamers.length; cnt++)
  {
    const roleID = currentGuild.roles.cache.find(role => role.name === `${streamers[cnt]} ${notificationRoleSuffix}`);
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

  const target = message.mentions.users.first();
  const reason = message.content.slice(command.length + 1).trim().split(/ +/g);
  // make kick/ban use discord's built in kick()/ban() functions
  if (command === 'kick')
  {
    if (message.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS]))
    {
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
  else if (command === 'ban')
  {
    if (message.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]))
    {
      if (target === undefined)
      {
        message.channel.send('Error: User not found or target was missing. Command format is !ban @<user> [optional reason].');
        return;
      }
      const memberID = message.guild.members.cache.get(target.id); 
      // Negative number if this role's position is lower (other role's is higher), positive number if this one is higher (other's is lower), 0 if equal
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
    {
        return;
    }
    const mem = reaction.message.guild.members.cache.find(mem => mem.id === user.id);
    const memberUsername = mem.displayName;
    var role;
    // need a way to catch error if role name doesn't exist; try-catch block doesn't work or what i tried before didn't work because TypeError gets thrown if role name doesn't exist
    // 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣ 9⃣
    if (reaction.emoji.name === "1⃣") // if '1' reaction
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[0]} ${notificationRoleSuffix}`);
    }
    else if (reaction.emoji.name == "2⃣") // if '2' reaction
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[1]} ${notificationRoleSuffix}`);
    }
    else if (reaction.emoji.name == "3⃣") // if '3' reaction
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[2]} ${notificationRoleSuffix}`);
    }
    else if (reaction.emoji.name == "4⃣") // if '4' reaction
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[3]} ${notificationRoleSuffix}`);
    }
    else if (reaction.emoji.name == "5⃣") // if '5' reaction
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[4]} ${notificationRoleSuffix}`);
    }
    else
    {
      console.log(`${memberUsername} tried to add a role, but a role was missing for the emoji reaction(s).`);
      return;
    }
    var roleName = role.name;
    console.log(`${memberUsername} added "${roleName}" role.`);
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
    const memberUsername = mem.displayName;
    var role;
    // need a way to catch error if role name doesn't exist; try-catch block doesn't work or what i tried before didn't work because TypeError gets thrown if role name doesn't exist
    // 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣ 9⃣
    if (reaction.emoji.name === "1⃣") // if '1' reaction
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[0]} ${notificationRoleSuffix}`);
    }
    else if (reaction.emoji.name == "2⃣") // if '2' reaction
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[1]} ${notificationRoleSuffix}`);
    }
    else if (reaction.emoji.name == "3⃣") // if '3' reaction
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[2]} ${notificationRoleSuffix}`);
    }
    else if (reaction.emoji.name == "4⃣") // if '4' reaction
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[3]} ${notificationRoleSuffix}`);
    }
    else if (reaction.emoji.name == "5⃣") // if '5' reaction
    {
      role = reaction.message.guild.roles.cache.find(role => role.name === `${streamers[4]} ${notificationRoleSuffix}`);
    }
    else
    {
      console.log(`${memberUsername} tried to remove a role, but a role was missing for the emoji reaction(s).`);
      return;
    }
    var roleName = role.name;
    console.log(`${memberUsername} removed "${roleName}" role.`);
    mem.roles.remove(role);
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