import axios from 'axios';

// Gmail API configuration
const GMAIL_API_BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';

export class GmailService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Fetch emails based on query
  async fetchEmails(query: string, maxResults = 10) {
    try {
      const response = await axios.get(`${GMAIL_API_BASE_URL}/messages`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        },
        params: {
          q: query,
          maxResults
        }
      });

      // Get email details for each message
      const emails = await Promise.all(
        response.data.messages.map(async (message: { id: string }) => {
          return this.getEmailDetails(message.id);
        })
      );

      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails from Gmail');
    }
  }

  // Get detailed information about a specific email
  async getEmailDetails(messageId: string) {
    try {
      const response = await axios.get(`${GMAIL_API_BASE_URL}/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        },
        params: {
          format: 'full'
        }
      });

      // Parse email data
      const { payload, snippet, labelIds, internalDate } = response.data;
      const headers = this.getHeadersAsObject(payload.headers);
      
      return {
        id: messageId,
        threadId: response.data.threadId,
        snippet,
        body: this.getEmailBody(payload),
        subject: headers.subject || '(No Subject)',
        from: headers.from || '',
        to: headers.to || '',
        date: new Date(parseInt(internalDate)),
        isUnread: labelIds.includes('UNREAD'),
        attachments: this.getAttachments(payload)
      };
    } catch (error) {
      console.error('Error fetching email details:', error);
      throw new Error('Failed to fetch email details from Gmail');
    }
  }

  // Helper: Convert headers array to object
  private getHeadersAsObject(headers: Array<{ name: string; value: string }>) {
    return headers.reduce((acc, { name, value }) => {
      acc[name.toLowerCase()] = value;
      return acc;
    }, {} as Record<string, string>);
  }

  // Helper: Extract email body from payload
  private getEmailBody(payload: any) {
    if (payload.body.size > 0) {
      return this.decodeBase64(payload.body.data);
    }

    if (payload.parts) {
      const textPart = payload.parts.find((part: any) => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      
      if (textPart && textPart.body.data) {
        return this.decodeBase64(textPart.body.data);
      }
    }

    return '';
  }

  // Helper: Get attachments from email
  private getAttachments(payload: any) {
    const attachments: any[] = [];
    
    const processAttachments = (part: any) => {
      if (part.body.attachmentId) {
        attachments.push({
          id: part.body.attachmentId,
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size
        });
      }
      
      if (part.parts) {
        part.parts.forEach(processAttachments);
      }
    };
    
    if (payload.parts) {
      payload.parts.forEach(processAttachments);
    }
    
    return attachments;
  }

  // Helper: Decode base64 encoded string
  private decodeBase64(data: string) {
    return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
  }
}
