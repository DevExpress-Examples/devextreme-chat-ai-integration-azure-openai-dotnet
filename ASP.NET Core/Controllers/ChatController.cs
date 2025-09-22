using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.AI;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using ASP_NET_Core.Models;

public class ChatController : Controller {
    protected IChatClient _chatClient;
    protected DataService _dataService;
    public ChatController(IChatClient chatClient, DataService dataService) {
        _chatClient = chatClient;
        _dataService = dataService;
    }
    
    [HttpPost]
    public async Task<IActionResult> GetResponse([FromBody] ClientChatMessage message, [FromQuery] bool regenerate = false) {        
        var userId = message.id;
        List<ChatMessage> messages;
        if(regenerate) {
            messages = _dataService.RemoveLastMessage(userId);
        }
        else
          messages = _dataService.AddMessage(userId, message);
        var response = await _chatClient.GetResponseAsync(messages);
        var result = _dataService.AddMessage(userId,  response.Messages[0]);
        return Json(ToClientMessages(result));
    }

    [HttpGet]
    public IActionResult GetUserMessages(string userId) {
        var result = _dataService.GetMessages(userId);
        return Json(ToClientMessages(result));
    }

    protected IEnumerable<ClientChatMessage> ToClientMessages(List<ChatMessage> messages) {
        return messages.Select(m => new ClientChatMessage {
            author = new ChatAuthor { 
                id = m.Role.Value, 
                name = m.Role == ChatRole.User ? "You" : "Virtual Assistant" 
            },
            id = m.MessageId,
            text = m.Text,
            timestamp = m.CreatedAt?.ToUniversalTime().ToString("o")
        });
    }
}
