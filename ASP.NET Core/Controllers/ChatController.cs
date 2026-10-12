using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.AI;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using Microsoft.AspNetCore.Http;
using ASP_NET_Core.Models;

public class ChatController : Controller {
    protected IChatClient _chatClient;
    protected DataService _dataService;
    public ChatController(IChatClient chatClient, DataService dataService) {
        _chatClient = chatClient;
        _dataService = dataService;
    }
    
    [HttpPost]
    public async Task<IActionResult> GetAIResponse([FromBody] ClientChatMessage message, [FromQuery] bool regenerate = false) {   
        var previousMessages = _dataService.GetMessages();
        List<ChatMessage> messages = regenerate
            ? _dataService.RemoveLastMessage()
            : _dataService.AddUserMessage(message);
        try {
            var response = await _chatClient.GetResponseAsync(messages);
            var updatedMessages = _dataService.AddAssistantMessage(response.Messages[0]);
            var lastMessage = updatedMessages[^1];
            return Json(ToClientMessage(lastMessage));
        } catch (Exception exception) {
            if (regenerate && previousMessages.Count > 0)
                _dataService.AddMessage(previousMessages[^1]);
            else if (!regenerate)
                _dataService.RemoveLastMessage();

            return Problem(
                title: "AI service request failed",
                detail: exception.Message,
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    [HttpGet]
    public IActionResult GetUserMessages() {
        var result = _dataService.GetMessages();
        return Json(ToClientMessages(result));
    }

    protected IEnumerable<ClientChatMessage> ToClientMessages(List<ChatMessage> messages) => messages.Select(ToClientMessage);
    protected ClientChatMessage ToClientMessage(ChatMessage m) => new ClientChatMessage {
        Author = new ChatAuthor {
            Id = m.Role.Value,
            Name = m.Role == ChatRole.User ? "You" : "Virtual Assistant"
        },
        Id = m.MessageId,
        Text = m.Text,
        Timestamp = m.CreatedAt?.ToUniversalTime().ToString("o")
    };
}
