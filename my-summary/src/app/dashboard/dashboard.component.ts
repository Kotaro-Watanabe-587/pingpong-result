import { Component, OnInit } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { AppComponent } from '../app.component';
import { DataService } from '../../../service/data.service';
import * as _ from 'lodash';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { DatePipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';

// import { readdirSync } from 'node:fs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AppComponent, CardModule, TableModule, ChartModule,
    DatePipe, DecimalPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  gameList: string[] = [];
  Papa: Papa;
  isDispResult: boolean = false;

  matchInfoList: matchInfo[] = [{
    date: new Date(),
    title: '',
    opponent: {
      racket: '',
      fore: '',
      back: ''
    },
    scoreList:[],
    gameCount: [0,0],
    gameList: []
  }]

  displayData: summaryData = {
    totalMatch: 0,
    totalWinMatch: 0,
    totalLoseMatch: 0,
    PerOfWin: 0,
    totalWinGame: 0,
    totalLoseGame: 0,
    totalRunsScored: 0,
    totalRuns: 0
  }
  displayDataAry: summaryData[] = [];

  dispGameRatio: getGameRatio[] = [
    {win:0,lose:0},
    {win:0,lose:0},
    {win:0,lose:0},
    {win:0,lose:0},
    {win:0,lose:0}
  ]
  dispGameRatioGraph: getGameRatioGraph = {
    labels:[],
    datasets:[
      {
        label: '',
        data: undefined
      }
    ]
  }

  dispScoreDifference: ScoreDifference = {
    win:{
      two: 0,
      three: 0,
      four: 0,
      over: 0
    },
    lose:{
      two: 0,
      three: 0,
      four: 0,
      over: 0
    },
  }

  dispScoreDifferenceWinGraph:ScoreDifferenceGraph = {
    labels:[],
    datasets:[
      {
        label: '',
        data: undefined
      }
    ]
  }
  dispScoreDifferenceLoseGraph:ScoreDifferenceGraph = {
    labels:[],
    datasets:[
      {
        label: '',
        data: undefined
      }
    ]
  }

  rallyDataRador: rallyDataGraph = {
    labels: [],
    datasets:[
      {
        label:'',
        data: undefined
      }
    ]
  }

  totalServeScore: number = 0;
  totalReceiveScore: number = 0;
  numOfTotalRally: number = 0;
  servicePoint: {win:number; lose: number} = {win:0, lose: 0};
  receivePoint: {win:number; lose: number} = {win:0, lose: 0};

  pointDistribution: rallyScore[] = [
    {win:0, lose:0},
    {win:0, lose:0},
    {win:0, lose:0},
    {win:0, lose:0},
    {win:0, lose:0},
    {win:0, lose:0},
    {win:0, lose:0},
    {win:0, lose:0},
    {win:0, lose:0},
    {win:0, lose:0},
    {win:0, lose:0},
    {win:0, lose:0},
  ]

  readonly seekBaseDir = "../assets/csv";
  // readonly files = readdirSync(this.seekBaseDir);

  readonly gameRatioChartOption = { 
    indexAxis: 'y',
    scales: {
      x: {
        stacked: true,
        
      },
      y: {
        stacked: true
      },
      yAxes:{
        display: false
      }
    },
    plugins:{
      title:{
        display: true,
        text: 'ゲーム毎の勝敗比率',
        font: {size: 20}
      }
    }
  }

  readonly scoreDiffWinChartOption = {
    plugins:{
      title:{
        display: true,
        text: '勝ちゲーム点差',
        font: {size: 20}
      }
    }
  }
  readonly scoreDiffLoseChartOption = {
    plugins:{
      title:{
        display: true,
        text: '負けゲーム点差',
        font: {size: 20}
      }
    }
  }

  constructor(private papa: Papa, private dataService: DataService){
    this.Papa = papa
  }

  ngOnInit(): void {
    this.downloadCSV();
  }

  downloadCSV(){
    // TODO: ディレクトリ指定でファイル取得したい
    const fileDirList = [
      'https://kotaro-watanabe-587.github.io/pingpong-result/assets/csvList/game1.csv',
      'https://kotaro-watanabe-587.github.io/pingpong-result/assets/csvList/game2.csv',
      'https://kotaro-watanabe-587.github.io/pingpong-result/assets/csvList/game3.csv',
      'https://kotaro-watanabe-587.github.io/pingpong-result/assets/csvList/game4.csv',
      'https://kotaro-watanabe-587.github.io/pingpong-result/assets/csvList/game5.csv',
      'https://kotaro-watanabe-587.github.io/pingpong-result/assets/csvList/game6.csv',
    ]

    for(const fileDir of fileDirList){
      let tmpMatchInfo: matchInfo = {
        date: new Date(),
        title: '',
        opponent: {
          racket: '',
          fore: '',
          back: ''
        },
        scoreList: [],
        gameCount: [0,0],
        gameList: []
      }
      let tmpGameInfo: gameInfo = {
        gamePointList: [],
        gameCount: 0,
        isServe: false
      };
      let tmpPointInfo: pointInfo;
      let tmpAction: action;
      let makingInfo = false;
      this.papa.parse(fileDir,  {
        newline: '\n',
        delimiter: ',',
        step: (row,i) => {
          console.log(row)
          if(row.data[0] === 'date'){
            const year = row.data[1].slice(0,4)
            const month = row.data[1].slice(4,6)
            const date = row.data[1].slice(6,8)
            console.log(year, month, date)
            tmpMatchInfo.date = new Date(Number(year), Number(month)-1, date)
          }else if(row.data[0] === 'opponent'){
            tmpMatchInfo.opponent = {
              racket: row.data[1],
              fore: row.data[2],
              back: row.data[3]
            }
          }else if(row.data[0] === 'title'){
            tmpMatchInfo.title = row.data[1];
          }else if(row.data[0] === 'game'){
            tmpGameInfo.gameCount = Number(row.data[1]);
            makingInfo = true;
          }else if(makingInfo){
            if(row.data[0] === 'R' || row.data[0] === 'S'){
              tmpGameInfo.isServe = row.data[0] === 'S';
              if(tmpGameInfo.gamePointList.length === 0){
                tmpGameInfo.gamePointList = new Array(row.data.length)
              }
              const scoreList: string[] = row.data.slice(2)
              const isMyPoint = row.data[1] === '自分';
              scoreList.forEach((v,i) => {
                if(v.length > 0){
                  tmpGameInfo.gamePointList[i] = {
                    getMyPoint: isMyPoint,
                    rallyCount: Number(v),
                    lastMyAction: {
                      isFore: true,
                      isServiceMiss: false,
                      spinDirection: v[1],
                      shotType: v[2]
                    }
                  }
                }              
              });
            }else if(row.data[0] === 'Action'){
              const actionList:string[] = row.data.slice(2)
              actionList.forEach((v,i) => {
                if(v.length > 0){
                  if(v === 'Sm'){
                    tmpGameInfo.gamePointList[i].lastMyAction.isServiceMiss = true;
                  }else{
                    const val = v.split('')
                    tmpGameInfo.gamePointList[i].lastMyAction = {
                      isFore: val[0] === 'F',
                      isServiceMiss: false,
                      spinDirection: v[1],
                      shotType: v[2]
                    }
                  }
                }
              })
            }else if(row.data[0] === 'Score'){
              console.log(row.data)
              const ScoreList = row.data.filter(Boolean);
              tmpMatchInfo.scoreList.push(ScoreList[ScoreList.length-1])
            }else if(row.data[0] === ''){
              const pushData = Object.assign(tmpGameInfo)
              tmpMatchInfo.gameList.push(pushData)
              tmpGameInfo = {
                gamePointList: [],
                gameCount: 0,
                isServe: false,
              }
              makingInfo = false;
            }
          }
        },
        download: true,
        complete: () =>{
          // gameCountを設定する
          const lastScore = tmpMatchInfo.scoreList[tmpMatchInfo.scoreList.length-1];
          const myScore = Number(lastScore.split('-')[0]);
          const opponentScore = Number(lastScore.split('-')[1]);
          const winGameCount = 3;
          const loseGameCount = tmpMatchInfo.scoreList.length - winGameCount;

          tmpMatchInfo.gameCount = myScore < opponentScore ? [loseGameCount, winGameCount] : [winGameCount, loseGameCount];

          const pushMatchData = Object.assign(tmpMatchInfo)
          this.matchInfoList.push(pushMatchData)
          this.dataService.subject.next(this.matchInfoList)
        }
      })
    }
  }

  setDisplayData(){
    this.displayData = {
      totalMatch: 0,
      totalWinMatch: 0,
      totalLoseMatch: 0,
      PerOfWin: 0,
      totalWinGame: 0,
      totalLoseGame: 0,
      totalRunsScored: 0,
      totalRuns: 0
    }
    this.matchInfoList = this.matchInfoList.filter(v => v.gameList.length > 0)
    // 表示するデータその1
    //　試合数、勝ち数、負け数、勝率、獲得ゲーム数、喪失ゲーム数、獲得ポイント、喪失ポイント
    this.displayData.totalMatch = this.matchInfoList.length;
    this.matchInfoList.forEach(v => {
      // 勝ち負けの数取得
      // 最終ゲームの最後の得点見れば勝ち負けはわかる
      if(v.gameList.length > 0){
        // gamePointListの不要な要素削除 本来は別でやりたい
        v.gameList[v.gameList.length-1].gamePointList = v.gameList[v.gameList.length-1].gamePointList.filter(Boolean)
        v.gameList[v.gameList.length-1].gamePointList[v.gameList[v.gameList.length-1].gamePointList.length-1].getMyPoint ? this.displayData.totalWinMatch ++ : this.displayData.totalLoseMatch ++  
        // 獲得ゲーム数、喪失ゲーム取得
        // 各ゲームの最終得点を見れば取得喪失はわかる
        v.gameList.forEach(val => {
          // gamePointListの不要な要素削除 本来は別でやりたい
          val.gamePointList = val.gamePointList.filter(Boolean)
          if(val.gamePointList[val.gamePointList.length-1].getMyPoint){
            this.displayData.totalWinGame++;
            this.dispGameRatio[val.gameCount-1].win++;
            if(val.gamePointList.length >= 22){
              this.dispScoreDifference.win.two++;           
            }else{
              if(val.gamePointList.length - 11 === 2){
                this.dispScoreDifference.win.two++
              }else if(val.gamePointList.length - 11 === 3){
                this.dispScoreDifference.win.three++
              }else if(val.gamePointList.length - 11 === 4){
                this.dispScoreDifference.win.four++
              }else{
                this.dispScoreDifference.win.over++
              }
            }
          }else{
            this.displayData.totalLoseGame++;
            this.dispGameRatio[val.gameCount-1].lose++;
            if(val.gamePointList.length >= 22){
              this.dispScoreDifference.lose.two++;           
            }else{
              if(val.gamePointList.length - 11 === 2){
                this.dispScoreDifference.lose.two++
              }else if(val.gamePointList.length - 11 === 3){
                this.dispScoreDifference.lose.three++
              }else if(val.gamePointList.length - 11 === 4){
                this.dispScoreDifference.lose.four++
              }else{
                this.dispScoreDifference.lose.over++
              }
            }
          }
          val.gamePointList.forEach((value,i) =>{
            this.numOfTotalRally += value.rallyCount
            if(value.getMyPoint){
              this.displayData.totalRunsScored++
              // shotTypeがSの場合サービスエース、rallyCountが2で得点の場合はレシーブによる得点
              if(val.gamePointList[val.gamePointList.length-1].lastMyAction.shotType === 'S'){
                this.totalServeScore++;
              }else if(val.gamePointList[val.gamePointList.length-1].rallyCount === 2){
                this.totalReceiveScore++
              }
            }else{
              this.displayData.totalRuns++;
            }
            //サービス権持ってスタートで合計点を4で割った値が0か1なら自サービス
            if(val.isServe){
              if(i<20){
                if(i%4===0 || i%4===1){
                  if(value.getMyPoint){
                    this.servicePoint.win++;
                  }else{
                    this.servicePoint.lose++
                  }
                }else{
                  if(value.getMyPoint){
                    this.receivePoint.win++
                  }else{
                    this.receivePoint.lose++;
                  }
                }
              }else{
                // 合計得点が21を超える場合デュースのため偶数得点なら自サービス、奇数得点なら相手相手サービス
                if(i%2===0){
                  if(value.getMyPoint){
                    this.servicePoint.win++;
                  }else{
                    this.servicePoint.lose++;
                  }
                }else{
                  if(value.getMyPoint){
                    this.receivePoint.win++;
                  }else{
                    this.receivePoint.lose++;
                  }
                }
              }
            }else{
              // レシーブスタートのなのでサービス権持ってスタートとはサービスとレシーブが逆
              if(i<20){
                if(i%4===0 || i%4===1){
                  if(value.getMyPoint){
                    this.receivePoint.win++;
                  }else{
                    this.receivePoint.lose++;
                  }
                }else{
                  if(value.getMyPoint){
                    this.servicePoint.win++;
                  }else{
                    this.servicePoint.lose++;
                  }
                }
              }else{
                // 合計得点が21を超える場合デュースのため偶数得点なら自サービス、奇数得点なら相手相手サービス
                if(i%2===0){
                  if(value.getMyPoint){
                    this.receivePoint.win++;
                  }else{
                    this.receivePoint.lose++;
                  }
                }else{
                  if(value.getMyPoint){
                    this.servicePoint.win++;
                  }else{
                    this.servicePoint.lose++;
                  }
                }
              }
            }
          })
        })
      }
    })
    // 勝率は勝ち数 / 試合数で計算
    this.displayData.PerOfWin = this.displayData.totalMatch !== 0 ? this.displayData.totalWinMatch * 100 / this.displayData.totalMatch : 0;
    this.displayDataAry[0] = this.displayData;
    this.dispGameRatioGraph = {
        labels: ['第一ゲーム', '第二ゲーム', '第三ゲーム', '第四ゲーム', '第五ゲーム'],
        datasets:[{
          label: 'win',
          data: this.dispGameRatio.map(v => {return v.win})
        },
        {
          label: 'lose',
          data: this.dispGameRatio.map(v => {return v.lose})
        },
      ],
    }
    this.dispScoreDifferenceWinGraph = {
      labels: ['2点差', '3点差','4点差','5点差以上'],
      datasets:[{
        label:'win',
        data: [this.dispScoreDifference.win.two, this.dispScoreDifference.win.three, this.dispScoreDifference.win.four, this.dispScoreDifference.win.over]
      }]
    }
    this.dispScoreDifferenceLoseGraph = {
      labels: ['2点差', '3点差','4点差','5点差以上'],
      datasets:[
      {
        label:'lose',
        data: [this.dispScoreDifference.lose.two, this.dispScoreDifference.lose.three, this.dispScoreDifference.lose.four, this.dispScoreDifference.lose.over]
      }]
    }
    this.rallyDataRador = {
      labels: ['ゲーム毎サービスエース', 'ゲーム毎レシーブエース', '得点毎ラリー数'],
      datasets:[
        {
          label: '',
          data: [
            this.totalServeScore / (this.displayData.totalWinGame + this.displayData.totalLoseGame),
            this.totalReceiveScore / (this.displayData.totalWinGame + this.displayData.totalLoseGame),
            this.numOfTotalRally / (this.displayData.totalRunsScored + this.displayData.totalRuns)
            ]
      }
      ]
    }
    this.isDispResult = true
  }
}

