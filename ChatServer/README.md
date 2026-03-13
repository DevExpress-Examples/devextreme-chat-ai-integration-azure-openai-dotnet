# ChatServer

ChatServer is a .NET 9 minimal, API-only Web API that exposes REST endpoints for sending messages and retrieving chat history. It is powered by [Azure OpenAI](https://azure.microsoft.com/en-us/pricing/details/azure-openai/).

## Features

- **API-only architecture** - No Views or static files
- **Azure OpenAI integration** - Uses `Microsoft.Extensions.AI` for chat completions
- **Session-based chat history** - Maintains conversation context per session
- **CORS enabled** - Allows cross-origin requests from client applications
- **Port 5005** - Runs on HTTP port 5005 and HTTPS port 5006

## Project Structure

```
ChatServer/
├── Configuration/
│   └── AzureOpenAIOptions.cs    # Azure OpenAI configuration options
├── Controllers/
│   └── ChatController.cs        # API endpoints for Chat operations
├── Models/
│   └── ClientChatMessage.cs     # Chat message model for client requests
├── Services/
│   └── DataService.cs           # Session-based message storage
├── Program.cs                   # Application startup and configuration
├── appsettings.json             # Application settings
└── ChatServer.csproj            # Project file
```

## API Endpoints

### POST /api/Chat/GetAIResponse
Sends a message to Azure OpenAI and returns the AI response.

**Request Body:**
```json
{
  "id": "unique-message-id",
  "text": "Your message here",
  "timestamp": "2025-10-08T12:00:00Z"
}
```

**Query Parameters:**
- `regenerate` (bool, optional): If true, removes the last message and regenerates the response

**Response:**
```json
{
  "id": "response-id",
  "text": "AI response text",
  "timestamp": "2025-10-08T12:00:01Z",
  "author": {
    "id": "assistant",
    "name": "Virtual Assistant"
  }
}
```

### GET /api/Chat/GetUserMessages
Retrieves all messages from the current session.

**Response:**
```json
[
  {
    "id": "message-id",
    "text": "Message text",
    "timestamp": "2025-10-08T12:00:00Z",
    "author": {
      "id": "user",
      "name": "You"
    }
  }
]
```

## Configuration

Update `appsettings.json` with your Azure OpenAI credentials:

```json
{
  "AzureOpenAI": {
    "Endpoint": "https://your-resource.openai.azure.com/",
    "ApiKey": "your-api-key",
    "ModelName": "your-deployment-name"
  }
}
```

## Run the Server

```bash
dotnet run
```

The server will start on:
- HTTP: http://localhost:5005
- HTTPS: https://localhost:5006

## CORS Policy

The server allows all HTTP methods and headers for requests coming from `http://localhost:5050`, as configured in `Program.cs` using `WithOrigins("http://localhost:5050")`. This configuration is intended for development purposes: client applications must either be served from `http://localhost:5050` or you must update the CORS policy in `Program.cs` to add or change the allowed origin(s). For production, restrict the allowed origins in `Program.cs` to only the specific domains that should be able to access the API.

## Session Management

Chat history is stored in session storage with a 15-minute idle timeout. Sessions are automatically cleaned up after the idle timeout expires.
