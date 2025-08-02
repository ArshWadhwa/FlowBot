import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Debug utility for API calls
export function logApiError(functionName: string, error: any) {
  console.group(`🚨 API Error: ${functionName}`);
  console.error("Error details:", error);
  if (error.message) {
    console.error("Message:", error.message);
  }
  if (error.status) {
    console.error("Status:", error.status);
  }
  console.groupEnd();
}

// Format date/time for better debugging
export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString();
}

// Gmail utilities
export function extractEmailMetadata(email: any) {
  return {
    id: email.id,
    subject:
      email.payload?.headers?.find((h: any) => h.name === "Subject")?.value ||
      "No Subject",
    from:
      email.payload?.headers?.find((h: any) => h.name === "From")?.value ||
      "Unknown Sender",
    date:
      email.payload?.headers?.find((h: any) => h.name === "Date")?.value ||
      new Date().toISOString(),
    snippet: email.snippet || "",
    body: extractEmailBody(email.payload),
  };
}

export function extractEmailBody(payload: any): string {
  if (!payload) return "";

  // Handle single part message
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  // Handle multipart message
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }

    // Fallback to HTML content
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        return stripHtml(decodeBase64(part.body.data));
      }
    }
  }

  return "";
}

function decodeBase64(data: string): string {
  try {
    return atob(data.replace(/-/g, "+").replace(/_/g, "/"));
  } catch (error) {
    console.error("Failed to decode base64:", error);
    return "";
  }
}

function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Notion utilities
export function formatNotionPage(
  title: string,
  content: string,
  tags: string[] = []
) {
  return {
    parent: { database_id: "" }, // Will be set by the workflow
    properties: {
      title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      tags: {
        multi_select: tags.map((tag) => ({ name: tag })),
      },
      source: {
        select: {
          name: "Gmail",
        },
      },
      created_time: {
        date: {
          start: new Date().toISOString(),
        },
      },
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: content,
              },
            },
          ],
        },
      },
    ],
  };
}

// LLM utilities
export function createEmailSummaryPrompt(email: any) {
  return `Please analyze this email and provide a structured summary:

Email Subject: ${email.subject}
From: ${email.from}
Date: ${email.date}

Email Content:
${email.body}

Please provide:
1. A concise summary (2-3 sentences)
2. Key action items (if any)
3. Priority level (High/Medium/Low)
4. Suggested tags (2-3 relevant keywords)

Format your response as JSON:
{
  "summary": "Brief summary here",
  "actionItems": ["item 1", "item 2"],
  "priority": "Medium",
  "tags": ["tag1", "tag2", "tag3"]
}`;
}

export function parseLLMResponse(response: string) {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response);
    return {
      summary: parsed.summary || response,
      actionItems: parsed.actionItems || [],
      priority: parsed.priority || "Medium",
      tags: parsed.tags || [],
    };
  } catch (error) {
    // Fallback to plain text
    return {
      summary: response,
      actionItems: [],
      priority: "Medium",
      tags: [],
    };
  }
}
