import { Injectable } from "../../lib/di";
import { WordService } from "./word.service";
import { SomeService } from "../some/some.service";

@Injectable()
export class HelloService {

  constructor(
      private readonly someService: SomeService,
      private readonly wordService: WordService) {

  }

  public getHello() {
    console.log(`hello world!`);
    this.wordService.getName();
    this.someService.doSomething();
  }

}
