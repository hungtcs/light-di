import { Injectable } from "../../lib/di";

@Injectable()
export class SomeService {

  constructor() {

  }

  public doSomething() {
    console.log('I am do something.');
  }

}
