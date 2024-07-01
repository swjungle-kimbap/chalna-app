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
