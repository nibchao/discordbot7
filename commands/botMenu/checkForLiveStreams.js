// https://www.npmjs.com/package/node-twitch
const TwitchApi = require('node-twitch').default;
const twitchCredentials = require('../../credentials/twitchCredentials.json');

const twitch = new TwitchApi
({
  client_id: twitchCredentials.client_id, 
  client_secret: twitchCredentials.client_secret
});

const announceLiveNotification = require('./streamLiveNotificationAnnounce.js');

// https://stackoverflow.com/a/41407246 for text color reference
async function Run(streamerUsername, currentGuild, announceChannel, liveMemory)
{
  await twitch.getStreams({user_login: streamerUsername}).then(async data => 
    {
      let r = data.data[0];

      if (r !== undefined)
      {
        if (r.type === 'live')
        {
          if (liveMemory === false || liveMemory === undefined)
          {
            announceLiveNotification(streamerUsername, currentGuild, announceChannel, liveMemory);
            liveMemory = true;
          }
          else
          {
            //console.log(`${streamerUsername} still live`);
          }
        }
        else
        {
          if (liveMemory === true)
          {
            liveMemory = false;
            console.log(`@@@ ${streamerUsername} has gone ` + '\x1b[35m%s\x1b[0m', 'offline\x1b[0m' + '. @@@');
          }
        }
      }
      else
      {
        if (liveMemory === true)
        {
          liveMemory = false;
          console.log(`@@@ ${streamerUsername} has gone ` + '\x1b[35m%s\x1b[0m', 'offline\x1b[0m' + '. @@@');
        }        
        else
        {
          //console.log(`${streamerUsername} still offline`);
        }
      }
      module.exports.liveStorage = liveMemory;
    })
};

module.exports.Run = Run;