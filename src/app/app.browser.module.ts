import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UniversalModule, isBrowser, isNode } from 'angular2-universal/browser'; // for AoT we need to manually split universal packages
import { ApolloModule } from 'angular2-apollo';

import { client } from './apollo.browser';
import { SharedModule } from './shared/shared.module';
import { HomeModule } from './home/home.module';
import { LoginModule } from './login/login.module';
import { NoContentModule } from './no-content/no-content.module';
import { ClientsModule } from './clients/clients.module';
import { VisitModule } from './visit/visit.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CacheService } from './universal-cache';
import { ClientService } from './shared/_services/client.service';
import { VisitService } from './shared/_services/visit.service';
import { AuthGuard } from './shared/_guards/auth.guard';
import { AuthenticationService } from './shared/_services/authentication.service';

// TODO(gdi2290): refactor into Universal
export const UNIVERSAL_KEY = 'UNIVERSAL_CACHE';

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [ AppComponent ],
  imports: [
    UniversalModule, // BrowserModule, HttpModule, and JsonpModule are included
    FormsModule,
    ApolloModule.withClient(client),

    SharedModule,
    HomeModule,
    ClientsModule,
    VisitModule,
    LoginModule,
    NoContentModule,
    AppRoutingModule
  ],
  providers: [
    { provide: 'isBrowser', useValue: isBrowser },
    { provide: 'isNode', useValue: isNode },
    ClientService,
    VisitService,
    AuthGuard,
    AuthenticationService,
    CacheService
  ]

})
export class MainModule {
  constructor(public cache: CacheService) {
    // TODO(gdi2290): refactor into a lifecycle hook
    this.doRehydrate();
  }

  doRehydrate() {
    let defaultValue = {};
    let serverCache = this._getCacheValue(CacheService.KEY, defaultValue);
    this.cache.rehydrate(serverCache);
  }

  _getCacheValue(key: string, defaultValue: any): any {
    // browser
    const win: any = window;
    if (win[UNIVERSAL_KEY] && win[UNIVERSAL_KEY][key]) {
      let serverCache = defaultValue;
      try {
        serverCache = JSON.parse(win[UNIVERSAL_KEY][key]);
        if (typeof serverCache !== typeof defaultValue) {
          console.log('Angular Universal: The type of data from the server is different from the default value type');
          serverCache = defaultValue;
        }
      } catch (e) {
        console.log('Angular Universal: There was a problem parsing the server data during rehydrate');
        serverCache = defaultValue;
      }
      return serverCache;
    } else {
      console.log('Angular Universal: UNIVERSAL_CACHE is missing');
    }
    return defaultValue;
  }
}
