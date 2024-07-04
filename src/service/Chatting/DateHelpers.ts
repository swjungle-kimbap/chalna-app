// 날짜표기 후순위
// export const isSameDay = (date1: Date, date2: Date) => {
//     return (
//         date1.getFullYear() === date2.getFullYear() &&
//         date1.getMonth() === date2.getMonth() &&
//         date1.getDate() === date2.getDate()
//     );
// };

export const formatDateToKoreanTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Seoul'
    };
    const formatter = new Intl.DateTimeFormat('ko-KR', options);
    return formatter.format(date);
};

