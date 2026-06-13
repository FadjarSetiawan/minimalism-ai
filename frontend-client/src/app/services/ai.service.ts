import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface ChatResponse {
  success: boolean;
  reply?: string;
  imageUrl?: string;
  error?: string;
  creditsUsed?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private authService: AuthService) {}

  async sendUnifiedMessage(model: string, prompt: string, skill?: string): Promise<ChatResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return { success: false, error: 'Please sign in first.' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ model, prompt, skill })
      });

      const data = await response.json();

      if (response.status === 403) {
        return {
          success: false,
          error: data.error || 'Insufficient credits. Please upgrade your plan.'
        };
      }

      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed.' };
      }

      // Refresh user profile to update credits
      await this.authService.loadTokenAndUser();

      return {
        success: true,
        reply: data.reply,
        creditsUsed: data.creditsUsed
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return { success: false, error: 'Connection to server lost.' };
    }
  }

  async getModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      const data = await response.json();
      return data.models || [];
    } catch {
      return [];
    }
  }

  // --- AUTONOMOUS WORKSPACE SERVICE ACTIONS ---

  async getWorkspaceFiles(): Promise<any> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Please sign in first.');

    const response = await fetch(`${this.baseUrl}/workspace/files`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to scan workspace files.');
    }
    return response.json();
  }

  async writeWorkspaceFile(filePath: string, content: string): Promise<any> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Please sign in first.');

    const response = await fetch(`${this.baseUrl}/workspace/write`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ filePath, content })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to write file.');
    }
    return response.json();
  }

  async deleteWorkspaceFile(filePath: string): Promise<any> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Please sign in first.');

    const response = await fetch(`${this.baseUrl}/workspace/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ filePath })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete file.');
    }
    return response.json();
  }

  async executeWorkspaceCommand(command: string): Promise<any> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Please sign in first.');

    const response = await fetch(`${this.baseUrl}/workspace/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ command })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to run command.');
    }
    return response.json();
  }

  async generateWorkspaceCode(prompt: string, model: string): Promise<any> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Please sign in first.');

    const response = await fetch(`${this.baseUrl}/workspace/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt, model })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'AI generation pipeline failed.');
    }

    // Refresh user profile to update daily prompts limit
    await this.authService.loadTokenAndUser();

    return data;
  }

  async getChatHistory(segment: string): Promise<any[]> {
    const token = this.authService.getToken();
    if (!token) return [];
    try {
      const response = await fetch(`${this.baseUrl}/chat/history?segment=${segment}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.chats || [];
    } catch {
      return [];
    }
  }

  async saveChatHistory(id: string, segment: string, messages: any[], title?: string): Promise<boolean> {
    const token = this.authService.getToken();
    if (!token) return false;
    try {
      const response = await fetch(`${this.baseUrl}/chat/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, segment, messages, title })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async deleteChatHistory(id: string): Promise<boolean> {
    const token = this.authService.getToken();
    if (!token) return false;
    try {
      const response = await fetch(`${this.baseUrl}/chat/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async clearWorkspace(): Promise<boolean> {
    const token = this.authService.getToken();
    if (!token) return false;
    try {
      const response = await fetch(`${this.baseUrl}/workspace/clear`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

