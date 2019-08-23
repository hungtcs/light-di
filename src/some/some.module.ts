import { Module } from "../../lib/di";
import { SomeService } from "./some.service";

@Module({
  providers: [
    SomeService,
  ],
})
export class SomeModule {

}
