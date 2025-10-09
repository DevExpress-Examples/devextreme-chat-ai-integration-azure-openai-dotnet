using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.AI;
using Azure;
using Azure.AI.OpenAI;
using System;
using Microsoft.AspNetCore.Http;
using ChatServer.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using ChatServer.Services;

namespace ChatServer;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Configure URLs
        builder.WebHost.UseUrls("http://localhost:5005", "https://localhost:5006");

        // Configure Azure OpenAI options
        builder.Services
            .AddOptions<AzureOpenAIOptions>()
            .Bind(builder.Configuration.GetSection(AzureOpenAIOptions.SectionName))
            .Validate(o => !string.IsNullOrWhiteSpace(o.Endpoint), "Endpoint missing")
            .Validate(o => !string.IsNullOrWhiteSpace(o.ApiKey), "ApiKey missing")
            .Validate(o => !string.IsNullOrWhiteSpace(o.ModelName), "ModelName missing")
            .ValidateOnStart();

        // Configure Azure OpenAI Client
        builder.Services.AddSingleton<IChatClient>(sp =>
        {
            var opts = sp.GetRequiredService<IOptions<AzureOpenAIOptions>>().Value;
            var client = new AzureOpenAIClient(
                new Uri(opts.Endpoint),
                new System.ClientModel.ApiKeyCredential(opts.ApiKey));
            return client.GetChatClient(opts.ModelName).AsIChatClient();
        });

        // Configure CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowWeb", policy =>
            {
                policy.WithOrigins("http://localhost:5050")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });

        // Configure session
        builder.Services.AddDistributedMemoryCache();
        builder.Services.AddSession(options =>
        {
            options.IdleTimeout = TimeSpan.FromMinutes(15);
            options.Cookie.HttpOnly = true;
            options.Cookie.IsEssential = true;
            
            if (builder.Environment.IsDevelopment())
            {
                // Development: Use Lax (doesn't require HTTPS)
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.None;
            }
            else
            {
                // Production: Use None with Secure (requires HTTPS)
                options.Cookie.SameSite = SameSiteMode.None;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            }
        });
        builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        builder.Services.AddTransient<DataService>();

        // Add services to the container
        builder.Services
            .AddControllers()
            .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);

        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi();

        var app = builder.Build();

        // Configure the HTTP request pipeline
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            app.UseDeveloperExceptionPage();
        }

        app.UseCors("AllowWeb");

        app.UseRouting();
        
        app.UseSession();

        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}

