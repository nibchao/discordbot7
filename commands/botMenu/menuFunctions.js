const fs = require('fs');
const readline = require('readline');

// https://nodejs.org/api/fs.html#fsreadfilesyncpath-options
module.exports.printMenu = function printMenu()
{
  return new Promise(resolve => 
  {
    const rl = readline.createInterface
    (
      {
        input: process.stdin,
        output: process.stdout
      }
    );
    console.table([{Option: 'Print streamer list', Description: 'Prints out contents of streamerList.txt'}, 
    {Option: 'Add streamer', Description: 'Adds a streamer to streamerList.txt'},
    {Option: 'Remove streamer', Description: 'Removes a streamer from streamerList.txt'},
    {Option: 'Start Bot', Description: 'Enables all bot functionality'},
    {Option: 'Stop Bot', Description: 'Disables all bot functionality'},
    {Option: 'Quit program', Description: 'Ends the program'}]);
    rl.question('Enter your choice: ', (menuChoice) =>
    {
      resolve(menuChoice);
      rl.close();
      rl.removeAllListeners();
    })
  });
}

module.exports.printStreamers = function printStreamers()
{
  const streamerListContents = fs.readFileSync('./streamerList.txt', {encoding:'utf8'});
  console.log(streamerListContents + '\n');
}

// https://stackoverflow.com/q/6623231
module.exports.getStreamerUsername = function getStreamerUsername()
{
  return new Promise(resolve => 
  {
    const rl = readline.createInterface
    (
      {
        input: process.stdin,
        output: process.stdout
      }
    );
    rl.question('Enter streamer username: ', (streamerToAdd) =>
    {
      resolve(streamerToAdd.replace(/\s/g, ""));
      rl.close();
      rl.removeAllListeners();
    })
  });
}

// https://stackoverflow.com/q/17449133, https://nodejs.org/api/fs.html#fsappendfilesyncpath-data-options
// could add checks for invalid input like illegal characters/non-existent streamers
module.exports.addStreamer = function addStreamer(streamerUsername)
{
  const test = fs.readFileSync('./streamerList.txt', 'utf8');
  if (test.includes(`${streamerUsername}`))
  {
    console.log(`${streamerUsername} is already in streamerList.txt`);
  }
  else
  {
    fs.appendFileSync('./streamerList.txt', `\n${streamerUsername}`, {encoding:'utf8'});
    console.log(`${streamerUsername} has been added to streamerList.txt`);
  }
}

// https://stackoverflow.com/q/14177087, https://stackoverflow.com/q/67512837, https://stackoverflow.com/a/50828436
module.exports.removeStreamer = function removeStreamer(streamerUsername)
{
  const test = fs.readFileSync('./streamerList.txt', 'utf8');
  const x = new RegExp(`\\b${streamerUsername}\\b`, 'gi');
  const y = test.replace(x, '');
  fs.writeFile('./streamerList.txt', y, 'utf8', function (error)
  {
    if (error)
    {
      return console.log(error);
    }
    else
    {
      removeBlankLines();
    }
  });
}

function removeBlankLines()
{
  const test = fs.readFileSync('./streamerList.txt', 'utf8');
  const result = test.replace(/\n{1,}/g, '\n');
  fs.writeFile('./streamerList.txt', result, 'utf8', function (error)
  {
    if (error)
    {
      return console.log(error);
    }
  });
}