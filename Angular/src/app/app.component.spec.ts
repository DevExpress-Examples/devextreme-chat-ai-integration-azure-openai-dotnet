import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import DataSource from 'devextreme/data/data_source';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxChatModule } from 'devextreme-angular/ui/chat';
import { DxTemplateModule } from 'devextreme-angular/core';
import { AppComponent } from './app.component';
import { MessageTemplateComponent } from './components/message-template/message-template.component';
import { ChatService } from './services/chat.service';

class ChatServiceStub {
  typingUsers$ = of([]);

  alerts$ = of([]);

  initDataSource = jasmine
    .createSpy('initDataSource')
    .and.returnValue(Promise.resolve({} as DataSource));

  onMessageEntered = jasmine
    .createSpy('onMessageEntered')
    .and.returnValue(Promise.resolve());

  updateLastMessage = jasmine.createSpy('updateLastMessage');

  regenerate = jasmine
    .createSpy('regenerate')
    .and.returnValue(Promise.resolve());
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DxButtonModule,
        DxChatModule,
        DxTemplateModule,
      ],
      declarations: [
        AppComponent,
        MessageTemplateComponent,
      ],
      providers: [
        {
          provide: ChatService,
          useClass: ChatServiceStub,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
