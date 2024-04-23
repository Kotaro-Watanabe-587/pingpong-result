export enum spinKind {
    t = 0,
    u = 1,
    s = 2,
    k = 3
}
  
export enum shotKind{
    D = 0,
    S = 1
}
  
export interface action {
    isFore: boolean; // フォアならtrue、バックならfalse
    isServiceMiss: boolean; // サービスミスならtrue、それ以外がfalse
    spinDirection: string;
    shotType: string;
}
  
export interface pointInfo {
    getMyPoint: boolean; // trueなら自得点、falseなら相手
    rallyCount: number; // ラリー数
    lastMyAction: action; // ラリー最後の自身の行動
}
  
export interface gameInfo {
    gamePointList: pointInfo[];
    gameCount: number; // ゲーム数(1～5)
    isServe: boolean; //サービス権持ってのスタートか。持っていたらtrue
}
  
export interface opponentInfo {
    racket: string; // シェークorペン
    fore: string; // フォアラバーの種類
    back: string; // バックラバーの種類
}
  
export interface matchInfo {
    id: number,
    date: Date,
    title: string,
    place: {
        name: string,
        latitude: number
        longitude: number,
    },
    opponent: opponentInfo,
    scoreList: string[],
    gameCount: number[],
    gameList: gameInfo[]
}
  
export interface summaryData {
    totalMatch: number;
    totalWinMatch: number;
    totalLoseMatch: number;
    PerOfWin: number;
    totalWinGame: number;
    totalLoseGame: number;
    totalRunsScored: number;
    totalRuns: number;
}
  
export interface getGameRatio {
    win: number;
    lose: number
}

export interface getGameRatioGraph {
    labels: string[];
    datasets: {
        label: string;
        data: any;
        subData: any
    }[]
}
  
export interface scoreKind {
    two: number;
    three: number;
    four: number;
    over: number  
}

export interface ScoreDifference {
    win: scoreKind;
    lose: scoreKind
}
  
export interface ScoreDifferenceGraph{
    labels: string[];
    datasets:{
        label:string;
        data: any;
    }[]
}
  
export interface rallyDataGraph{
    labels: string[];
    datasets:{
        label:string;
        data: any;
    }[]
}
  
export interface rallyScore {
    win:number;
    lose: number;
}
  
export interface rallyDistribution{
    '0': rallyScore;
    '1': rallyScore;
    '2': rallyScore;
    '3': rallyScore;
    '4': rallyScore;
    '5': rallyScore;
    '6': rallyScore;
    '7': rallyScore;
    '8': rallyScore;
    '9': rallyScore;
    '10': rallyScore;
    '11': rallyScore
}

export interface gameDetail {
    totalScore: number;
    serviceScore: number;
    recieveScore: number;
    serviceOpponentScore: number;
    recieveOpponentScore: number;
    maxPointDifference: number;
    maxReversed: number | null;
    scoreTransition: number[]
}

export interface matchDetail {
    myScore:{
        gameList: gameDetail[];
        totalDetail: gameDetail;
    },
    opponentScore:{
        gameList: gameDetail[];
        totalDetail: gameDetail;
    }

}

    //   試合全体、ゲーム毎の獲得ポイント、サービス時の獲得ポイント、サービス時の喪失ポイント、レシーブ時の喪失ポイント、最大リード点数、最大連続得点、最大逆転点差(セット獲得時のみ)
    //   ポイント獲得の折れ線グラフ