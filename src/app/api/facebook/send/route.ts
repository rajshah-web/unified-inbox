import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page_token, conversation_id, message_text } = body;

    if (!page_token || !conversation_id || !message_text) {
      return NextResponse.json(
        { error: "Missing required fields: page_token, conversation_id, message_text" },
        { status: 400 }
      );
    }

    // Use the Conversations API (POST /{conversation-id}/messages)
    // This is the Page Conversations endpoint — more reliable for inbox-style replies
    // compared to /me/messages which enforces strict 24h Messenger Platform policy
    const url = `https://graph.facebook.com/v19.0/${conversation_id}/messages?access_token=${page_token}`;
    
    const payload = {
      message: message_text,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Facebook Send Error:", JSON.stringify(data, null, 2));
      
      const errorMessage = data.error?.message || "Failed to send message";
      const errorCode = data.error?.code;
      
      return NextResponse.json(
        { error: errorMessage, code: errorCode },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error) {
    console.error("Global API Route Error (Send):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
