using Microsoft.Extensions.AI;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System;
using ASP_NET_Core.Models;

public class DataService {
    protected ISession _session;
    public DataService(IHttpContextAccessor accessor) {
        _session = accessor.HttpContext.Session;
    }
    public List<ChatMessage> AddMessage(string userId, ClientChatMessage message) {
        var msg = new ChatMessage(ChatRole.User, message.text) {
            CreatedAt = DateTime.Parse(message.timestamp)
        };
        return AddMessage(userId, msg);
    }
    public List<ChatMessage> AddMessage(string userId, ChatMessage message) {
        var userMessages = GetMessages(userId);
        userMessages.Add(message);
        SetMessages(userId, userMessages);
        return userMessages;
    }
    public List<ChatMessage> RemoveLastMessage(string userId) {
        var userMessages = GetMessages(userId);
        if(userMessages.Count > 0)
            userMessages.RemoveAt(userMessages.Count - 1);
        SetMessages(userId, userMessages);
        return userMessages;
    }
    public List<ChatMessage> GetMessages(string userId) =>
        _session.Get<List<ChatMessage>>(userId) ?? new List<ChatMessage>();    
    protected void SetMessages(string userId, List<ChatMessage> messages) => 
        _session.Set(userId, messages);
    
}
public static class SessionExtensions {
    public static void Set<T>(this ISession session, string key, T value) {
        session.SetString(key, JsonSerializer.Serialize(value));
    }
    public static T? Get<T>(this ISession session, string key) {
        var value = session.GetString(key);
        return value == null ? default : JsonSerializer.Deserialize<T>(value);
    }
}
