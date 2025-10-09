using Microsoft.Extensions.AI;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System;
using ChatServer.Models;

namespace ChatServer.Services
{
    public class DataService
    {
        private const string ChatKey = "ChatHistory";
        private readonly ISession _session;
        
        public DataService(IHttpContextAccessor accessor)
        {
            _session = accessor.HttpContext.Session;
        }
        
        public List<ChatMessage> AddUserMessage(ClientChatMessage message)
        {
            var createdAt = message.Timestamp != null ? DateTime.Parse(message.Timestamp) : DateTime.UtcNow;
            var msg = new ChatMessage(ChatRole.User, message.Text)
            {
                CreatedAt = createdAt,
                MessageId = message.Id,
            };
            return AddMessage(msg);
        }
        
        public List<ChatMessage> AddMessage(ChatMessage message)
        {
            var messages = GetMessages();
            messages.Add(message);
            SetMessages(messages);
            return messages;
        }
        
        public List<ChatMessage> AddAssistantMessage(ChatMessage message)
        {
            if (message.CreatedAt == null)
                message.CreatedAt = DateTime.UtcNow;
            if (string.IsNullOrEmpty(message.MessageId))
                message.MessageId = Guid.NewGuid().ToString("N");
            return AddMessage(message);
        }
        
        public List<ChatMessage> RemoveLastMessage()
        {
            var messages = GetMessages();
            if (messages.Count > 0)
                messages.RemoveAt(messages.Count - 1);
            SetMessages(messages);
            return messages;
        }
        
        public List<ChatMessage> GetMessages() =>
            _session.Get<List<ChatMessage>>(ChatKey) ?? new List<ChatMessage>();
        
        private void SetMessages(List<ChatMessage> messages) =>
            _session.Set(ChatKey, messages);
    }

    public static class SessionExtensions
    {
        public static void Set<T>(this ISession session, string key, T value)
        {
            session.SetString(key, JsonSerializer.Serialize(value));
        }

        public static T? Get<T>(this ISession session, string key)
        {
            var value = session.GetString(key);
            return value == null ? default : JsonSerializer.Deserialize<T>(value);
        }
    }
}
