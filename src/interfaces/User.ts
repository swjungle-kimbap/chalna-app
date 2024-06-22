// 내 프로필, 친구, 차단친구
// 익명친구의 인터페이스 활용여부
export type User = {
    id:string,
    name:string,
    statusMsg:string,
    status:number //이렇게쓰는게 맞나...? 친구, 차단친구, 인연, stranger 관계를 어떻게 받아오지..?
    //1 친구, 2차단, 3인연, 4 ...
};
