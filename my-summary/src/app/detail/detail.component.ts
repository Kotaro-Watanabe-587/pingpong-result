import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DataService } from '../../../service/data.service';
import { gameDetail, getGameRatioGraph, matchDetail, matchInfo } from '../interfaces/interface';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [RouterModule, ChartModule, ButtonModule, CardModule, TabViewModule, TableModule, GoogleMapsModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit{

  matchData: matchInfo[] = [];
  displayData: matchInfo = {
    id: 0,
    date: new Date(),
    title: '',
    opponent: {
      racket: '',
      fore: '',
      back: ''
    },
    scoreList: [],
    gameCount: [],
    gameList: []
  };
  matchDetail: matchDetail = {
    myScore:{
      gameList: [],
      totalDetail: {
        totalScore: 0,
        serviceScore: 0,
        recieveScore: 0,
        serviceOpponentScore: 0,
        recieveOpponentScore: 0,
        maxPointDifference: 0,
        maxReversed: 0,
        scoreTransition: [],
      }
    },
    opponentScore:{
      gameList: [],
      totalDetail: {
        totalScore: 0,
        serviceScore: 0,
        recieveScore: 0,
        serviceOpponentScore: 0,
        recieveOpponentScore: 0,
        maxPointDifference: 0,
        maxReversed: 0,
        scoreTransition: [],
      }
    }
  }

  dispScoreTransition: getGameRatioGraph[] = [];

  readonly scoreChartOptions = {

  }

  chartIndex: number = 0;

  zoom = 16;

  center: google.maps.LatLngLiteral = {
    lat: 35.77538889,
    lng: 139.73554
  };

  options: google.maps.MapOptions = {
    disableDefaultUI: true
  };

  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral = this.center;


  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private location: Location
  ){

  }

  ngOnInit(): void {
    this.getMatchData();
    this.setDetailData();
    // ②個別試合詳細
    //   得点とゲーム数
    //   試合全体、ゲーム毎の獲得ポイント、サービス時の獲得ポイント、サービス時の喪失ポイント、レシーブ時の喪失ポイント、最大リード点数、最大連続得点、最大逆転点差(セット獲得時のみ)
    //   ポイント獲得の折れ線グラフ

  }

  getMatchData(): void{
    const id = Number(this.route.snapshot.paramMap.get('id'))
    this.matchData = this.dataService.getMatchData();
    const index = this.matchData.findIndex(v => v.id === id)
    this.displayData = index > -1 ? this.matchData[index] : this.matchData[0]
    console.log(this.displayData)
  }

  setDetailData(): void{
    this.displayData.gameList.forEach((v,i) => {
      let myGameDetail: gameDetail ={
        totalScore: 0,
        serviceScore: 0,
        recieveScore: 0,
        serviceOpponentScore: 0,
        recieveOpponentScore: 0,
        maxPointDifference: 0,
        maxReversed: 0,
        scoreTransition: [0]
      }
      let opponentGameDetail: gameDetail ={
        totalScore: 0,
        serviceScore: 0,
        recieveScore: 0,
        serviceOpponentScore: 0,
        recieveOpponentScore: 0,
        maxPointDifference: 0,
        maxReversed: 0,
        scoreTransition: [0]
      }
      const serveRight = v.isServe;
      let scoreCount = {
        serviceScore: 0,
        recieveScore: 0,
        serviceOpponentScore: 0,
        recieveOpponentScore: 0        
      }
      v.gamePointList.forEach((val, idx) => {
        if(val.getMyPoint){
          if(serveRight){
            if(idx%4===0 || idx%4===1){
              // 得点時にサービス出していたルート
              scoreCount.serviceScore ++;
            }else{
              // 得点時にレシーブだったルート
              scoreCount.recieveScore ++;
            }
          }else{
            if(idx%4===0 || idx%4===1){
              // 得点時にレシーブだったルート
              scoreCount.recieveScore ++;
            }else{
              // 得点時にサービス出していたルート
              scoreCount.serviceScore ++;
            }
          }
          //scoreTransitionにもデータを追加する。myGameDetailに得点加算
          myGameDetail.scoreTransition.push(myGameDetail.scoreTransition[myGameDetail.scoreTransition.length-1] + 1)
          opponentGameDetail.scoreTransition.push(opponentGameDetail.scoreTransition[opponentGameDetail.scoreTransition.length-1])
        }else{
          if(serveRight){
            if(idx%4===0 || idx%4===1){
              // 失点時にサービス出していたルート
              scoreCount.serviceOpponentScore ++;
            }else{
              // 失点時にレシーブだったルート
              scoreCount.recieveOpponentScore ++;
            }
          }else{
            if(idx%4===0 || idx%4===1){
              // 失点時にレシーブだったルート
              scoreCount.recieveOpponentScore ++;
            }else{
              // 失点時にサービス出していたルート
              scoreCount.serviceOpponentScore ++;
            }
          }
          //scoreTransitionにもデータを追加する。opponentGameDetailに得点加算
          myGameDetail.scoreTransition.push(myGameDetail.scoreTransition[myGameDetail.scoreTransition.length-1])
          opponentGameDetail.scoreTransition.push(opponentGameDetail.scoreTransition[opponentGameDetail.scoreTransition.length-1] + 1)
        }
      })

      myGameDetail = {
        totalScore: Number(this.displayData.scoreList[i].split('-')[0]),
        serviceScore: scoreCount.serviceScore,
        recieveScore: scoreCount.recieveScore,
        serviceOpponentScore: scoreCount.serviceOpponentScore,
        recieveOpponentScore: scoreCount.recieveOpponentScore,
        maxPointDifference: 0,
        maxReversed: 0,
        scoreTransition: myGameDetail.scoreTransition
      }
      opponentGameDetail = {
        totalScore: Number(this.displayData.scoreList[i].split('-')[1]),
        serviceScore: scoreCount.recieveOpponentScore,
        recieveScore: scoreCount.serviceOpponentScore,
        serviceOpponentScore: scoreCount.recieveScore,
        recieveOpponentScore: scoreCount.serviceScore,
        maxPointDifference: 0,
        maxReversed: 0,
        scoreTransition: opponentGameDetail.scoreTransition
      }
      this.matchDetail.myScore.gameList.push(myGameDetail)
      this.matchDetail.opponentScore.gameList.push(opponentGameDetail)
    })

    this.matchDetail.myScore.totalDetail
    this.matchDetail.opponentScore.totalDetail

    this.matchDetail.myScore.gameList.forEach((v,i) => {
      const labelData = v.scoreTransition.map((val,idx) => {
        return String(idx+1)
      })
      let tmpScoreTransitionData: getGameRatioGraph = {
        labels: labelData,
        datasets:[
          {
            label: 'myScore',
            data: v.scoreTransition
          },
          {
            label: 'opponentScore',
            data: this.matchDetail.opponentScore.gameList[i].scoreTransition
          }
        ]
      }
      this.dispScoreTransition.push(tmpScoreTransitionData)
    })

   console.log(this.matchDetail)
   console.log(this.dispScoreTransition)
  }

  changeDisplayChart($event: number){
    this.chartIndex = $event
  }
}

