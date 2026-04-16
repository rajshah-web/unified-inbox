import { NextResponse } from "next/server";
import { type Conversation, type Page } from "@/store/useAppStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pages } = body as { pages: Page[] };

    if (!pages || !Array.isArray(pages)) {
      return NextResponse.json({ error: "Invalid payload. 'pages' must be an array." }, { status: 400 });
    }

    if (pages.length === 0) {
      return NextResponse.json({ conversations: [] }, { status: 200 });
    }

    // Use Promise.allSettled so one expired token doesn't break everything
    const fetchPromises = pages.map(async (page) => {
      const url = `https://graph.facebook.com/v19.0/${page.id}/conversations?fields=messages{message,from,to,created_time},participants,updated_time&access_token=${page.token}`;
      
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch for page ${page.id}: ${response.statusText}`);
      }
      
      const json = await response.json();
      
      // Normalize and format data
      if (!json.data) return [];

      return json.data.map((conv: any) => ({
        id: conv.id,
        page_id: page.id,
        page_name: page.name,
        messages: {
          data: (conv.messages?.data?.map((msg: any) => ({
            id: msg.id,
            text: msg.message,
            from: msg.from,
            to: msg.to,
            created_time: msg.created_time
          })) || []).reverse()
        },
        participants: conv.participants,
        updated_time: conv.updated_time || conv.messages?.data?.[0]?.created_time || new Date().toISOString()
      })) as Conversation[];
    });

    const results = await Promise.allSettled(fetchPromises);
    
    let allConversations: Conversation[] = [];
    let errors: string[] = [];

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        allConversations = [...allConversations, ...result.value];
      } else {
        console.error("Facebook API Sync Error:", result.reason);
        errors.push(result.reason?.message || "Unknown error occurred");
      }
    });

    // Sort flattened array descending by updated_time
    allConversations.sort((a, b) => {
      return new Date(b.updated_time).getTime() - new Date(a.updated_time).getTime();
    });

    return NextResponse.json({ 
      conversations: allConversations,
      errors: errors.length > 0 ? errors : undefined 
    }, { status: 200 });

  } catch (error) {
    console.error("Global API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
