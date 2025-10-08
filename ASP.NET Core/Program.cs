using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.AI;
using Azure;
using Azure.AI.OpenAI;
using System;
using Microsoft.AspNetCore.Http;
using ASP_NET_Core.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace ASP_NET_Core;
public class Program {
    public static void Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);

        // Configure Azure OpenAI options
        builder.Services
            .AddOptions<AzureOpenAIOptions>()
            .Bind(builder.Configuration.GetSection(AzureOpenAIOptions.SectionName))
            .Validate(o => !string.IsNullOrWhiteSpace(o.Endpoint), "Endpoint missing")
            .Validate(o => !string.IsNullOrWhiteSpace(o.ApiKey), "ApiKey missing")
            .Validate(o => !string.IsNullOrWhiteSpace(o.ModelName), "ModelName missing")
            .ValidateOnStart();

        // Configure Azure OpenAI Client
        builder.Services.AddSingleton<IChatClient>(sp => {
            var opts = sp.GetRequiredService<IOptions<AzureOpenAIOptions>>().Value;
            var client = new AzureOpenAIClient(
                new Uri(opts.Endpoint),
                new System.ClientModel.ApiKeyCredential(opts.ApiKey));
            return client.GetChatClient(opts.ModelName).AsIChatClient();
        });

        // Configure session
        builder.Services.AddDistributedMemoryCache();
        builder.Services.AddSession(options => {
            options.IdleTimeout = TimeSpan.FromMinutes(15);
            options.Cookie.HttpOnly = true;
            options.Cookie.IsEssential = true;
        });
        builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        builder.Services.AddTransient<DataService>();

        // Add services to the container.
        builder.Services
            .AddControllersWithViews()
            .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if(app.Environment.IsDevelopment()) {
            app.UseDeveloperExceptionPage();
        } else {
            app.UseExceptionHandler("/Home/Error");
        }

        app.UseStaticFiles();

        app.UseRouting();

        app.UseAuthorization();
        app.UseSession();

        app.MapControllers();
        app.MapControllerRoute(
            name: "default",
            pattern: "{controller=Home}/{action=Index}/{id?}"
        );

        app.Run();
    }
}
