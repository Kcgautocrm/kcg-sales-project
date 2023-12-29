const convertMinutes = (minutes) => {
  if (minutes === null || minutes === 0 || isNaN(minutes)) return "----";
  let h = Math.trunc(minutes / 60);
  let m = minutes % 60;

  let hDisplay = h > 0 ? h + (h === 1 ? " Hour " : " Hours ") : "";
  let mDisplay = m > 0 ? m + (m === 1 ? " Minute " : " Minutes ") : "";

  return hDisplay + mDisplay;
}

export default convertMinutes;


export function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + (minutes > 1 ? " minutes" : " minute");
}

export function getTimeElapsed(millis){
  let currentTime = new Date().getTime();
  let timeElapsedInMillis = currentTime - millis;
  return millisToMinutesAndSeconds(timeElapsedInMillis);
}

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

export function convertMsToHM(milliseconds) {
  if(milliseconds < 0){
    milliseconds = milliseconds * -1
  }
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  seconds = seconds % 60;
  minutes = seconds >= 30 ? minutes + 1 : minutes;
  minutes = minutes % 60;
  hours = hours % 24;
  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
}

export function formatAMPM (date){
  let hours = new Date(date).getHours();
  let minutes = new Date(date).getMinutes();    
  const ampm = hours >= 12 ? 'pm' : 'am';

  hours %= 12;
  hours = hours || 12;    
  minutes = minutes < 10 ? `0${minutes}` : minutes;

  const strTime = `${hours}:${minutes} ${ampm}`;

  return strTime;
};