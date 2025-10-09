using System;
using System.Text.Json.Serialization;

namespace ChatServer.Models
{
    public class ClientChatMessage
    {
        [JsonPropertyName("timestamp")]
        public string? Timestamp { get; set; }
       
        [JsonPropertyName("text")]
        public string Text { get; set; }
       
        [JsonPropertyName("id")]    
        public string Id { get; set; }

        [JsonPropertyName("author")]
        public ChatAuthor? Author { get; set; }
    }

    public class ChatAuthor
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }
    }
}
