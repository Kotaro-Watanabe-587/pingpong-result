import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { matchInfo } from '../src/app/interfaces/interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public subject = new Subject<any>();
  public observe = this.subject.asObservable();

  matchData: matchInfo[] = [
    {
      id: 0,
      date: new Date(),
      title: '',
      opponent:{
        racket: '',
        fore: '',
        back: ''
      },
      scoreList: [],
      gameCount: [],
      gameList: []
    }
  ]

  constructor() { }

  getMatchData(): matchInfo[]{
    return this.matchData;
  }

  add(matchData: matchInfo[]){
    this.matchData = matchData
  }

  clear(){
    this.matchData = [];
  }
}
