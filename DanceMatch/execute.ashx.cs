using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Data.SqlTypes;
using System.IO;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Configuration;
using System.Xml;

namespace DanceMatch
{
    public class Execute : IHttpHandler
    {
        private class Procedure
        {
            public static Procedure Create(Stream stream)
            {
                using (StreamReader reader = new StreamReader(stream, Encoding.UTF8))
                {
                    return JsonConvert.DeserializeObject<Procedure>(reader.ReadToEnd());
                }
            }
            [JsonProperty("name")]
            public string Name { get; set; }
            [JsonProperty("parameters")]
            public Dictionary<string, object> Parameters { get; set; }
            [JsonProperty("routeParams")]
            public Dictionary<string, object> RouteParams { get; set; }
            [JsonProperty("token")]
            public string Token { get; set; }
        }
        public string UserId(string Token)
        {
            try
            {
                string appId = "478292336279902", appSecret = "5ddfe1875c9e21a2cab811568a82bfcf";
                var uri = new Uri($"https://graph.facebook.com/debug_token?input_token={Token}&access_token={appId}|{appSecret}");
                using (WebResponse response = WebRequest.Create(uri).GetResponse())
                {
                    using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                    {
                        var payload = JsonConvert.DeserializeObject<dynamic>(reader.ReadToEnd());
                        return payload["data"]["user_id"];
                    }
                }
            }
            catch { return null; }
        }
        public void ProcessRequest(HttpContext context)
        {
            using (SqlConnection connection = new SqlConnection(WebConfigurationManager.ConnectionStrings[0].ConnectionString))
            {
                connection.Open();
                using (SqlTransaction transaction = connection.BeginTransaction(IsolationLevel.Serializable))
                {
                    var settings = new JsonSerializerSettings()
                    {
                        DateFormatHandling = DateFormatHandling.IsoDateFormat,
                        DateParseHandling = DateParseHandling.DateTimeOffset,
                        DateTimeZoneHandling = DateTimeZoneHandling.RoundtripKind,
                        Formatting = Newtonsoft.Json.Formatting.Indented,
                        NullValueHandling = NullValueHandling.Include,
                        StringEscapeHandling = StringEscapeHandling.EscapeNonAscii
                    };
                    context.Response.ContentEncoding = Encoding.UTF8;
                    context.Response.ContentType = "application/json";
                    try
                    {
                        var procedure = Procedure.Create(context.Request.InputStream);
                        using (SqlCommand command = new SqlCommand($"api{procedure.Name}", connection, transaction))
                        {
                            command.CommandType = CommandType.StoredProcedure;
                            SqlCommandBuilder.DeriveParameters(command);
                            foreach (SqlParameter parameter in command.Parameters)
                            {
                                var name = parameter.ParameterName.Substring(1);
                                if (name.ToLower() == "userid")
                                {
                                    var userId = UserId(procedure.Token);
                                    if (string.IsNullOrWhiteSpace(userId)) throw new HttpException((int)HttpStatusCode.Unauthorized, "Invalid token.");
                                    parameter.Value = userId;
                                }
                                else
                                {
                                    object value;
                                    if (procedure.RouteParams.ContainsKey(name))
                                        value = procedure.RouteParams[name];
                                    else if (procedure.Parameters.ContainsKey(name))
                                        value = procedure.Parameters[name];
                                    else
                                        value = null;
                                    if (value == null)
                                    {
                                        parameter.Value = null;
                                    }
                                    else if (parameter.SqlDbType == SqlDbType.Xml)
                                    {
                                        using (var reader = new XmlNodeReader(JsonConvert.DeserializeXmlNode(JsonConvert.SerializeObject(value, settings), "root")))
                                        {
                                            parameter.SqlValue = new SqlXml(reader);
                                        }
                                    }
                                    else parameter.Value = value;
                                }
                            }
                            using (SqlDataReader reader = command.ExecuteReader(CommandBehavior.SingleResult))
                            {
                                using (DataTable table = new DataTable())
                                {
                                    table.Load(reader);
                                    context.Response.StatusCode = (int)HttpStatusCode.OK;
                                    context.Response.Write(JsonConvert.SerializeObject(table, settings));
                                }
                            }
                        }
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        context.Response.Write(JsonConvert.SerializeObject(new { error = ex.Message }, settings));
                    }
                }
            }
        }
        public bool IsReusable => false;
    }
}