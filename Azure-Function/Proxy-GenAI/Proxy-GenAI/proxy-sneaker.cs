using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

public class GeminiProxyFunction
{
    private readonly ILogger _logger;
    private readonly HttpClient _httpClient;
    private readonly string _geminiApiKey;

    public GeminiProxyFunction(ILoggerFactory loggerFactory, IHttpClientFactory httpClientFactory)
    {
        _logger = loggerFactory.CreateLogger<GeminiProxyFunction>();
        _httpClient = httpClientFactory.CreateClient();

        // Fetch API Key from Environment Variables
        _geminiApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY")
                        ?? throw new ArgumentNullException("GEMINI_API_KEY is not configured.");
    }

    [Function("GeminiProxy")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "v1/models/{model}:generateContent")] HttpRequestData req,
            string model)
    {
        _logger.LogInformation($"Proxying request for model: {model}");

        try
        {
            // 1. Read the body from the incoming request
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

            // 2. Prepare the Google API URL
            // Format: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
            string googleApiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={_geminiApiKey}";

            // 3. Forward the request to Google
            var content = new StringContent(requestBody, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(googleApiUrl, content);

            // 4. Create the response back to the client
            var responseData = req.CreateResponse(response.StatusCode);

            // Copy headers from Google (optional, but good for content-type)
            responseData.Headers.Add("Content-Type", "application/json");

            // Stream the response back
            var responseBody = await response.Content.ReadAsStringAsync();
            await responseData.WriteStringAsync(responseBody);

            return responseData;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in Proxy: {ex.Message}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("Internal Server Error occurred in the proxy.");
            return errorResponse;
        }
    }
}