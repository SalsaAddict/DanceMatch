using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Configuration;

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
            public string Name { get; set; }
            public Dictionary<string, object> Parameters { get; set; }
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
                        Formatting = Formatting.Indented,
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
                            foreach (var parameter in procedure.Parameters)
                            {
                                command.Parameters.AddWithValue(parameter.Key, parameter.Value);
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