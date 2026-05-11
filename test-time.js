function pad2(num) { return num.toString().padStart(2, "0"); }

function getPeriodIds(now, type) {
    const year = now.getFullYear();
    const month = pad2(now.getMonth() + 1);
    const day = pad2(now.getDate());
    const hour = pad2(now.getHours());
    
    let interval = 1;
    if (type === '3m') interval = 3;
    if (type === '5m') interval = 5;
    
    const minutes = Math.floor(now.getMinutes() / interval) * interval;
    const minStr = pad2(minutes);
    
    // next period
    const nextDate = new Date(now.getTime());
    nextDate.setMinutes(minutes + interval);
    
    const nYear = nextDate.getFullYear();
    const nMonth = pad2(nextDate.getMonth() + 1);
    const nDay = pad2(nextDate.getDate());
    const nHour = pad2(nextDate.getHours());
    const nMinStr = pad2(nextDate.getMinutes());
    
    const curr = `${type}-${year}${month}${day}-${hour}${minStr}`;
    const next = `${type}-${nYear}${nMonth}${nDay}-${nHour}${nMinStr}`;
    
    return { curr, next };
}

const now = new Date();
console.log(getPeriodIds(now, '1m'));
console.log(getPeriodIds(now, '3m'));
console.log(getPeriodIds(now, '5m'));
