using System.IO;
using System.Net;
using System.Text;
using System.Web;

namespace GPXParser
{
    /// <summary>
    /// This Proxy is not required if the file being used in your application is hosted on the same domain as the web application. 
    /// If accessing files from else where this proxy is needed to get around cross domain access issues.
    /// </summary>
    public class FileProxy : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            string url = context.Request.Url.OriginalString;
            int index = url.IndexOf("?url=") + 5;
            string source = url.Substring(index);
            context.Response.ContentType = "text/xml";
            context.Response.ContentEncoding = System.Text.Encoding.UTF8;

            HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(source);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            StreamReader stream = new StreamReader(response.GetResponseStream(), Encoding.ASCII);
            context.Response.Write(stream.ReadToEnd());
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}