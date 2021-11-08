function padZero(num) {
  return (num < 10 ? "0" : "") + num;
}

export function getTime() {
  let now = new Date();
  let yyyy = now.getFullYear();
  let MM = padZero(now.getMonth() + 1);
  let dd = padZero(now.getDate());
  let HH = padZero(now.getHours());
  let mm = padZero(now.getMinutes());
  let ss = padZero(now.getSeconds());

  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
}
