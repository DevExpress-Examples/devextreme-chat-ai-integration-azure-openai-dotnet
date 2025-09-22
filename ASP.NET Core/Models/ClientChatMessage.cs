using System;

namespace ASP_NET_Core.Models
{
    public class ClientChatMessage
    {
        public string? timestamp { get; set; }
        
        public string text { get; set; }
        public string id { get; set; }
        
        public ChatAuthor? author { get; set; }
    }

    public class ChatAuthor
    {
        public string id { get; set; }
        public string name { get; set; }
    }
}
