import { NextResponse } from "next/server";

// This route exchanges a short-lived Page Token for a permanent (never-expiring) one
// Flow: Short-lived User Token → Long-lived User Token → Permanent Page Token
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { app_id, app_secret, short_lived_token, page_id } = body;

    if (!app_id || !app_secret || !short_lived_token || !page_id) {
      return NextResponse.json(
        { error: "Missing required fields: app_id, app_secret, short_lived_token, page_id" },
        { status: 400 }
      );
    }

    // Step 1: Exchange short-lived user token for long-lived user token
    const exchangeUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${app_id}&client_secret=${app_secret}&fb_exchange_token=${short_lived_token}`;

    const exchangeRes = await fetch(exchangeUrl, { cache: 'no-store' });
    const exchangeData = await exchangeRes.json();

    if (!exchangeRes.ok || !exchangeData.access_token) {
      console.error("Token exchange failed:", exchangeData);
      return NextResponse.json(
        { error: exchangeData.error?.message || "Failed to exchange token. Check your App ID and App Secret." },
        { status: 400 }
      );
    }

    const longLivedUserToken = exchangeData.access_token;

    // Step 2: Use the long-lived user token to get permanent page token
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedUserToken}`;
    
    const pagesRes = await fetch(pagesUrl, { cache: 'no-store' });
    const pagesData = await pagesRes.json();

    if (!pagesRes.ok || !pagesData.data) {
      console.error("Failed to fetch pages:", pagesData);
      return NextResponse.json(
        { error: pagesData.error?.message || "Failed to retrieve pages." },
        { status: 400 }
      );
    }

    // Find the specific page the user wants
    const targetPage = pagesData.data.find((p: any) => p.id === page_id);

    if (!targetPage) {
      return NextResponse.json(
        { 
          error: `Page ID "${page_id}" not found. Available pages: ${pagesData.data.map((p: any) => `${p.name} (${p.id})`).join(', ')}`,
          available_pages: pagesData.data.map((p: any) => ({ id: p.id, name: p.name }))
        },
        { status: 404 }
      );
    }

    // The page token returned from /me/accounts with a long-lived user token
    // is automatically a PERMANENT (never-expiring) page access token
    return NextResponse.json({
      success: true,
      permanent_token: targetPage.access_token,
      page_name: targetPage.name,
      page_id: targetPage.id,
    }, { status: 200 });

  } catch (error) {
    console.error("Token Exchange Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
