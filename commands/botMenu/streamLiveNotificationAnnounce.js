const TwitchApi = require('node-twitch').default;
const twitchCredentials = require('../../credentials/twitchCredentials.json');

const twitch = new TwitchApi
({
    client_id: twitchCredentials.client_id, 
    client_secret: twitchCredentials.client_secret
});

// https://stackoverflow.com/a/41407246 for text color reference
// 3 edge cases: streamer with no stream info (1), streamer with only title info (2), streamer with only game info (3) 
module.exports = async function streamLiveNotificationAnnounce(streamerUsername, currentGuild, announceChannel, liveMemory)
{
    const stream = await twitch.getStreams({user_login: streamerUsername});

    const streamData = stream.data[0];

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
    const userName = streamData.user_name;

    const streamThumbnail = streamData.thumbnail_url;
    const widthReplace = streamThumbnail.replace(/{width}/i, '1920');
    const heightReplace = widthReplace.replace(/{height}/i, '1080');

    const currentUnixTime = Date.now();
    const uniqueThumbnail = heightReplace + `?time=${currentUnixTime}`; 
    // since discord was caching the same thumbnail image after obtaining the stream thumbnail once, the same image was used for any live announcements 
    // appending unix time at the end will force discord to cache a new thumbnail image for stream thumbnails

    const gameID = streamData.game_id; 

    const game = await twitch.getGames(gameID);
    const gameData = game.data[0];

    // (3) Edge Case
    if (gameData === undefined)
    {
        gameName = 'Undefined game'
    }
    else 
    { 
        gameName = gameData.name;
    }

    const viewerCount = streamData.viewer_count;

    const user = await twitch.getUsers(streamerUsername);
    const userData = user.data[0];
    const profilePicture = userData.profile_image_url;
    const displayName = userData.display_name;

    const liveNotificationEmbed = 
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
            url: uniqueThumbnail, // get stream thumbnail
        }
    };
    const noDiscordMarkdownUsername = displayName.replaceAll('_', '*_*');
    if (streamerUsername === 'ekun7')
    {
        announceChannel.send({content:`Hey @everyone ${noDiscordMarkdownUsername} is now live! https://www.twitch.tv/${streamerUsername}/`, embeds: [liveNotificationEmbed]}); 
    }
    else
    {
        const roleID = currentGuild.roles.cache.find(role => role.name === `${streamerUsername} role`);
        if (roleID === undefined)
        {
            return;
        }
        announceChannel.send({content:`Hey ${roleID} ${noDiscordMarkdownUsername} is now live! https://www.twitch.tv/${streamerUsername}/`, embeds: [liveNotificationEmbed]}); 
    }
};