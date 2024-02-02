export const convertIsoDate = (isoDate: string) => {
    if (isoDate === "" || isoDate === undefined) {
        return undefined;
    }

    const currentDate = new Date();
    const targetDate = new Date(isoDate);
    targetDate.setDate(targetDate.getDate() + 1);

    const isSameDay = (date1: Date, date2: Date) =>
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();

    const isToday = (date: Date) => isSameDay(date, currentDate);
    const isYesterday = (date: Date) => isSameDay(date, getPreviousDay(currentDate));

    const getPreviousDay = (date: Date) => {
        const previousDay = new Date(date);
        previousDay.setDate(date.getDate() - 1);
        return previousDay;
    };

    if (isToday(targetDate)) {
        return "Today";
    } else if (isYesterday(targetDate)) {
        return "Yesterday";  
    } else {
        const timeDiff = Math.abs(currentDate.getTime() - targetDate.getTime());
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return `${daysDiff} days ago`;
    }
};

export const convertDurationToHours = (duration: string): number => {
    if (duration === "") {
        return 0;
    }

    const regex = /(\d+)\s*d\s*(\d+)\s*h\s*(\d+)\s*m\s*(\d+)\s*s/;
    const matches = duration.match(regex);

    if (matches) {
        const days = parseInt(matches[1]) || 0;
        const hours = parseInt(matches[2]) || 0;
        const minutes = parseInt(matches[3]) || 0;
        const seconds = parseInt(matches[4]) || 0;

        const totalHours = days * 24 + hours + minutes / 60 + seconds / 3600;

        // round the number to 2 decimal points
        return parseFloat(totalHours.toFixed(2));
    }

    return 0;
};
