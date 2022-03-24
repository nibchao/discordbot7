// https://www.npmjs.com/package/node-twitch
const TwitchApi = require('node-twitch').default;
const twitchCredentials = require('../../credentials/twitchCredentials.json');
//const twitchCredentials = require('../../credentials/twitchTestingBotCredentials.json');

const twitch = new TwitchApi
({
    client_id: twitchCredentials.client_id, 
    client_secret: twitchCredentials.client_secret
});

// https://stackoverflow.com/a/41407246 for text color reference
// 3 edge cases: streamer with no stream info (1), streamer with only title info (2), streamer with only game info (3) 
module.exports = async function streamLiveNotificationAnnounce(streamerUsername, currentGuild, announceChannel, liveMemory)
{
    let stream = await twitch.getStreams({user_login: streamerUsername});

    let streamData = stream.data[0];

    if (liveMemory === true)
    {
        return;
    }

    // (1) Edge Case - First stream + no stream information set so streamData is initially undefined; not sure how to handle, but at the moment i think this is the only case that could cause an infinite loop
    // this shouldn't result in an infinite loop for 99% of cases since streamLiveNotificationAnnounce() will only get called in checkForLiveStreams.js if the streamer has type = "live", so 'stream' can never equal null/undefined except for when the await doesn't work
    if (streamData === undefined) 
    {
        return streamLiveNotificationAnnounce(streamerUsername, currentGuild, announceChannel, liveMemory); 
    }

    console.log(`=== ${streamerUsername} is ` + '\x1b[32m%s\x1b[0m', 'online\x1b[0m' + '! ===');

    // (2) Edge Case
    if (streamData.title === undefined || streamData.title === '') 
    { 
        streamTitle = 'Undefined title'
    } 
    else 
    { 
        streamTitle = streamData.title 
    }
    let userName = streamData.user_name;

    let streamThumbnail = streamData.thumbnail_url;
    let widthReplace = streamThumbnail.replace(/{width}/i, '1920');
    let heightReplace = widthReplace.replace(/{height}/i, '1080');

    let currentUnixTime = Date.now();
    let uniqueThumbnail = heightReplace + `?time=${currentUnixTime}`; // appending unix time forces Discord to post a new thumbnail instead of using previously cached one

    let gameID = streamData.game_id; 

    let game = await twitch.getGames(gameID);
    let gameData = game.data[0];

    // (3) Edge Case
    if (gameData === undefined)
    {
        gameName = 'Undefined game'
    }
    else 
    { 
        gameName = gameData.name;
    }

    let viewerCount = streamData.viewer_count;

    let user = await twitch.getUsers(streamerUsername);
    let userData = user.data[0];
    let profilePicture = userData.profile_image_url;
    let displayName = userData.display_name;

    let liveNotificationEmbed = 
    {
        color: 0x6441A4, // sets embed sidebar color 
        title: streamTitle,
        url: `https://www.twitch.tv/${streamerUsername}/`,
        author: 
        {
            name: userName,
            icon_url: profilePicture,
            url: `https://www.twitch.tv/${streamerUsername}/`,
        },  
        thumbnail: 
        {
            url: profilePicture,
        },
        fields: 
        [
            {
                name: 'Game',
                value: gameName,
                inline: true,
            },
            {
                name: 'Viewers',
                value: `${viewerCount}`,
                inline: true,
            },
        ],
        image: 
        {
            url: uniqueThumbnail,
        }
    };
    let noDiscordMarkdownUsername = '';
    noDiscordMarkdownUsername = displayName.replaceAll('_', '*_*');
    if (streamerUsername === 'ekun7')
    {
        announceChannel.send({content:`Hey @everyone ${noDiscordMarkdownUsername} is now live! https://www.twitch.tv/${streamerUsername}/`, embeds: [liveNotificationEmbed]}); 
    }
    else
    {
        let roleID = '';
        roleID = currentGuild.roles.cache.find(role => role.name === `${streamerUsername} role`);
        if (roleID === undefined)
        {
            return;
        }
        announceChannel.send({content:`Hey ${roleID} ${noDiscordMarkdownUsername} is now live! https://www.twitch.tv/${streamerUsername}/`, embeds: [liveNotificationEmbed]}); 
    }
};