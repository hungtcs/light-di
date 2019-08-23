import { Injectable } from "../../lib/di";

@Injectable()
export class WordService {

  constructor() {

  }

  public getName() {
    console.log('hungtcs');
  }

}
