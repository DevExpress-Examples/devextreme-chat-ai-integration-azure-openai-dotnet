<!-- default badges list -->
![](https://img.shields.io/endpoint?url=https://codecentral.devexpress.com/api/v1/VersionRange/1058002627/25.1.3%2B)
[![](https://img.shields.io/badge/Open_in_DevExpress_Support_Center-FF7200?style=flat-square&logo=DevExpress&logoColor=white)](https://supportcenter.devexpress.com/ticket/details/T1308111)
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
[![](https://img.shields.io/badge/💬_Leave_Feedback-feecdd?style=flat-square)](#does-this-example-address-your-development-requirementsobjectives)
<!-- default badges end -->
# DevExtreme Chat - Integration with Azure OpenAI (.NET)

This example integrates the [DevExtreme Chat](https://js.devexpress.com/Documentation/Guide/UI_Components/Chat/Overview/) UI component with an AI assistant powered by [Azure OpenAI](https://azure.microsoft.com/en-us/pricing/details/azure-openai/) using a minimal ASP.NET Web API backend.

![Example image](images/chat.png)

The backend controller ([ChatController.cs](ChatServer/Controllers/ChatController.cs)) handles incoming chat messages, calls Azure OpenAI, and returns the assistant's response. Client apps (Angular/React/Vue/jQuery/ASP.NET Core) send user messages to the backend and update the Chat UI with the assistant's responses.

## Run the Server

To run the backend, follow the instructions in [ChatServer README](ChatServer/README.md).

## Files to Review

- **jQuery**
    - [index.js](jQuery/src/index.js)
- **Angular**
    - [app.component.html](Angular/src/app/app.component.html)
    - [app.component.ts](Angular/src/app/app.component.ts)
    - [app.service.ts](Angular/src/app/app.service.ts)
- **Vue**
    - [ChatInterface.vue](Vue/src/components/ChatInterface.vue)
- **React**
    - [ChatApp.tsx](React/src/components/ChatApp.tsx)
- **ASP.NET Core**
    - [Index.cshtml](ASP.NET%20Core/Views/Home/Index.cshtml)

## Documentation

- [DevExtreme Chat Overview](https://js.devexpress.com/Documentation/Guide/UI_Components/Chat/Overview/)
- [DevExtreme Chat API Reference](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChat/)
- [Integrate DevExtreme Chat with AI Service](https://js.devexpress.com/Documentation/Guide/UI_Components/Chat/Integrate_with_AI_Service/)

## More Examples

- [Chat with OpenAI](https://github.com/DevExpress-Examples/devextreme-chat-openai-integration)
- [Chat with Google Dialogflow](https://github.com/DevExpress-Examples/devextreme-chat-google-dialogflow)
- [Chat with Microsoft Agent Framework](https://github.com/DevExpress-Examples/devextreme-chat-ai-integration-ms-agent-framework)

## Does this example address your development requirements/objectives?

[<img src="https://www.devexpress.com/support/examples/i/yes-button.svg"/>](https://www.devexpress.com/support/examples/survey.xml?utm_source=github&utm_campaign=devextreme-chat-ai-integration-ms-dotnet&~~~was_helpful=yes) [<img src="https://www.devexpress.com/support/examples/i/no-button.svg"/>](https://www.devexpress.com/support/examples/survey.xml?utm_source=github&utm_campaign=devextreme-chat-ai-integration-ms-dotnet&~~~was_helpful=no)

(you will be redirected to DevExpress.com to submit your response)
<!-- feedback end -->
