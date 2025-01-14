import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import 'hammerjs/hammer';



platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
