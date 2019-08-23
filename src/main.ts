import { Factory } from '../lib/di';
import { HelloModule } from './hello/hello.module';
import { HelloService } from './hello/hello.service';

const helloModule = Factory.create(HelloModule);

helloModule.get(HelloService).getHello();