enum spinKind {
  t = 0,
  u = 1,
  s = 2,
  k = 3
}

enum shotKind{
  D = 0,
  S = 1
}

interface action {
  isFore: boolean; // フォアならtrue、バックならfalse
  isServiceMiss: boolean; // サービスミスならtrue、それ以外がfalse
  spinDirection: string;
  shotType: string;
}

interface pointInfo {
  getMyPoint: boolean; // trueなら自得点、falseなら相手
  rallyCount: number; // ラリー数
  lastMyAction: action; // ラリー最後の自身の行動
}

interface gameInfo {
  gamePointList: pointInfo[];
  gameCount: number; // ゲーム数(1～5)
  isServe: boolean; //サービス権持ってのスタートか。持っていたらtrue
}

interface opponentInfo {
  racket: string; // シェークorペン
  fore: string; // フォアラバーの種類
  back: string; // バックラバーの種類
}

interface matchInfo {
  date: Date,
  title: string,
  opponent: opponentInfo,
  scoreList: string[],
  gameCount: number[],
  gameList: gameInfo[]
}

interface summaryData {
  totalMatch: number;
  totalWinMatch: number;
  totalLoseMatch: number;
  PerOfWin: number;
  totalWinGame: number;
  totalLoseGame: number;
  totalRunsScored: number;
  totalRuns: number;
}

interface getGameRatio {
  win: number;
  lose: number
}
interface getGameRatioGraph {
  labels: string[];
  datasets: {
    label: string;
    data: any;
  }[]
}

interface scoreKind {
  two: number;
  three: number;
  four: number;
  over: number  
}
interface ScoreDifference {
  win: scoreKind;
  lose: scoreKind
}

interface ScoreDifferenceGraph{
  labels: string[];
  datasets:{
    label:string;
    data: any;
  }[]
}

interface rallyDataGraph{
  labels: string[];
  datasets:{
    label:string;
    data: any;
  }[]
}

interface rallyScore {
  win:number;
  lose: number;
}

interface rallyDistribution{
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