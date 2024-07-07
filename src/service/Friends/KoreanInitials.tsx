
export const getKoreanInitials = (input: string): string =>{
    const initials: string[] = [
        "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ",
        "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ",
        "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
    ];
    let result: string = "";

    for (let i = 0; i < input.length; i++) {
        const charCode: number = input.charCodeAt(i);
        if (charCode >= 0xAC00 && charCode <= 0xD7A3) {  // Range of Hangul characters
            const base: number = charCode - 0xAC00;
            result += initials[Math.floor(base / 588)];
        } else {
            result += input[i];
        }
    }

    return result;
}
