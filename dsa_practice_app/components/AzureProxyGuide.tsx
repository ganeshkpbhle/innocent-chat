
import React from 'react';

const AzureProxyGuide: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 overflow-y-auto max-h-[80vh]">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
        Azure Proxy Setup Guide
      </h2>
      
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-700">1. Azure Function (C# .NET)</h3>
        <p className="text-sm text-slate-600">Create an HTTP Trigger function to act as a secure gateway.</p>
        <div className="bg-slate-900 rounded-lg p-4 code-font text-xs text-blue-300 overflow-x-auto">
          <pre>{`// In your Azure Function (HttpTrigger)
[FunctionName("GeminiProxy")]
public static async Task<IActionResult> Run(
    [HttpTrigger(AuthorizationLevel.Function, "post", Route = "v1/models/{model}:generateContent")] HttpRequest req,
    string model, ILogger log)
{
    string apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
    string body = await new StreamReader(req.Body).ReadToEndAsync();
    
    var client = new HttpClient();
    var request = new HttpRequestMessage(HttpMethod.Post, 
        $"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={apiKey}");
    request.Content = new StringContent(body, Encoding.UTF8, "application/json");

    var response = await client.SendAsync(request);
    var responseBody = await response.Content.ReadAsStringAsync();

    return new ContentResult {
        Content = responseBody,
        ContentType = "application/json",
        StatusCode = (int)response.StatusCode
    };
}`}</pre>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-700">2. Configuration</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
          <li>Deploy to a VNet-integrated Function App.</li>
          <li>Configure <strong>Private Endpoints</strong> for internal access.</li>
          <li>Set <code className="bg-slate-100 px-1 rounded">GEMINI_API_KEY</code> in Application Settings.</li>
          <li>Whitelist the Function's outbound IP in your firewall.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-700">3. Benefits</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="font-semibold text-blue-800 text-xs uppercase mb-1">Security</p>
            <p className="text-xs text-blue-700 text-pretty">API Key is never exposed to the client-side network.</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="font-semibold text-green-800 text-xs uppercase mb-1">Compliance</p>
            <p className="text-xs text-green-700 text-pretty">Audit all outgoing LLM requests via Azure Logs.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AzureProxyGuide;
