const fs = require("fs");
const chalk = require('chalk');
const Table = require('cli-table');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Read the contents of the file into an array
const lines = fs.readFileSync("time.txt", "utf-8").split("\n");

// Initialize arrays to store the door access and door swipe data
const doorAccess = [];
const doorSwipe = [];

// Loop through each line in the file and determine whether it should be stored in the doorAccess or doorSwipe array
for (let line of lines) {
  if (line.trim() === "") {
    continue;
  }
  if (line.length < 110) {
    doorAccess.push(line);
  } else {
    doorSwipe.push(line);
  }
}

// Print out the results
// console.log("Door access:");
// console.log(doorAccess);
// console.log("Door swipe:");
// console.log(doorSwipe);

const accessLogObjects = doorAccess.map((log) => {
  const [dateTimeString, action] = log.split(": Access granted to ");
  const [name, door] = action.split(" at ");
  const [guardFirstName, guardLastName] = name.split(" ");
  const [doorNumber, doorName] = door.split(" ");

  const [dateString, timeString] = dateTimeString.split(" ");
  const [day, month, year] = dateString.split("/");
  const [hour, minute, second] = timeString.split(":");

  const dateTime = new Date(year, month - 1, day, hour, minute, second);

  return {
    dateTime,
    guardFirstName,
    guardLastName,
    doorNumber,
    doorName,
  };
});

// console.log(accessLogObjects);


function parseDate(dateString) {
  const [datePart, timePart, period] = dateString.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');

  let parsedHour = parseInt(hour);
  if (period === 'PM' && parsedHour !== 12) {
    parsedHour += 12;
  } else if (period === 'AM' && parsedHour === 12) {
    parsedHour = 0;
  }

  return new Date(year, month - 1, day, parsedHour, minute, second);
}

const doorSwipesObjects = doorSwipe.map(entry => {
  const [timestamp, info] = entry.split(': Access denied to ');
  const [user, details] = info.split(' at ');
  const [location, reason] = details.split(". Reason: ");
  
  // Extract door number from location
  const doorNumber = parseInt(location.match(/\d+/)[0]);

  return {
    timestamp: parseDate(timestamp),
    user: user.trim(),
    location: location.trim(),
    doorNumber,
    reason: reason.trim(),
  };
});

// console.log(doorSwipesObjects);

  
  // Sort the data by date and time in ascending order
doorSwipesObjects.sort((a, b) => a.timestamp - b.timestamp);

// Display the data in a tabular format
// console.table(doorSwipesObjects);



// Generate a random light color
function randomLightColor() {
  const r = 230 + Math.floor(Math.random() * 25);
  const g = 230 + Math.floor(Math.random() * 25);
  const b = 230 + Math.floor(Math.random() * 25);
  return chalk.rgb(r, g, b);
}

// doorSwipesObjects.forEach(entry => {
//   if (prevHour !== entry.timestamp.getHours()) {
//     prevHour = entry.timestamp.getHours();
//     currentColor = randomLightColor();
//   }

//   const row = [
//     currentColor(entry.timestamp.toLocaleString()),
//     currentColor(entry.doorNumber),
//   ];
//   console.log(row.join('\t'));
// });

// Create the table header
const table = new Table({
  head: ['Date/Time', 'Door Number'],
  style: { head: ['cyan'] },
});

// Display the data in a tabular format with colors
let prevHour = -1;
let currentColor = randomLightColor();

doorSwipesObjects.forEach(entry => {
  if (prevHour !== entry.timestamp.getHours()) {
    if (prevHour !== -1) {
      table.push(['', '']); // Add a blank row between hours
    }
    prevHour = entry.timestamp.getHours();
    currentColor = randomLightColor();
  }

  table.push([
    currentColor(entry.timestamp.toLocaleString()),
    currentColor(entry.doorNumber),
  ]);
});

// console.log(table.toString());
// console.log(accessLogObjects);


// Write doorSwipesObjects to swipe.csv
// const swipeCsvWriter = createCsvWriter({
//   path: "swipe.csv",
//   header: [
//     { id: "timestamp", title: "Timestamp" },
//     { id: "user", title: "User" },
//     { id: "location", title: "Location" },
//     { id: "doorNumber", title: "Door Number" },
//     { id: "reason", title: "Reason" },
//   ],
// });

// swipeCsvWriter
//   .writeRecords(doorSwipesObjects)
//   .then(() => console.log("swipe.csv was written successfully"));

// // Write accessLogObjects to access.csv
// const accessCsvWriter = createCsvWriter({
//   path: "access.csv",
//   header: [
//     { id: "dateTime", title: "Date Time" },
//     { id: "guardFirstName", title: "Guard First Name" },
//     { id: "guardLastName", title: "Guard Last Name" },
//     { id: "doorNumber", title: "Door Number" },
//     { id: "doorName", title: "Door Name" },
//   ],
// });

// accessCsvWriter
//   .writeRecords(accessLogObjects)
//   .then(() => console.log("access.csv was written successfully"));