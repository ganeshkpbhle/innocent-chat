using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;

public class GeminiProxyFunction
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger _logger;
    private readonly string _apiKey;

    public GeminiProxyFunction(IHttpClientFactory httpClientFactory, ILoggerFactory loggerFactory)
    {
        _httpClientFactory = httpClientFactory;
        _logger = loggerFactory.CreateLogger<GeminiProxyFunction>();
        _apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY")
            ?? throw new InvalidOperationException("GEMINI_API_KEY not configured");
    }

    [Function("GeminiProxy")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "gemini/proxy")]
        HttpRequestData req)
    {
        try
        {
            var envBase = Environment.GetEnvironmentVariable("GEMINI_API_BASE") ?? "https://generativelanguage.googleapis.com";
            var modelName = Environment.GetEnvironmentVariable("MODEL_NAME") ?? "gemini-1.5-pro";
            var timeoutMs = int.TryParse(Environment.GetEnvironmentVariable("TIMEOUT_MS"), out var t) ? t : 15000;

            var requestBody = await JsonSerializer.DeserializeAsync<Dictionary<string, object>>(req.Body,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (requestBody is null || !requestBody.TryGetValue("prompt", out var promptObj) || string.IsNullOrWhiteSpace(promptObj?.ToString()))
            {
                var bad = req.CreateResponse(HttpStatusCode.BadRequest);
                await bad.WriteAsJsonAsync(new { error = "Missing 'prompt' in request body" });
                return bad;
            }

            var prompt = promptObj.ToString();

            var url = $"{envBase}/v1beta/models/{modelName}:generateContent?key={Uri.EscapeDataString(_apiKey)}";
            var payload = new
            {
                contents = new[]
                {
                    new { role = "user", parts = new[] { new { text = prompt } } }
                }
            };

            var client = _httpClientFactory.CreateClient("gemini");
            client.Timeout = TimeSpan.FromMilliseconds(timeoutMs);

            using var resp = await client.PostAsJsonAsync(url, payload);
            var outResp = req.CreateResponse((HttpStatusCode)resp.StatusCode);
            var respJson = await resp.Content.ReadAsStringAsync();

            outResp.Headers.Add("Content-Type", "application/json");
            await outResp.WriteStringAsync(respJson);

            return outResp;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini proxy error");
            var err = req.CreateResponse(HttpStatusCode.InternalServerError);
            await err.WriteAsJsonAsync(new { error = "Proxy failed", details = ex.Message });
            return err;
        }
    }
}