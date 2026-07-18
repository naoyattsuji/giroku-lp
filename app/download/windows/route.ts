export async function GET(request: Request) {
  const installerUrl = process.env.WINDOWS_STORE_WEB_INSTALLER_URL?.trim();

  if (!installerUrl) {
    return Response.redirect(new URL("/#download", request.url), 307);
  }

  let destination: URL;
  try {
    destination = new URL(installerUrl);
  } catch {
    console.error("WINDOWS_STORE_WEB_INSTALLER_URL is not a valid URL");
    return Response.redirect(new URL("/#download", request.url), 307);
  }

  if (destination.protocol !== "https:") {
    console.error("WINDOWS_STORE_WEB_INSTALLER_URL must use HTTPS");
    return Response.redirect(new URL("/#download", request.url), 307);
  }

  const response = Response.redirect(destination, 307);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
