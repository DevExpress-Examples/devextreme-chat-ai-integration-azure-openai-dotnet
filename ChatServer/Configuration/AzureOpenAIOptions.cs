namespace ChatServer.Configuration
{
    public class AzureOpenAIOptions
    {
        public const string SectionName = "AzureOpenAI";
        
        public string Endpoint { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string ModelName { get; set; } = string.Empty;
    }
}
