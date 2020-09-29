const UP_WEEK_DAY = ( new Date( 2020, 8, 28 ) ).getTime();

const TIMES = [
  "08:30 — 10:10",
  "10:10 — 11:40",
  "12:10 — 13:40",
  "14:10 — 15:40"
];

async function getSchedule( fetch: Function, groupId: number ): Promise<Schedule.Day[] | string>{
  const response: Response = await fetch( "http://raspmath.isu.ru/fillSchedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `groupId=${groupId}`
  } );

  if( !response.ok ){
    return `${response.status} ${response.statusText}`;
  }

  return await response.json();
}

function getWeek( date: Date ): string{
  let day = date.getDay();

  if( day === 0 ){
    day = 6;
  } else {
    day--;
  }

  date.setDate( date.getDate() - day );

  return ( Math.floor( ( date.getTime() - UP_WEEK_DAY ) / 1000 / 60 / 60 / 24 ) ) % 14 === 0 ? "верхняя" : "нижняя";
}

async function index( fetch: Function, groupId: number, day: string = "tomorrow" ): Promise<string>{
  let schedule = await getSchedule( fetch, groupId );

  if( typeof schedule === "string" ){
    return schedule;
  }

  const date = new Date();

  if( day === "tomorrow" ){
    date.setDate( date.getDate() + 1 );
  }

  const day_ = date.getDay();
  const week_ = getWeek( date );

  schedule = schedule
    .filter( ( { weekdayId, week } ) => weekdayId === day_ && ( week === "" || week === week_ ) )
    .sort( ( a, b ) => {
      if( a.timeId < b.timeId ) return -1;
      else if( a.timeId > b.timeId ) return 1;

      return 0;
    } );

  const result = schedule.reduce( ( res, { timeId, subjectName, firstname, lastname, className } ) => {
    if( res !== "" ) res += "\n\n";

    res += `[${TIMES[ timeId - 1 ]}]\nНазвание: <b>${subjectName}</b>\nПреподаватель: <i>${firstname} ${lastname}</i>\nАудитория: <i>${className}</i>`;

    return res;
  }, "" );

  return result;
}

export default index;