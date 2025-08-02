import { Client } from '@notionhq/client';

export class NotionService {
  private client: Client;

  constructor(apiKey: string) {
    this.client = new Client({ auth: apiKey });
  }

  // Create a new page in a database
  async createPage(databaseId: string, properties: any, content?: any) {
    try {
      const pageData: any = {
        parent: { database_id: databaseId },
        properties
      };

      // Add content blocks if provided
      if (content) {
        pageData.children = content;
      }

      const response = await this.client.pages.create(pageData);
      return response;
    } catch (error) {
      console.error('Error creating Notion page:', error);
      throw new Error('Failed to create page in Notion');
    }
  }

  // Get database schema to understand its properties
  async getDatabaseSchema(databaseId: string) {
    try {
      const response = await this.client.databases.retrieve({
        database_id: databaseId
      });
      
      return response.properties;
    } catch (error) {
      console.error('Error fetching database schema:', error);
      throw new Error('Failed to fetch Notion database schema');
    }
  }

  // Create formatted properties based on database schema
  formatProperties(schema: any, data: any) {
    const properties: any = {};
    
    Object.entries(schema).forEach(([name, property]: [string, any]) => {
      const propType = property.type;
      const value = data[name];
      
      if (value === undefined) return;
      
      switch (propType) {
        case 'title':
          properties[name] = {
            title: [{ text: { content: String(value) } }]
          };
          break;
        case 'rich_text':
          properties[name] = {
            rich_text: [{ text: { content: String(value) } }]
          };
          break;
        case 'number':
          properties[name] = { number: Number(value) };
          break;
        case 'select':
          properties[name] = { select: { name: String(value) } };
          break;
        case 'multi_select':
          properties[name] = {
            multi_select: Array.isArray(value) 
              ? value.map(item => ({ name: String(item) }))
              : [{ name: String(value) }]
          };
          break;
        case 'date':
          properties[name] = { date: { start: value } };
          break;
        case 'checkbox':
          properties[name] = { checkbox: Boolean(value) };
          break;
        // Add other types as needed
      }
    });
    
    return properties;
  }

  // Format content blocks for rich content
  formatContentBlocks(content: string) {
    // Split content by double newlines to create paragraphs
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map(paragraph => {
      if (paragraph.startsWith('# ')) {
        // Heading 1
        return {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ text: { content: paragraph.substring(2) } }]
          }
        };
      } else if (paragraph.startsWith('## ')) {
        // Heading 2
        return {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: paragraph.substring(3) } }]
          }
        };
      } else if (paragraph.startsWith('* ')) {
        // Bulleted list
        return {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: paragraph.substring(2) } }]
          }
        };
      } else {
        // Regular paragraph
        return {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ text: { content: paragraph } }]
          }
        };
      }
    });
  }
}
