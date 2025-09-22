using System;

namespace ASP_NET_Core.Models
{
    public class ClientChatMessage
    {
        // For incoming requests (ClientMessage properties)
        public string? timestamp { get; set; }
        
        // Common properties
        public string text { get; set; }
        public string id { get; set; }
        
        // For outgoing responses (ChatMessageResponse properties)  
        public ChatAuthor? author { get; set; }
    }

    public class ChatAuthor
    {
        public string id { get; set; }
        public string name { get; set; }
    }
}
